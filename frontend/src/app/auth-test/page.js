// frontend/src/app/auth-test/page.js
"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

export default function AuthTestPage() {
  const { user, loading, login, logout, isAdmin, isCoach, isSalesRep } = useAuth();
  const [email, setEmail] = useState('anja@akticon.net');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    const result = await login(email, password);
    if (!result.success) {
      setError(result.error);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Auth Test Page</h1>
      
      {user ? (
        <div className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <h2 className="font-semibold text-green-800">✅ Logged In</h2>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.system_role}</p>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800">Role Check:</h3>
            <p>Is Admin: {isAdmin() ? '✅ Yes' : '❌ No'}</p>
            <p>Is Coach: {isCoach() ? '✅ Yes' : '❌ No'}</p>
            <p>Is Sales Rep: {isSalesRep() ? '✅ Yes' : '❌ No'}</p>
          </div>
          
          <button 
            onClick={logout}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h2 className="font-semibold text-yellow-800">⚠️ Not Logged In</h2>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded">
                {error}
              </div>
            )}
            
            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
            >
              Login
            </button>
          </form>
        </div>
      )}
    </div>
  );
}