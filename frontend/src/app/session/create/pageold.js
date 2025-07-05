"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LayoutApp from '@/components/LayoutApp';
import { Button } from '@/components/ui/button';
import SpiderGraph from '@/components/SpiderGraph';

export default function NewCoachingSession() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [sessionData, setSessionData] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // All your existing state variables...
  const [context, setContext] = useState('');
  const [expandedSteps, setExpandedSteps] = useState(new Set());
  const [expandedSubsteps, setExpandedSubsteps] = useState(new Set());
  const [checkedBehaviors, setCheckedBehaviors] = useState(new Set());
  const [stepScores, setStepScores] = useState({});
  const [autoSaveVisible, setAutoSaveVisible] = useState(false);
  const [notes, setNotes] = useState({
    keyObservations: '',
    whatWentWell: '',
    whatCouldBeImproved: '',
    actionPlan: ''
  });

  // Framework data state
  const [frameworkData, setFrameworkData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Framework ID - hardcoded for now, can be passed as prop later
  const FRAMEWORK_ID = '7b5dbd81-bc61-48d7-8d39-bb46d4d00d74';

  // Initialize session data from URL parameters
  useEffect(() => {
    if (!user) return;

    const sessionId = searchParams.get('sessionId');
    const coacheeId = searchParams.get('coacheeId');
    const coacheeName = searchParams.get('coacheeName');
    const isSelfCoaching = searchParams.get('isSelfCoaching') === 'true';

    if (!sessionId || !coacheeId || !coacheeName) {
      // No session data, redirect to home
      router.push('/');
      return;
    }

    setSessionData({
      sessionId: sessionId,
      coach: user.name,
      coachee: coacheeName,
      isSelfCoaching: isSelfCoaching,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  }, [user, searchParams, router]);

  // Handle session deletion
  const handleDeleteSession = async () => {
    if (!sessionData?.sessionId) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/coaching-sessions/${sessionData.sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Session deleted successfully, navigate to home
        router.push('/');
      } else {
        const errorData = await response.json();
        alert(`Failed to delete session: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      alert('Failed to delete session. Please try again.');
    }
  };

  // Show loading if no session data yet
  if (!sessionData) {
    return (
      <LayoutApp>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading session...</p>
          </div>
        </div>
      </LayoutApp>
    );
  }

  // ... Keep all your existing framework fetching code and component logic ...
  // Just update the session info header section to use the real sessionData