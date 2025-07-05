"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Plus, Edit2, Search, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  
  // State management
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  // Form states
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    temporaryPassword: '',
    isAdmin: false
  });
  
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    isAdmin: false,
    newPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  // UI states
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users when search term changes
  useEffect(() => {
    if (searchTerm === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.system_role.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

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

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiCall('/api/admin/users');
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
        setFilteredUsers(data);
      } else {
        showMessage('Failed to fetch users', 'error');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      showMessage('Error loading users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      const response = await apiCall('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify(createForm)
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('User created successfully!');
        setShowCreateModal(false);
        setCreateForm({ name: '', email: '', temporaryPassword: '', isAdmin: false });
        fetchUsers();
      } else {
        showMessage(data.error || 'Failed to create user', 'error');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      showMessage('Error creating user', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      // Update user details
      const updateData = {
        name: editForm.name,
        email: editForm.email,
        isAdmin: editForm.isAdmin
      };

      const response = await apiCall(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (response.ok) {
        let successMessage = 'User updated successfully!';
        
        // If password was provided, reset it
        if (editForm.newPassword.trim()) {
          const passwordResponse = await apiCall(`/api/admin/users/${editingUser.id}/reset-password`, {
            method: 'POST',
            body: JSON.stringify({ newPassword: editForm.newPassword })
          });

          if (passwordResponse.ok) {
            successMessage += ' Password reset successfully.';
          } else {
            const passwordData = await passwordResponse.json();
            showMessage(`User updated, but password reset failed: ${passwordData.error}`, 'error');
            setShowEditModal(false);
            fetchUsers();
            return;
          }
        }

        showMessage(successMessage);
        setShowEditModal(false);
        setEditingUser(null);
        setEditForm({ name: '', email: '', isAdmin: false, newPassword: '' });
        fetchUsers();
      } else {
        showMessage(data.error || 'Failed to update user', 'error');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      showMessage('Error updating user', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await apiCall(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('User deleted successfully!');
        fetchUsers();
      } else {
        showMessage(data.error || 'Failed to delete user', 'error');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      showMessage('Error deleting user', 'error');
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      isAdmin: user.system_role === 'admin',
      newPassword: ''
    });
    setShowEditModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-white rounded-lg p-6 space-y-6">
      {/* Header Section - Match Framework Style */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Manage Users</h1>
          <p className="text-gray-600">Create and manage user accounts and permissions</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Search Box */}
          <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-gray-300 shadow-sm">
            <Search className="w-4 h-4 text-gray-500" />
            <Input
              placeholder="Search users..."
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
            Create User
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

      {/* Users List - Match Framework Card Style */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {searchTerm ? 'No users match your search.' : 'No users found.'}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <div key={user.id} className="py-6 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-6">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                          <p className="text-gray-600">{user.email}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            Last login: {formatDate(user.last_login)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            user.system_role === 'admin' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {user.system_role}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            user.active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user.active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => openEditModal(user)}
                        className="bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-2 px-4 py-2"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Create New User</h2>
            </div>
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div>
                <Label htmlFor="create-name">Full Name</Label>
                <Input
                  id="create-name"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="create-email">Email</Label>
                <Input
                  id="create-email"
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({...createForm, email: e.target.value})}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="create-password">Initial Password</Label>
                <div className="relative mt-1">
                  <Input
                    id="create-password"
                    type={showPassword ? 'text' : 'password'}
                    value={createForm.temporaryPassword}
                    onChange={(e) => setCreateForm({...createForm, temporaryPassword: e.target.value})}
                    required
                    minLength={6}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-1">User will be required to change password on first login</p>
              </div>
              <div className="flex items-center">
                <input
                  id="create-admin"
                  type="checkbox"
                  checked={createForm.isAdmin}
                  onChange={(e) => setCreateForm({...createForm, isAdmin: e.target.checked})}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300"
                />
                <Label htmlFor="create-admin" className="ml-2">Admin user?</Label>
              </div>
              <div className="flex gap-3 pt-4">
                <Button 
                  type="submit" 
                  disabled={actionLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {actionLoading ? 'Creating...' : 'Create User'}
                </Button>
                <Button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Edit User: {editingUser.name}</h2>
            </div>
            <form onSubmit={handleEditUser} className="p-6 space-y-4">
              <div>
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-password">New Password (optional)</Label>
                <div className="relative mt-1">
                  <Input
                    id="edit-password"
                    type={showNewPassword ? 'text' : 'password'}
                    value={editForm.newPassword}
                    onChange={(e) => setEditForm({...editForm, newPassword: e.target.value})}
                    minLength={6}
                    className="pr-10"
                    placeholder="Leave blank to keep current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {editForm.newPassword && (
                  <p className="text-sm text-gray-600 mt-1">User will be required to change password on next login</p>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="edit-admin"
                    type="checkbox"
                    checked={editForm.isAdmin}
                    onChange={(e) => setEditForm({...editForm, isAdmin: e.target.checked})}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300"
                  />
                  <Label htmlFor="edit-admin" className="ml-2">Admin user?</Label>
                </div>
                <div className="flex items-center">
                  <input
                    id="delete-user"
                    type="checkbox"
                    checked={false}
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleDeleteUser(editingUser.id, editingUser.name);
                      }
                    }}
                    className="h-4 w-4 text-red-600 rounded border-gray-300"
                    disabled={editingUser.id === currentUser.id}
                  />
                  <Label htmlFor="delete-user" className="ml-2 text-red-600">Delete user?</Label>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button 
                  type="submit" 
                  disabled={actionLoading}
                  className="flex-1 bg-orange-600 hover:bg-orange-700"
                >
                  {actionLoading ? 'Updating...' : 'Update User'}
                </Button>
                <Button 
                  type="button" 
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}