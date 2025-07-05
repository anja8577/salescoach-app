"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Plus, Edit2, Search, UserCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminTeams() {
  const { user: currentUser } = useAuth();
  
  // State management
  const [teams, setTeams] = useState([]);
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  
  // Form states
  const [teamName, setTeamName] = useState('');
  const [selectedCoaches, setSelectedCoaches] = useState([]);
  const [selectedCoachees, setSelectedCoachees] = useState([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  
  // UI states
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch teams and users on component mount
  useEffect(() => {
    fetchTeams();
    fetchUsers();
  }, []);

  // Filter teams when search term changes
  useEffect(() => {
    if (searchTerm === '') {
      setFilteredTeams(teams);
    } else {
      const filtered = teams.filter(team => 
        team.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTeams(filtered);
    }
  }, [searchTerm, teams]);

  // Filter users for modal when user search term changes
  useEffect(() => {
    if (userSearchTerm === '') {
      setFilteredUsers(allUsers);
    } else {
      const filtered = allUsers.filter(user => 
        user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(userSearchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [userSearchTerm, allUsers]);

  const showMessage = (text, type = 'success') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 4000);
  };

  const apiCall = async (url, options = {}) => {
    const token = localStorage.getItem('auth_token');
    return fetch(`http://localhost:5000${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      }
    });
  };

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await apiCall('/api/admin/teams');
      
      if (response.ok) {
        const data = await response.json();
        setTeams(data);
        setFilteredTeams(data);
      } else {
        showMessage('Failed to fetch teams', 'error');
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
      showMessage('Error loading teams', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await apiCall('/api/admin/users');
      
      if (response.ok) {
        const data = await response.json();
        setAllUsers(data);
        setFilteredUsers(data);
      } else {
        console.error('Failed to fetch users for team assignment');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      // Create team
      const response = await apiCall('/api/admin/teams', {
        method: 'POST',
        body: JSON.stringify({ name: teamName })
      });

      const data = await response.json();

      if (response.ok) {
        const teamId = data.team.id;
        
        // Add coaches
        for (const coachId of selectedCoaches) {
          await apiCall('/api/admin/teams/' + teamId + '/members', {
            method: 'POST',
            body: JSON.stringify({ user_id: coachId, team_role: 'coach' })
          });
        }

        // Add coachees
        for (const coacheeId of selectedCoachees) {
          await apiCall('/api/admin/teams/' + teamId + '/members', {
            method: 'POST',
            body: JSON.stringify({ user_id: coacheeId, team_role: 'coachee' })
          });
        }

        showMessage('Team created successfully!');
        setShowCreateModal(false);
        resetModal();
        fetchTeams();
      } else {
        showMessage(data.error || 'Failed to create team', 'error');
      }
    } catch (error) {
      console.error('Error creating team:', error);
      showMessage('Error creating team', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditTeam = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      // Update team name
      const response = await apiCall(`/api/admin/teams/${editingTeam.id}`, {
        method: 'PUT',
        body: JSON.stringify({ name: teamName })
      });

      if (response.ok) {
        // Remove all existing members
        for (const member of editingTeam.members) {
          await apiCall(`/api/admin/teams/${editingTeam.id}/members/${member.user_id}`, {
            method: 'DELETE'
          });
        }

        // Add new coaches
        for (const coachId of selectedCoaches) {
          await apiCall(`/api/admin/teams/${editingTeam.id}/members`, {
            method: 'POST',
            body: JSON.stringify({ user_id: coachId, team_role: 'coach' })
          });
        }

        // Add new coachees
        for (const coacheeId of selectedCoachees) {
          await apiCall(`/api/admin/teams/${editingTeam.id}/members`, {
            method: 'POST',
            body: JSON.stringify({ user_id: coacheeId, team_role: 'coachee' })
          });
        }

        showMessage('Team updated successfully!');
        setShowEditModal(false);
        resetModal();
        fetchTeams();
      } else {
        const data = await response.json();
        showMessage(data.error || 'Failed to update team', 'error');
      }
    } catch (error) {
      console.error('Error updating team:', error);
      showMessage('Error updating team', 'error');
    } finally {
      setActionLoading(false);
    }
  };

const handleDeleteTeam = async (teamId, teamName) => {
  if (!confirm(`Are you sure you want to delete team "${teamName}"? This action cannot be undone.`)) {
    return;
  }

  try {
    const response = await apiCall(`/api/admin/teams/${teamId}`, {
      method: 'DELETE'
    });

    const data = await response.json();

    if (response.ok) {
      showMessage('Team deleted successfully!');
      // Close the edit modal and reset form state
      setShowEditModal(false);
      resetModal();
      fetchTeams();
    } else {
      showMessage(data.error || 'Failed to delete team', 'error');
    }
  } catch (error) {
    console.error('Error deleting team:', error);
    showMessage('Error deleting team', 'error');
  }
};

  const openEditModal = (team) => {
    setEditingTeam(team);
    setTeamName(team.name);
    setSelectedCoaches(team.members.filter(m => m.role === 'coach').map(m => m.user_id));
    setSelectedCoachees(team.members.filter(m => m.role === 'coachee').map(m => m.user_id));
    setShowEditModal(true);
  };

  const resetModal = () => {
    setTeamName('');
    setSelectedCoaches([]);
    setSelectedCoachees([]);
    setUserSearchTerm('');
    setEditingTeam(null);
  };

  const toggleCoach = (userId) => {
    setSelectedCoaches(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleCoachee = (userId) => {
    setSelectedCoachees(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-white rounded-lg p-6 space-y-6">
      {/* Header Section - Match Users Style */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Manage Teams</h1>
          <p className="text-gray-600">Create and manage sales teams and member assignments</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Search Box */}
          <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-gray-300 shadow-sm">
            <Search className="w-4 h-4 text-gray-500" />
            <Input
              placeholder="Search teams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-0 focus:ring-0 bg-transparent w-64"
            />
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 px-6 py-3"
          >
            <Plus className="w-5 h-5" />
            Create Team
          </Button>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`p-4 rounded-xl border-l-4 shadow-lg ${
          messageType === 'error' 
            ? 'bg-red-50 border-l-red-500 text-red-700' 
            : 'bg-green-50 border-l-green-500 text-green-700'
        }`}>
          <div className="flex items-center">
            <div className={`w-6 h-6 rounded-full mr-3 flex items-center justify-center ${
              messageType === 'error' ? 'bg-red-100' : 'bg-green-100'
            }`}>
              {messageType === 'error' ? '⚠️' : '✅'}
            </div>
            <span className="font-medium">{message}</span>
          </div>
        </div>
      )}

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading teams...</p>
          </div>
        ) : filteredTeams.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            {searchTerm ? 'No teams match your search.' : 'No teams found.'}
          </div>
        ) : (
          filteredTeams.map((team) => (
            <div key={team.id} className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{team.name}</h3>
                  <Button
                    onClick={() => openEditModal(team)}
                    className="bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-2 px-3 py-2"
                    size="sm"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {/* Coaches */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <UserCheck className="w-4 h-4" />
                      Coaches ({team.coach_count})
                    </h4>
                    <div className="space-y-1">
                      {team.members.filter(m => m.role === 'coach').length > 0 ? (
                        team.members.filter(m => m.role === 'coach').map(member => (
                          <div key={member.user_id} className="flex items-center gap-2">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                              {member.name}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">No coaches assigned</p>
                      )}
                    </div>
                  </div>

                  {/* Coachees */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Coachees ({team.coachee_count})
                    </h4>
                    <div className="space-y-1">
                      {team.members.filter(m => m.role === 'coachee').length > 0 ? (
                        team.members.filter(m => m.role === 'coachee').map(member => (
                          <div key={member.user_id} className="flex items-center gap-2">
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                              {member.name}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">No coachees assigned</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    {/* Create Team Modal */}
    {showCreateModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Create New Team</h2>
          </div>
          <div className="p-6 space-y-4 flex-1 overflow-y-auto">
            <div>
              <Label htmlFor="team-name">Team Name</Label>
              <Input
                id="team-name"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                required
                className="mt-1"
              />
            </div>

            {/* User Search */}
            <div>
              <Label>Search Users</Label>
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border mt-1">
                <Search className="w-4 h-4 text-gray-500" />
                <Input
                  placeholder="Search users by name or email..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="border-0 focus:ring-0 bg-transparent"
                />
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-2 gap-6 mt-6">
              {/* Coaches Column */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <UserCheck className="w-5 h-5" />
                  Coaches ({selectedCoaches.length})
                </h3>
                <div className="border border-gray-200 rounded-lg h-48 overflow-y-auto">
                  <div className="space-y-1 p-2">
                    {filteredUsers.map(user => (
                      <div key={`coach-${user.id}`} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                        <input
                          type="checkbox"
                          checked={selectedCoaches.includes(user.id)}
                          onChange={() => toggleCoach(user.id)}
                          className="h-4 w-4 text-blue-600 rounded border-gray-300"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Coachees Column */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Coachees ({selectedCoachees.length})
                </h3>
                <div className="border border-gray-200 rounded-lg h-48 overflow-y-auto">
                  <div className="space-y-1 p-2">
                    {filteredUsers.map(user => (
                      <div key={`coachee-${user.id}`} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                        <input
                          type="checkbox"
                          checked={selectedCoachees.includes(user.id)}
                          onChange={() => toggleCoachee(user.id)}
                          className="h-4 w-4 text-green-600 rounded border-gray-300"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fixed Bottom Buttons */}
          <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <Button 
              onClick={handleCreateTeam}
              disabled={actionLoading || !teamName.trim()}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {actionLoading ? 'Creating...' : 'Create Team'}
            </Button>
            <Button 
              type="button" 
              onClick={() => { setShowCreateModal(false); resetModal(); }}
              className="flex-1 bg-gray-500 hover:bg-gray-600"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    )}

    {/* Edit Team Modal */}
    {showEditModal && editingTeam && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Edit Team: {editingTeam.name}</h2>
          </div>
          <div className="p-6 space-y-4 flex-1 overflow-y-auto">
            <div>
              <Label htmlFor="edit-team-name">Team Name</Label>
              <Input
                id="edit-team-name"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                required
                className="mt-1"
              />
            </div>

            {/* User Search */}
            <div>
              <Label>Search Users</Label>
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border mt-1">
                <Search className="w-4 h-4 text-gray-500" />
                <Input
                  placeholder="Search users by name or email..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="border-0 focus:ring-0 bg-transparent"
                />
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-2 gap-6 mt-6">
              {/* Coaches Column */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <UserCheck className="w-5 h-5" />
                  Coaches ({selectedCoaches.length})
                </h3>
                <div className="border border-gray-200 rounded-lg h-48 overflow-y-auto">
                  <div className="space-y-1 p-2">
                    {filteredUsers.map(user => (
                      <div key={`edit-coach-${user.id}`} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                        <input
                          type="checkbox"
                          checked={selectedCoaches.includes(user.id)}
                          onChange={() => toggleCoach(user.id)}
                          className="h-4 w-4 text-blue-600 rounded border-gray-300"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Coachees Column */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Coachees ({selectedCoachees.length})
                </h3>
                <div className="border border-gray-200 rounded-lg h-48 overflow-y-auto">
                  <div className="space-y-1 p-2">
                    {filteredUsers.map(user => (
                      <div key={`edit-coachee-${user.id}`} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                        <input
                          type="checkbox"
                          checked={selectedCoachees.includes(user.id)}
                          onChange={() => toggleCoachee(user.id)}
                          className="h-4 w-4 text-green-600 rounded border-gray-300"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Delete Option */}
            <div className="border-t border-gray-200 pt-4 mt-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <strong>Danger Zone:</strong> This action cannot be undone.
                </div>
                <Button
                  onClick={() => handleDeleteTeam(editingTeam.id, editingTeam.name)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2"
                  type="button"
                >
                  Delete Team
                </Button>
              </div>
            </div>

            {/* Fixed Bottom Buttons */}
            <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <Button 
                onClick={handleEditTeam}
                disabled={actionLoading || !teamName.trim()}
                className="flex-1 bg-orange-600 hover:bg-orange-700"
              >
                {actionLoading ? 'Updating...' : 'Update Team'}
              </Button>
              <Button 
                type="button" 
                onClick={() => { setShowEditModal(false); resetModal(); }}
                className="flex-1 bg-gray-500 hover:bg-gray-600"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
  );
}