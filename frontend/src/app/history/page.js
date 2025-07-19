"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LayoutApp from '@/components/LayoutApp';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Calendar, User, Users, Eye, Upload, FileText, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';

export default function CoachingHistory() {
  const { showToast } = useToast();
  const [showCoach, setShowCoach] = useState(true);
  const [showCoachee, setShowCoachee] = useState(true);
  const [showSelf, setShowSelf] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, getToken } = useAuth();
  const router = useRouter();

  // Fetch real sessions from backend
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const token = getToken();
        
        if (!token) {
          setError('Authentication required');
          return;
        }

        console.log('Fetching sessions for user:', user?.name);
        const response = await fetch('http://localhost:5000/api/coaching-sessions/history', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Fetched sessions:', data);
        setSessions(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching sessions:', err);
        setError('Failed to load coaching sessions');
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchSessions();
    }
  }, [user, getToken]);

  // Filter sessions based on role and search term
  const filteredSessions = sessions.filter(session => {
    if (!user) return false;
    const isSelf = session.coach && session.coachee && session.coach.name === session.coachee.name && session.coach.name === user.name;
    const isCoach = session.coach && session.coach.name === user.name && !isSelf;
    const isCoachee = session.coachee && session.coachee.name === user.name && !isSelf;

    const roleMatch =
      (showCoach && isCoach) ||
      (showCoachee && isCoachee) ||
      (showSelf && isSelf);

    const searchMatch =
      session.coach.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.coachee.name.toLowerCase().includes(searchTerm.toLowerCase());

    return roleMatch && searchMatch;
  });

  // Calculate dashboard stats
  const totalSessions = sessions.length;
  const recentActivity = sessions.length > 0 ? sessions[0].session_date : null;

  // Get proficiency level styling
  const getProficiencyLevelStyling = (level) => {
    switch (level) {
      case 'Master':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Experienced':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Qualified':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Learner':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get step proficiency badge styling
  const getStepBadgeStyling = (color) => {
    switch (color) {
      case 'purple':
        return 'bg-purple-500 text-white';
      case 'blue':
        return 'bg-blue-500 text-white';
      case 'green':
        return 'bg-green-500 text-white';
      case 'orange':
        return 'bg-orange-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

// Replace the handleView function in your history page with this:

const handleView = (sessionId, status) => {
    console.log(`View session ${sessionId} (status: ${status})`);
    
    // For existing sessions, ONLY pass sessionId to avoid triggering prepopulation
    router.push(`/session/create?sessionId=${sessionId}`);
};

  const handleSubmit = async (sessionId) => {
    try {
      const token = getToken();
      const response = await fetch(`http://localhost:5000/api/coaching-sessions/${sessionId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'submitted' })
      });

      if (response.ok) {
        // Update the session status in local state
        setSessions(prevSessions => 
          prevSessions.map(session => 
            session.id === sessionId 
              ? { ...session, status: 'submitted' }
              : session
          )
        );
        console.log('Session submitted successfully');
        showToast({ message: 'Session submitted successfully!', type: 'success' });
      } else {
        const error = await response.json();
        console.error('Failed to submit session:', error.error);
        showToast({ message: `Failed to submit session: ${error.error}`, type: 'error' });
      }
    } catch (error) {
      console.error('Error submitting session:', error);
      showToast({ message: 'Error submitting session. Please try again.', type: 'error' });
    }
  };

  const handleReport = async (sessionId) => {
    try {
      const token = getToken();
      const response = await fetch(`http://localhost:5000/api/sessionReports/${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        showToast({ message: 'Report not available. Please try again later.', type: 'error' });
        return;
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      // Find the session object by sessionId
      const session = sessions.find(s => s.id === sessionId);
      const coacheeName = session?.coachee?.name || 'Unknown';
      const sessionDate = session?.session_date
        ? new Date(session.session_date).toISOString().split('T')[0]
        : 'UnknownDate';
      const safeCoacheeName = coacheeName.replace(/[^a-zA-Z0-9]/g, '-');
      const safeSessionDate = sessionDate.replace(/[^a-zA-Z0-9-]/g, '-');
      link.download = `SalesCoach_Report_${safeCoacheeName}_${safeSessionDate}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading report:', err);
      showToast({ message: 'Failed to download report.', type: 'error' });
    }
  };

  // Loading state
  if (loading) {
    return (
      <LayoutApp>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg text-gray-600">Loading coaching history...</div>
        </div>
      </LayoutApp>
    );
  }

  // Error state
  if (error) {
    return (
      <LayoutApp>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-lg text-red-600 mb-2">Error loading history</div>
            <div className="text-sm text-gray-600">{error}</div>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        </div>
      </LayoutApp>
    );
  }

  return (
    <LayoutApp>
      <div className="space-y-6">
        {/* My Coaching Sessions */}
        <div className="mb-0 p-4 bg-white rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-lato font-semibold">My Coaching Sessions</span>
          </div>
          <div className="mt-6 mb-6 flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search by coach or coachee name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>
            <div className="flex gap-3 items-center">
              <label className="flex items-center gap-1 text-sm">
                <input type="checkbox" checked={showCoach} onChange={e => setShowCoach(e.target.checked)} /> Coach
              </label>
              <label className="flex items-center gap-1 text-sm">
                <input type="checkbox" checked={showCoachee} onChange={e => setShowCoachee(e.target.checked)} /> Coachee
              </label>
              <label className="flex items-center gap-1 text-sm">
                <input type="checkbox" checked={showSelf} onChange={e => setShowSelf(e.target.checked)} /> Self-Coaching
              </label>
            </div>
          </div>
          <div className="pt-0 px-0 pb-0">

            {filteredSessions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {sessions.length === 0 
                  ? "No coaching sessions found. Start your first session to see history here."
                  : "No sessions match your search criteria."
                }
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSessions.map((session) => (
                  <Card key={session.id} className="hover:shadow-md transition-shadow border border-gray-200">
                    <CardContent className="p-3 space-y-2">
                        {/* Row 1: Coach and Date/Time */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 font-inter">Coach:</span>
                            <span className="font-semibold text-gray-900 font-inter">{session.coach.name}</span>
                          </div>
                          <div className="text-xs text-gray-500 font-inter">
                            {formatDate(session.session_date)} at {new Date(session.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>

                        {/* Row 2: Coachee */}
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600 font-inter">Coachee:</span>
                          <span className="font-semibold text-gray-900 font-inter">{session.coachee.name}</span>
                        </div>

                        {/* Row 3: Overall Proficiency and Step Badges */}
<div className="flex items-center justify-between">
  <div className="flex items-center gap-2">
    <span className="text-sm text-gray-600 font-inter">Overall:</span>
    <span className={`px-2 py-1 rounded-full text-xs font-medium border font-inter ${getProficiencyLevelStyling(session.overall_proficiency)}`}>
      {session.overall_proficiency}
    </span>
  </div>
  {/* Step Proficiency Badges - Right Aligned */}
  <div className="flex gap-1">
    {session.step_proficiencies && session.step_proficiencies.map((step, index) => (
  <div
    key={`${session.id}-step-${index}-${step.step_number ?? ''}`}
    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${getStepBadgeStyling(step.color)}`}
    title={`Step ${step.step_number}: ${step.level}`}
  >
    {step.letter}
  </div>
))}
  </div>
</div>

                        {/* Row 4: Action Buttons - Bottom Side by Side */}
                        <div className="flex gap-2 pt-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleView(session.id, session.status)}
                            className="flex-1 h-9 text-sm font-inter"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                          
                          {session.status === 'draft' ? (
                            // Only the coach can submit; coachee sees a disabled button with special label
                            (user && session.coach && session.coach.name === user.name) ? (
                              <Button
                                size="sm"
                                onClick={() => handleSubmit(session.id)}
                                className="flex-1 h-9 text-sm bg-blue-600 hover:bg-blue-700 font-inter"
                              >
                                <Upload className="w-4 h-4 mr-2" />
                                Submit
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                disabled
                                className="flex-1 h-9 text-sm bg-gray-500 text-white font-inter cursor-not-allowed"
                                title="Only the coach can submit this session"
                              >
                                <Upload className="w-4 h-4 mr-2" />
                                Not yet submitted by Coach
                              </Button>
                            )
                          ) : (
                            <Button
                              variant="secondary"
                              size="sm"
                              disabled
                              className="flex-1 h-9 text-sm font-inter"
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Submitted
                            </Button>
                          )}
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReport(session.id)}
                            disabled={session.status !== 'submitted'}
                            className="flex-1 h-9 text-sm font-inter"
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            Report
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </LayoutApp>
  );
}