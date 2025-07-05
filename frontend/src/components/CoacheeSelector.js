"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function CoacheeSelector({ isOpen, onClose, onSelectCoachee }) {
  const { user, getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [teams, setTeams] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null); // Will store either user.id for self or coachee.id

  // Fetch eligible coachees when modal opens
  useEffect(() => {
    if (isOpen && user) {
      fetchEligibleCoachees();
    }
  }, [isOpen, user]);

  const fetchEligibleCoachees = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token');
      }
      
      console.log('Fetching eligible coachees...');
      const response = await fetch('http://localhost:5000/api/coaching/eligible-coachees', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch coachees');
      }
      
      const data = await response.json();
      console.log('Eligible coachees response:', data);
      setTeams(data.teams || []);
      
    } catch (error) {
      console.error('Error fetching coachees:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStartSession = async () => {
    if (!user || !selectedUser) {
      setError('Please select someone to coach');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token');
      }
      
      console.log('Creating coaching session for coachee:', selectedUser);
      
      // Create the coaching session
      const response = await fetch('http://localhost:5000/api/coaching-sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          coachee_id: selectedUser,
          framework_id: '7b5dbd81-bc61-48d7-8d39-bb46d4d00d74' // Your existing framework
        })
      });
      
      console.log('Session creation response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create session');
      }
      
      const sessionData = await response.json();
      console.log('Session created successfully:', sessionData);
      
      // Determine if it's self-coaching and get the name
      const isSelfCoaching = selectedUser === user.id;
      const coacheeName = isSelfCoaching ? user.name : getCoacheeName(selectedUser);
      
      // Call the callback with session info
      onSelectCoachee({
        sessionId: sessionData.session_id,
        coacheeId: selectedUser,
        coacheeName: coacheeName,
        isSelfCoaching: isSelfCoaching
      });
      
    } catch (error) {
      console.error('Error creating session:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getOrderedCoachees = () => {
    // Group coachees by team, then flatten with team names
    const coacheesByTeam = [];
    
    teams.forEach(team => {
      team.coachees.forEach(coachee => {
        // Check if this coachee is already added (in case they're in multiple teams)
        if (!coacheesByTeam.find(c => c.id === coachee.id)) {
          coacheesByTeam.push({
            ...coachee,
            teamName: team.name,
            displayName: `${coachee.name} (${team.name})`
          });
        }
      });
    });
    
    // Sort by team name, then by coachee name
    return coacheesByTeam.sort((a, b) => {
      if (a.teamName !== b.teamName) {
        return a.teamName.localeCompare(b.teamName);
      }
      return a.name.localeCompare(b.name);
    });
  };

  const handleUserSelection = (userId) => {
    if (selectedUser === userId) {
      // Uncheck if already selected
      setSelectedUser(null);
    } else {
      // Select this user (automatic switching)
      setSelectedUser(userId);
    }
  };

  const hasCoachees = teams.length > 0 && teams.some(team => team.coachees.length > 0);

  const getCoacheeName = (coacheeId) => {
    for (const team of teams) {
      const coachee = team.coachees.find(c => c.id === coacheeId);
      if (coachee) return coachee.name;
    }
    return 'Unknown';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Start Coaching Session</h2>
          <p className="text-sm text-gray-600 mt-1">Choose who you'd like to coach</p>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-2">{error}</p>
              <button 
                onClick={fetchEligibleCoachees}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              {/* Self-Coaching Box */}
              <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-gray-900">Self-Coaching</h3>
                <label 
                  className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded"
                  onClick={() => handleUserSelection(user.id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedUser === user.id}
                    onChange={() => {}} // Handled by label click
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className={`ml-3 ${selectedUser === user.id ? 'font-bold text-gray-900' : 'text-gray-700'}`}>
                    {user?.name}
                  </span>
                </label>
              </div>

              {/* Coach Someone Else Box - Only show if there are coachees */}
              {hasCoachees && (
                <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold text-gray-900">Coach Someone Else</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {getOrderedCoachees().map(coachee => (
                      <label 
                        key={coachee.id}
                        className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded"
                        onClick={() => handleUserSelection(coachee.id)}
                      >
                        <input
                          type="checkbox"
                          checked={selectedUser === coachee.id}
                          onChange={() => {}} // Handled by label click
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className={`ml-3 ${selectedUser === coachee.id ? 'font-bold text-gray-900' : 'text-gray-700'}`}>
                          {coachee.displayName}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleStartSession}
            disabled={loading || !selectedUser}
            className={`flex-1 px-4 py-2 rounded-md transition-colors ${
              selectedUser && !loading
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {loading ? 'Creating...' : 'Start Session'}
          </button>
        </div>
      </div>
    </div>
  );
}