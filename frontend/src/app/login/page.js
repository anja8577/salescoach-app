// frontend/src/app/login/page.js
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('anja@akticon.net');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  
  const { login, user } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    const result = await login(email, password);
    
    if (!result.success) {
      setError(result.error || 'Login failed');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <img 
                src="/images/salescoach-icon.png" 
                alt="SalesCoach"
                className="w-12 h-12 mr-3"
              />
              <h1 className="text-2xl font-bold text-gray-900">SalesCoach</h1>
            </div>
            <h2 className="text-xl text-gray-900 mb-2">Welcome to SalesCoach</h2>
            <p className="text-gray-600">Sign in to your account or create a new one</p>
          </div>

          {/* Tab Navigation */}
          <div className="flex mb-6">
            <button
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                !isSignUp 
                  ? 'text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={{ 
                borderRadius: '8px 0 0 8px',
                backgroundColor: !isSignUp ? '#11339b' : undefined
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                isSignUp 
                  ? 'text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={{ 
                borderRadius: '0 8px 8px 0',
                backgroundColor: isSignUp ? '#11339b' : undefined
              }}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 px-4 border border-gray-300 rounded-lg transition-all"
                style={{
                  focusRingColor: '#11339b',
                  focusBorderColor: '#11339b'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#11339b';
                  e.target.style.boxShadow = '0 0 0 2px rgba(17, 51, 155, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
                placeholder=""
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 px-4 pr-12 border border-gray-300 rounded-lg transition-all"
                  style={{
                    focusRingColor: '#11339b',
                    focusBorderColor: '#11339b'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#11339b';
                    e.target.style.boxShadow = '0 0 0 2px rgba(17, 51, 155, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder=""
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Sign Up Fields (when Sign Up is selected) */}
            {isSignUp && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  Sign up is not available yet. Please use existing credentials to sign in.
                </p>
              </div>
            )}

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading || isSignUp}
              className={`w-full h-12 rounded-lg text-white font-medium transition-all ${
                loading || isSignUp
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'hover:opacity-90'
              }`}
              style={{
                backgroundColor: loading || isSignUp ? undefined : '#11339b'
              }}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>

            {/* Forgot Password */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => alert('Please contact your administrator to reset your password')}
                className="font-medium transition-colors hover:opacity-80"
                style={{ color: '#11339b' }}
              >
                Forgot your password?
              </button>
            </div>
          </form>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 rounded-lg border" style={{ backgroundColor: '#f0f4ff', borderColor: '#c7d2fe' }}>
          <h3 className="text-sm font-medium mb-2" style={{ color: '#11339b' }}>Demo Credentials</h3>
          <div className="text-xs space-y-1" style={{ color: '#1e40af' }}>
            <div>Admin: anja@akticon.net / admin123</div>
            <div>User: croatia_eln@akticon.net / croatia123</div>
            <div>User: info@akticon.net / test123</div>
          </div>
        </div>
      </div>
    </div>
  );
}