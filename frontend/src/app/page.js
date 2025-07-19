"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LayoutApp from '@/components/LayoutApp';
import Image from 'next/image';
import HomeDashboard from './homeDashboard';

// Inline SVG icons to avoid dependency issues
const PlusIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const HistoryIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
    <path d="M3 3v5h5"></path>
    <path d="M12 7v5l4 2"></path>
  </svg>
);



export default function HomePage() {
  const { user, getToken } = useAuth();
  const [showCoach, setShowCoach] = useState(true);
  const [showCoachee, setShowCoachee] = useState(true);
  const [showSelf, setShowSelf] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const token = getToken && getToken();
        if (!token) {
          setError('Authentication required');
          return;
        }
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
        setSessions(data);
        setError(null);
      } catch (err) {
        setError('Failed to load coaching sessions');
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };
    if (user && getToken) {
      fetchSessions();
    }
  }, [user, getToken]);

  return (
    <LayoutApp>
      <div className="flex flex-col items-center justify-center min-h-full p-4 sm:p-6 md:p-8 text-center bg-gray-50">
        <div className="w-full max-w-md">
          
                    <div className="mb-12">
            <h1 className="text-2xl font-light text-gray-600 mb-2" style={{ fontFamily: 'cursive' }}>
              Welcome {user?.name || 'Coach'}!
            </h1>
            <p className="text-2xl font-light text-gray-600 mb-2" style={{ fontFamily: 'cursive' }}>Good to see you.</p>
            <p className="text-2xl font-light text-gray-600" style={{ fontFamily: 'cursive' }}>Happy coaching!</p>
          </div>

                              <div className="mb-10 p-4 bg-white rounded-lg shadow-md border border-gray-200 flex items-center justify-center h-24">
            <Image 
              src="/images/salescoach-icon.png" 
              alt="SalesCoach Logo" 
              width={40} 
              height={40} 
              className="mr-4"
            />
            <span className="text-2xl font-semibold text-gray-800">SalesCoach</span>
          </div>

          {/* Dashboard Section (My Sessions, Recent Activity, Search, Role Filters) */}
          <HomeDashboard
            sessions={sessions}
            user={user}
            loading={loading}
            error={error}
          />
        </div>
      </div>
    </LayoutApp>
  );
}