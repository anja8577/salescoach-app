// Replace the top part of your profile page with this:
"use client";

import { useState, useEffect } from 'react';
import LayoutApp from '@/components/LayoutApp';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, LogOut, User, Edit2, Check, X, Shield, Key, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext'; // NEW: Import AuthContext

export default function Profile() {
  // NEW: Use AuthContext instead of localStorage
  const { user: currentUser, logout: authLogout, loading: authLoading, updateUser, changePassword, isAdmin } = useAuth();
  
  // If not authenticated, show login prompt
  if (authLoading) {
    return (
      <LayoutApp>
        <div className="max-w-4xl mx-auto flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </LayoutApp>
    );
  }

  if (!currentUser) {
    return (
      <LayoutApp>
        <div className="max-w-4xl mx-auto">
          <Card className="border-l-4 border-l-blue-500 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
              <CardTitle className="flex items-center gap-3">
                <User className="w-6 h-6" />
                Authentication Required
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-600 mb-4">Please log in to access your profile.</p>
              <Button 
                onClick={() => window.location.href = '/login'} 
                className="bg-blue-600 hover:bg-blue-700"
              >
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </LayoutApp>
    );
  }

  // NEW: Use AuthContext user data
  const isAdminUser = isAdmin();

  // Profile editing states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [name, setName] = useState(currentUser.name || "");
  const [email, setEmail] = useState(currentUser.email || "");

  // Password change states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" or "error"

  const showMessage = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 3000);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await updateUser({ name, email });
      
      if (result.success) {
        showMessage("Profile updated successfully!");
        setIsEditingProfile(false);
      } else {
        showMessage(result.error || "Failed to update profile", "error");
      }
    } catch (error) {
      console.error('Profile update error:', error);
      showMessage("An error occurred. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setName(currentUser.name || "");
    setEmail(currentUser.email || "");
    setIsEditingProfile(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      showMessage("New password and confirmation don't match.", "error");
      return;
    }

    if (newPassword.length < 6) {
      showMessage("Password must be at least 6 characters long.", "error");
      return;
    }

    setLoading(true);

    try {
      const result = await changePassword(currentPassword, newPassword);
      
      if (result.success) {
        showMessage("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        showMessage(result.error || "Failed to change password", "error");
      }
    } catch (error) {
      console.error('Password change error:', error);
      showMessage("An error occurred. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  // NEW: Use AuthContext logout
  const handleLogout = () => {
    authLogout(); // This will clear tokens and redirect to login
  };

  const handleAccessAdmin = () => {
    window.location.href = "/admin/frameworks";
  };

  // Keep the rest of your component exactly the same...
  return (
    <LayoutApp>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Clean Page Header */}
        <div className="text-center bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
          <p className="text-gray-600">Manage your account information and preferences</p>
        </div>

        {/* Enhanced Message Display */}
        {message && (
          <div className={`p-4 rounded-xl border-l-4 shadow-lg transform transition-all duration-300 ${
            messageType === "error" 
              ? "bg-red-50 border-l-red-500 text-red-700 shadow-red-100" 
              : "bg-green-50 border-l-green-500 text-green-700 shadow-green-100"
          }`}>
            <div className="flex items-center">
              <div className={`w-6 h-6 rounded-full mr-3 flex items-center justify-center ${
                messageType === "error" ? "bg-red-100" : "bg-green-100"
              }`}>
                {messageType === "error" ? "⚠️" : "✅"}
              </div>
              <span className="font-medium">{message}</span>
            </div>
          </div>
        )}

        {/* Enhanced Account Information Card */}
        <Card className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl">Account Information</span>
              </CardTitle>
              {!isEditingProfile && (
                <Button
                  onClick={() => setIsEditingProfile(true)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {isEditingProfile ? (
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-base font-semibold text-gray-700">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="h-12 border-2 focus:border-blue-500 rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base font-semibold text-gray-700">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 border-2 focus:border-blue-500 rounded-lg"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white flex-1"
                  >
                    <Check className="w-4 h-4" />
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button 
                    type="button" 
                    onClick={handleCancelEdit}
                    className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white flex-1"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-base font-semibold text-gray-700">Full Name</Label>
                  <div className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border-l-4 border-l-blue-400 text-gray-900 font-medium">
                    {currentUser.name || "Not provided"}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-base font-semibold text-gray-700">Email Address</Label>
                  <div className="p-4 bg-gradient-to-r from-gray-50 to-purple-50 rounded-lg border-l-4 border-l-purple-400 text-gray-900 font-medium">
                    {currentUser.email || "Not provided"}
                  </div>
                </div>
                {currentUser.system_role && (
                  <div className="space-y-2">
                    <Label className="text-base font-semibold text-gray-700">Role</Label>
                    <div className="p-4 bg-gradient-to-r from-gray-50 to-green-50 rounded-lg border-l-4 border-l-green-400 text-gray-900 font-medium capitalize">
                      {currentUser.system_role}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Password Card */}
        <Card className="border-l-4 border-l-orange-500 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 rounded-t-lg">
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <Key className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl">Change Password</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleChangePassword} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="current-password" className="text-base font-semibold text-gray-700">Current Password</Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="h-12 border-2 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 rounded-lg pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-base font-semibold text-gray-700">New Password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    className="h-12 border-2 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 rounded-lg pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-base font-semibold text-gray-700">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="h-12 border-2 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 rounded-lg pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white h-12 text-base font-semibold"
              >
                {loading ? "Changing..." : "Update Password"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Enhanced Admin Access */}
        {isAdminUser && (
          <Card className="border-l-4 border-l-purple-500 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg">
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl">Admin Access</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-600 mb-6 text-base">
                Access administrative functions including user management, team management, and framework configuration.
              </p>
              <Button
                onClick={handleAccessAdmin}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white h-12 text-base font-semibold"
              >
                <Settings className="w-5 h-5 mr-2" />
                Access Admin Module
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Logout Section */}
        <Card className="border-l-4 border-l-red-500 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg">
          <div className="p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                  <LogOut className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">Sign Out</h3>
                  <p className="text-gray-600 mt-1">
                    Sign out of your account and return to the home page.
                  </p>
                </div>
              </div>
              <Button
                onClick={handleLogout}
                className="mt-6 sm:mt-0 w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white h-12 px-8 text-base font-semibold"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </LayoutApp>
  );
}