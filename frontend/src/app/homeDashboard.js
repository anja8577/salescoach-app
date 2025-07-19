import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, Users, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';

export default function HomeDashboard({ sessions, user, loading, error, searchTerm, setSearchTerm, showCoach, setShowCoach, showCoachee, setShowCoachee, showSelf, setShowSelf }) {
  // Dashboard stats
  const totalSessions = sessions.length;
  const recentActivity = sessions.length > 0 ? sessions[0].session_date : null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* My Sessions */}
      <div className="mb-0 p-4 bg-white rounded-lg shadow-md border border-gray-200 flex items-center justify-between h-24">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <span className="text-base font-lato font-medium">My Sessions</span>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">{totalSessions}</div>
          <div className="text-xs text-gray-600">Total coaching sessions</div>
        </div>
      </div>
      {/* Recent Activity */}
      <div className="mb-0 p-4 bg-white rounded-lg shadow-md border border-gray-200 flex items-center justify-between h-24">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <span className="text-base font-lato font-medium">Recent Activity</span>
        </div>
        <div className="text-right">
          <div className="text-base font-semibold text-gray-900">
            {recentActivity ? formatDate(recentActivity) : 'No sessions yet'}
          </div>
          <div className="text-xs text-gray-600">Last coaching session</div>
        </div>
      </div>
    </div>
  );
}
