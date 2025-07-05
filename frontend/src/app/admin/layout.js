"use client";

import { useAuth } from '@/contexts/AuthContext';
import LayoutAdmin from "@/components/LayoutAdmin";
import { Card, CardContent } from '@/components/ui/card';

export default function AdminLayout({ children }) {
  const { user: currentUser, isAdmin, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <LayoutAdmin>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </LayoutAdmin>
    );
  }

  // Block access for non-admin users
  if (!currentUser || !isAdmin()) {
    return (
      <LayoutAdmin>
        <div className="flex items-center justify-center min-h-96">
          <Card className="border-l-4 border-l-red-500 shadow-lg">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-red-600 text-2xl">🔒</span>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
                <p className="text-red-600 mb-4">Admin privileges required to access this area.</p>
                <button 
                  onClick={() => window.history.back()} 
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                >
                  Go Back
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </LayoutAdmin>
    );
  }

  // Render admin content for authorized users
  return <LayoutAdmin>{children}</LayoutAdmin>;
}