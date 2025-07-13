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
  const { user, getToken } = useAuth();
  
  // Session data state
  const [sessionData, setSessionData] = useState(null);
  const [isEditable, setIsEditable] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // All your existing state variables
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

  // FIXED: Initialize session data from URL parameters
  useEffect(() => {
    if (!user) return;

    const sessionId = searchParams.get('sessionId');
    const coacheeId = searchParams.get('coacheeId');
    const coacheeName = searchParams.get('coacheeName');
    const isSelfCoaching = searchParams.get('isSelfCoaching') === 'true';

    console.log('🔄 === SESSION INITIALIZATION ===');
    console.log('🔄 URL Parameters:', {
      sessionId: sessionId || 'none',
      coacheeId: coacheeId || 'none', 
      coacheeName: coacheeName || 'none',
      isSelfCoaching
    });

    // FIXED VALIDATION LOGIC
    if (sessionId && !coacheeId && !coacheeName) {
      // SCENARIO 2: Existing session being edited (only sessionId provided)
      console.log('📝 SCENARIO: Existing session - no prepopulation needed');
      console.log(`📝 Session ID: ${sessionId}`);
      
      setSessionData({
        sessionId: sessionId,
        coach: user.name,
        coachee: 'Loading...', // Will be filled from session data
        isSelfCoaching: false, // Will be determined from session data
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'draft'
      });
      
      loadExistingSession(sessionId);
      return;
    }

    if (sessionId && coacheeId && coacheeName) {
      // SCENARIO 1: Newly created session that needs prepopulation
      console.log('📋 SCENARIO: Newly created session - needs prepopulation');
      console.log(`📋 Session ID: ${sessionId}`);
      console.log(`📋 Coachee for prepopulation: ${coacheeId} (${coacheeName})`);

      setSessionData({
        sessionId: sessionId,
        coach: user.name,
        coachee: coacheeName,
        isSelfCoaching: isSelfCoaching,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'draft'
      });

      loadSessionDataWithPrepopulation(sessionId, coacheeId);
      return;
    }

    if (!sessionId && coacheeId && coacheeName) {
      // SCENARIO 3: Manual session creation (fallback scenario)
      console.log('🆕 SCENARIO: Manual session creation');
      console.log(`🆕 Coachee: ${coacheeId} (${coacheeName})`);

      setSessionData({
        sessionId: null,
        coach: user.name,
        coachee: coacheeName,
        isSelfCoaching: isSelfCoaching,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'draft'
      });

      createNewSessionWithPrepopulation(coacheeId);
      return;
    }

    // Invalid parameters - redirect to home
    console.log('❌ Invalid parameters - redirecting to home');
    router.push('/');
  }, [user, searchParams, router]);

  // 1. For newly created sessions that need prepopulation
  const loadSessionDataWithPrepopulation = async (sessionId, coacheeId) => {
    try {
      const token = getToken();
      if (!token) {
        console.log('❌ No auth token available');
        return;
      }

      console.log(`🔄 === LOADING NEW SESSION WITH PREPOPULATION ===`);
      console.log(`🔄 Session ID: ${sessionId}`);
      console.log(`🔄 Coachee ID: ${coacheeId}`);

      // Step 1: Load the newly created session to get basic info
      try {
        const sessionResponse = await fetch(`http://localhost:5000/api/coaching-sessions/${sessionId}`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });

        console.log(`📡 New session response: ${sessionResponse.status} ${sessionResponse.statusText}`);

        if (sessionResponse.ok) {
          const sessionData = await sessionResponse.json();
          console.log('✅ Loaded new session basic info:', sessionData);
          
          setSessionData(prev => ({ ...prev, status: sessionData.session.status }));
          setIsEditable(sessionData.isEditable);
        }
      } catch (error) {
        console.error('💥 Error loading new session info:', error);
      }

      // Step 2: Load latest session data for prepopulation
      console.log(`🔍 === FETCHING LATEST SESSION FOR PREPOPULATION ===`);
      console.log(`🔍 URL: http://localhost:5000/api/coaching-sessions/latest-for-coachee/${coacheeId}?exclude=${sessionId}`);
      
      try {
        const latestResponse = await fetch(`http://localhost:5000/api/coaching-sessions/latest-for-coachee/${coacheeId}?exclude=${sessionId}`, {        
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });

        console.log(`📡 Latest session response: ${latestResponse.status} ${latestResponse.statusText}`);

        if (latestResponse.ok) {
          const latestData = await latestResponse.json();
          console.log('📋 === RECEIVED LATEST SESSION DATA ===');
          console.log('📋 Session found:', !!latestData.session);
          
          if (latestData.session) {
            console.log('📋 Found session for coachee:', latestData.session.coachee?.name);
            console.log('📋 Session coachee ID:', latestData.session.coachee_id);
            console.log('📋 Expected coachee ID:', coacheeId);
            console.log('📋 Match:', latestData.session.coachee_id === coacheeId);
            console.log('📋 Session created:', latestData.session.created_at);
          } else {
            console.log('📋 No previous session found - will show empty form');
          }
          
          console.log('📋 Notes found:', !!latestData.notes);
          console.log('📋 Scores found:', latestData.scores?.length || 0);
          
          console.log('📋 === POPULATING UI WITH LATEST DATA ===');
          populateUIWithData(latestData, true); // true = this is prepopulation
          console.log('✅ UI populated successfully');
          
        } else {
          const errorText = await latestResponse.text();
          console.log('🚫 No previous session found or error:', errorText);
          console.log('🚫 Will show empty form');
          
          // Clear any existing data to ensure clean slate
          clearUIData();
        }
        
      } catch (error) {
        console.error('💥 Error fetching latest session for prepopulation:', error);
        clearUIData();
      }
      
      console.log(`🔄 === END NEW SESSION WITH PREPOPULATION ===`);
      
    } catch (error) {
      console.error('💥 Fatal error in loadSessionDataWithPrepopulation:', error);
      alert(`Error loading session: ${error.message}`);
    }
  };

  // FIXED: 2. For existing sessions being edited (no prepopulation needed)
  const loadExistingSession = async (sessionId) => {
    try {
      const token = getToken();
      if (!token) {
        console.log('❌ No auth token available');
        return;
      }

      console.log(`🔄 === LOADING EXISTING SESSION ===`);
      console.log(`🔄 Session ID: ${sessionId}`);
      
      try {
        const response = await fetch(`http://localhost:5000/api/coaching-sessions/${sessionId}`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });

        console.log(`📡 Existing session response: ${response.status} ${response.statusText}`);

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Loaded existing session data:', data);
          
          // FIXED: Update session data with actual information from the loaded session
          setSessionData(prev => ({
            ...prev,
            coachee: data.session.coachee?.name || 'Unknown',
            isSelfCoaching: data.session.coach_id === data.session.coachee_id,
            status: data.session.status
          }));
          
          setIsEditable(data.isEditable);
          
          // For existing sessions, populate with the actual session data (not prepopulation)
          populateUIWithData(data, false); // false = this is NOT prepopulation
        } else {
          const errorText = await response.text();
          console.error('❌ Failed to load existing session:', errorText);
        }
      } catch (error) {
        console.error('💥 Error loading existing session:', error);
      }
      
    } catch (error) {
      console.error('💥 Fatal error in loadExistingSession:', error);
      alert(`Error loading session: ${error.message}`);
    }
  };

  // 3. For manual session creation (fallback scenario)
  const createNewSessionWithPrepopulation = async (coacheeId) => {
    try {
      const token = getToken();
      if (!token) {
        console.log('❌ No auth token available');
        return;
      }

      console.log(`🔄 === CREATING NEW SESSION MANUALLY ===`);
      console.log(`🔄 Coachee ID: ${coacheeId}`);
      
      try {
        // Step 1: Create new session in database
        console.log('⚡ Step 1: Creating new session...');
        const createResponse = await fetch('http://localhost:5000/api/coaching-sessions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            coachee_id: coacheeId,
            framework_id: FRAMEWORK_ID,
            session_date: new Date().toISOString().split('T')[0]
          })
        });

        if (!createResponse.ok) {
          const errorText = await createResponse.text();
          console.error('❌ Failed to create session:', errorText);
          return;
        }

        const newSession = await createResponse.json();
        console.log('✅ New session created:', newSession.session_id);

        // Step 2: Update sessionData with new sessionId
        setSessionData(prev => ({ ...prev, sessionId: newSession.session_id }));

        // Step 3: Load latest session data for prepopulation
        await loadSessionDataWithPrepopulation(newSession.session_id, coacheeId);
        
      } catch (error) {
        console.error('💥 Error in manual session creation:', error);
        alert(`Error creating session: ${error.message}`);
      }
      
    } catch (error) {
      console.error('💥 Fatal error in createNewSessionWithPrepopulation:', error);
      alert(`Error creating session: ${error.message}`);
    }
  };

  // Helper function to clear UI data
  const clearUIData = () => {
    console.log('🧹 Clearing UI data for empty form');
    setContext('');
    setNotes({
      keyObservations: '',
      whatWentWell: '',
      whatCouldBeImproved: '',
      actionPlan: ''
    });
    setCheckedBehaviors(new Set());
    setStepScores({});
  };

  // FIXED: Helper function to populate UI data 
  const populateUIWithData = (data, isPrepopulation = false) => {
    console.log('🎨 === POPULATING UI WITH DATA ===');
    console.log('🎨 Input data:', data);
    console.log('🎨 Is prepopulation:', isPrepopulation);
    
    // Clear existing state first to ensure clean slate
    console.log('🧹 Clearing existing state...');
    setContext('');
    setNotes({
      keyObservations: '',
      whatWentWell: '',
      whatCouldBeImproved: '',
      actionPlan: ''
    });
    setCheckedBehaviors(new Set());
    setStepScores({});
    
    // If this is prepopulation and no previous session data exists, don't populate
    if (isPrepopulation && !data.session) {
      console.log('🎨 No previous session data for prepopulation - UI will remain empty');
      return;
    }
    
    // For existing sessions OR prepopulation with data, load the content
    const sessionToUse = data.session;
    const notesToUse = data.notes;
    const scoresToUse = data.scores;
    
    // Load context
    let contextValue = '';
    if (sessionToUse?.context) {
      contextValue = sessionToUse.context;
      console.log('🎨 Found context in session:', contextValue?.substring(0, 50) + '...');
    } else if (notesToUse?.context) {
      contextValue = notesToUse.context;
      console.log('🎨 Found context in notes:', contextValue?.substring(0, 50) + '...');
    }
    
    if (contextValue) {
      setContext(contextValue);
      console.log('✅ Context populated');
    }

    // Load notes
    if (notesToUse) {
      const populatedNotes = {
        keyObservations: notesToUse.key_observations || '',
        whatWentWell: notesToUse.what_went_well || '',
        whatCouldBeImproved: notesToUse.improvements || '',
        actionPlan: notesToUse.next_steps || ''
      };
      
      setNotes(populatedNotes);
      console.log('✅ Notes populated:', {
        keyObservations: populatedNotes.keyObservations?.length || 0,
        whatWentWell: populatedNotes.whatWentWell?.length || 0,
        whatCouldBeImproved: populatedNotes.whatCouldBeImproved?.length || 0,
        actionPlan: populatedNotes.actionPlan?.length || 0
      });
    }

    // Load scores and step overrides
    if (scoresToUse?.length > 0) {
      const behaviorSet = new Set();
      const stepOverrides = {};
      
      scoresToUse.forEach(score => {
        if (score.behavior_id && score.checked) {
          behaviorSet.add(score.behavior_id);
        } else if (score.step_id && score.step_level) {
          stepOverrides[score.step_id] = score.step_level;
        }
      });
      
      setCheckedBehaviors(behaviorSet);
      setStepScores(stepOverrides);
      
      console.log('✅ Scores populated:', {
        checkedBehaviors: behaviorSet.size,
        stepOverrides: Object.keys(stepOverrides).length
      });
    }
    
    console.log('🎨 === UI POPULATION COMPLETE ===');
  };

  // Fetch framework data on component mount
  useEffect(() => {
    const fetchFrameworkData = async () => {
      try {
        setLoading(true);
        
        // First, let's try the existing endpoint to see what we get
        const response = await fetch(`http://localhost:5000/api/frameworks`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch framework data');
        }
        
        const frameworks = await response.json();
        console.log('Available frameworks:', frameworks);
        
        // Find our specific framework
        const targetFramework = frameworks.find(f => f.id === FRAMEWORK_ID);
        
        if (!targetFramework) {
          throw new Error(`Framework with ID ${FRAMEWORK_ID} not found`);
        }
        
        console.log('Target framework:', targetFramework);
        
        // Now we need to fetch the full structure
        // We'll need to make multiple API calls to get steps, substeps, behaviors, and levels
        const [stepsRes, levelsRes] = await Promise.all([
          fetch(`http://localhost:5000/api/framework-steps?framework_id=${FRAMEWORK_ID}`),
          fetch(`http://localhost:5000/api/behavior-levels?framework_id=${FRAMEWORK_ID}`)
        ]);
        
        if (!stepsRes.ok || !levelsRes.ok) {
          throw new Error('Failed to fetch framework structure');
        }
        
        const [steps, levels] = await Promise.all([
          stepsRes.json(),
          levelsRes.json()
        ]);
        
        console.log('Steps:', steps);
        console.log('Levels:', levels);
        
        // Fetch substeps and behaviors for each step
        const stepsWithStructure = await Promise.all(
          steps.map(async (step) => {
            const [substepsRes, behaviorsRes] = await Promise.all([
              fetch(`http://localhost:5000/api/framework-substeps?framework_id=${FRAMEWORK_ID}`),
              fetch(`http://localhost:5000/api/framework-behaviors?framework_id=${FRAMEWORK_ID}`)
            ]);
            
            const [substeps, behaviors] = await Promise.all([
              substepsRes.json(),
              behaviorsRes.json()
            ]);
            
            // Filter substeps for this step
            const stepSubsteps = substeps.filter(ss => ss.step_id === step.id);
            
            // Build substeps with their behaviors grouped by level
            const substepsWithBehaviors = stepSubsteps.map(substep => {
              const substepBehaviors = behaviors.filter(b => b.substep_id === substep.id);
              
              // Group behaviors by level
              const behaviorsByLevel = {};
              levels.forEach(level => {
                behaviorsByLevel[level.level_name.toLowerCase()] = substepBehaviors
                  .filter(b => b.level_id === level.id)
                  .map(b => ({
                    id: b.id,
                    text: b.description
                  }));
              });
              
              return {
                id: substep.id,
                title: substep.name,
                behaviors: behaviorsByLevel
              };
            });
            
            return {
              id: step.id,
              title: step.name,
              substeps: substepsWithBehaviors
            };
          })
        );
        
        setFrameworkData({
          framework: targetFramework,
          steps: stepsWithStructure,
          levels: levels
        });
        
        console.log('Final framework data:', {
          framework: targetFramework,
          steps: stepsWithStructure,
          levels: levels
        });
        
      } catch (error) {
        console.error('Error fetching framework:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFrameworkData();
  }, []);

  // Enhanced saveSession function
  const saveSession = async (showMessage = false) => {
    console.log('🔄 === SAVE SESSION ATTEMPT ===');
    console.log('🔄 Session ID:', sessionData?.sessionId);
    console.log('🔄 Is Editable:', isEditable);
    console.log('🔄 Has Token:', !!getToken());
    
    if (!sessionData?.sessionId || !isEditable) {
      console.log('❌ Save skipped:', { 
        hasSessionId: !!sessionData?.sessionId, 
        isEditable 
      });
      return;
    }

    try {
      const token = getToken();
      if (!token) {
        console.log('❌ No auth token available');
        alert('Authentication token missing. Please refresh the page.');
        return;
      }

      // Prepare scores data
      const scoresData = [];
      checkedBehaviors.forEach(behaviorId => {
        scoresData.push({
          behavior_id: behaviorId,
          checked: true
        });
      });

      // Calculate proficiencies using existing functions
      const calculatedProficiencies = [];
      
      // Calculate step proficiencies
      if (frameworkData?.steps) {
        frameworkData.steps.forEach((step, index) => {
          const stepProf = getStepProficiency(step);
          calculatedProficiencies.push({
            step_id: step.id,
            step_number: index + 1,
            proficiency_type: 'step',
            level_name: stepProf.level,
            is_manual: stepProf.isManual,
            points_earned: stepProf.pointsEarned || 0,
            total_possible: stepProf.totalPossible || 0,
            percentage: stepProf.percentage || 0
          });
        });

        // Calculate overall proficiency
        const overallProf = getOverallProficiency();
        
        const totalPointsEarned = calculatedProficiencies.reduce((sum, step) => sum + (step.points_earned || 0), 0);
        const totalPossiblePoints = calculatedProficiencies.reduce((sum, step) => sum + (step.total_possible || 0), 0);
        const overallPercentage = totalPossiblePoints > 0 ? Math.round((totalPointsEarned / totalPossiblePoints) * 100) : 0;
        
        calculatedProficiencies.push({
          step_id: null,
          step_number: null,
          proficiency_type: 'overall',
          level_name: overallProf,
          is_manual: false,
          points_earned: totalPointsEarned,
          total_possible: totalPossiblePoints,
          percentage: overallPercentage
        });
      }

      const saveData = {
        context: context,
        notes: {
          context: context,
          keyObservations: notes.keyObservations,
          whatWentWell: notes.whatWentWell,
          whatCouldBeImproved: notes.whatCouldBeImproved,
          actionPlan: notes.actionPlan
        },
        scores: scoresData,
        stepScores: stepScores,
        calculatedProficiencies: calculatedProficiencies
      };

      const saveUrl = `http://localhost:5000/api/coaching-sessions/${sessionData.sessionId}/save`;
      console.log('🔄 Save URL:', saveUrl);
      console.log('🔄 Save Data Summary:', {
        context: saveData.context?.length || 0,
        notesFields: Object.keys(saveData.notes).length,
        scoresCount: saveData.scores?.length || 0,
        stepScoresCount: Object.keys(saveData.stepScores || {}).length,
        proficienciesCount: saveData.calculatedProficiencies?.length || 0
      });
      console.log('🔄 Auth Token (first 20 chars):', token.substring(0, 20) + '...');

      console.log('🔄 Making fetch request...');
      const response = await fetch(saveUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(saveData)
      });

      console.log('📡 === SAVE RESPONSE ===');
      console.log('📡 Status:', response.status);
      console.log('📡 Status Text:', response.statusText);
      console.log('📡 OK:', response.ok);
      
      if (response.ok) {
        try {
          const responseData = await response.json();
          console.log('✅ Save successful:', responseData);
          if (showMessage) {
            showAutoSave();
          }
        } catch (parseError) {
          console.log('✅ Save successful (no JSON response)');
          if (showMessage) {
            showAutoSave();
          }
        }
      } else {
        const errorText = await response.text();
        console.error('❌ === SAVE FAILED ===');
        console.error('❌ Status:', response.status);
        console.error('❌ Response:', errorText);
        
        // Show user-friendly error
        alert(`Save failed (${response.status}): ${errorText}`);
      }
    } catch (error) {
      console.error('💥 === SAVE SESSION ERROR ===');
      console.error('💥 Error type:', error.name);
      console.error('💥 Error message:', error.message);
      console.error('💥 Full error:', error);
      console.error('💥 === END SAVE SESSION ERROR ===');
      
      // Show user-friendly error
      alert(`Network error: ${error.message}. Please check if the backend server is running.`);
    }
    
    console.log('🔄 === END SAVE SESSION ATTEMPT ===');
  };

  // Submit session (lock it)
  const submitSession = async () => {
    if (!sessionData?.sessionId) return;

    try {
      setSubmitting(true);
      const token = getToken();
      if (!token) {
        alert('Authentication required');
        return;
      }

      // First save current data (now includes proficiencies)
      await saveSession();

      // Then submit the session
      const response = await fetch(`http://localhost:5000/api/coaching-sessions/${sessionData.sessionId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'submitted'
        })
      });

      if (response.ok) {
        setSessionData(prev => ({ ...prev, status: 'submitted' }));
        setIsEditable(false);
        setShowSubmitConfirm(false);
        alert('Session submitted successfully! It can no longer be edited.');
      } else {
        const errorData = await response.json();
        alert(`Failed to submit session: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error submitting session:', error);
      alert('Failed to submit session. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete session handler
  const handleDeleteSession = async () => {
    if (!sessionData?.sessionId) return;

    try {
      const token = getToken();
      if (!token) {
        alert('Authentication required');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/coaching-sessions/${sessionData.sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setShowDeleteConfirm(false);
        alert('Session deleted successfully!');
        router.push('/'); // Redirect to home after deletion
      } else {
        const errorData = await response.json();
        alert(`Failed to delete session: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      alert('Failed to delete session. Please try again.');
    }
  };

  const toggleStep = (stepId) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedSteps(newExpanded);
  };

  const toggleSubstep = (substepId) => {
    const newExpanded = new Set(expandedSubsteps);
    if (newExpanded.has(substepId)) {
      newExpanded.delete(substepId);
    } else {
      newExpanded.add(substepId);
    }
    setExpandedSubsteps(newExpanded);
  };

  const handleBehaviorCheck = (behaviorId, checked) => {
    if (!isEditable) return; // Prevent changes if not editable
    
    const newChecked = new Set(checkedBehaviors);
    if (checked) {
      newChecked.add(behaviorId);
    } else {
      newChecked.delete(behaviorId);
    }
    setCheckedBehaviors(newChecked);
  };

  const handleStepScoreChange = (stepId, level) => {
    if (!isEditable) return; // Prevent changes if not editable
    
    setStepScores(prev => ({ ...prev, [stepId]: level }));
  };

  const handleNotesChange = (field, value) => {
    if (!isEditable) return; // Prevent changes if not editable
    
    setNotes(prev => ({ ...prev, [field]: value }));
  };

  const handleContextChange = (value) => {
    if (!isEditable) return; // Prevent changes if not editable
    
    setContext(value);
  };

  const showAutoSave = () => {
    setAutoSaveVisible(true);
    setTimeout(() => {
      setAutoSaveVisible(false);
    }, 1500);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-500';
      case 'submitted':
        return 'bg-green-100 text-green-800 border-green-500';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800 border-blue-500';
      case 'archived':
        return 'bg-gray-100 text-gray-800 border-gray-500';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getProficiencyBadgeClass = (level) => {
    const levelLower = level.toLowerCase();
    if (levelLower.includes('learner') || levelLower.includes('basic')) return 'bg-blue-100 text-blue-800 border-blue-500';
    if (levelLower.includes('qualified') || levelLower.includes('intermediate')) return 'bg-orange-100 text-orange-800 border-orange-500';
    if (levelLower.includes('experienced') || levelLower.includes('advanced')) return 'bg-green-100 text-green-800 border-green-500';
    if (levelLower.includes('master') || levelLower.includes('expert')) return 'bg-purple-100 text-purple-800 border-purple-500';
    return 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getStepColorClass = (index) => {
    const colors = [
      'border-l-4 border-l-blue-600',
      'border-l-4 border-l-purple-600',
      'border-l-4 border-l-pink-600',
      'border-l-4 border-l-orange-600',
      'border-l-4 border-l-yellow-500',
      'border-l-4 border-l-yellow-300',
      'border-l-4 border-l-green-600'
    ];
    return colors[index % colors.length];
  };

  const getLevelHeaderClass = (level) => {
    const levelLower = level.toLowerCase();
    if (levelLower.includes('learner') || levelLower.includes('basic')) return 'text-blue-700 bg-blue-50';
    if (levelLower.includes('qualified') || levelLower.includes('intermediate')) return 'text-orange-700 bg-orange-50';
    if (levelLower.includes('experienced') || levelLower.includes('advanced')) return 'text-green-700 bg-green-50';
    if (levelLower.includes('master') || levelLower.includes('expert')) return 'text-purple-700 bg-purple-50';
    return 'text-gray-600 bg-gray-50';
  };

  // Calculate proficiency using correct threshold logic
  const getStepProficiency = (step) => {
    if (!frameworkData?.levels) return { level: 'Not Evaluated', isManual: false, percentage: 0 };
    
    const manualScore = stepScores[step.id];
    if (manualScore && manualScore !== 'Auto-Calculate') {
      return { level: manualScore, isManual: true };
    }
    
    // Calculate from behaviors using the level point values from database
    let pointsEarned = 0;
    const levelCounts = {};
    
    // Initialize level counts
    frameworkData.levels.forEach(level => {
      levelCounts[level.level_name.toLowerCase()] = 0;
    });
    
    step.substeps.forEach(substep => {
      // Count behaviors by level
      Object.keys(substep.behaviors).forEach(levelName => {
        levelCounts[levelName] += substep.behaviors[levelName]?.length || 0;
      });
      
      // Count checked behaviors and calculate points
      Object.keys(substep.behaviors).forEach(levelName => {
        const levelData = frameworkData.levels.find(l => l.level_name.toLowerCase() === levelName);
        const pointValue = levelData ? levelData.point_value : 1;
        
        const checkedCount = substep.behaviors[levelName]?.filter(behavior => 
          checkedBehaviors.has(behavior.id)
        ).length || 0;
        
        pointsEarned += checkedCount * pointValue;
      });
    });
    
    const allBehaviors = step.substeps.flatMap(substep => 
      Object.values(substep.behaviors).flat()
    );
    
    if (allBehaviors.length === 0) {
      return { level: 'Not Evaluated', isManual: false, percentage: 0 };
    }
    
    // Calculate total possible points and thresholds
    let totalPossible = 0;
    Object.keys(levelCounts).forEach(levelName => {
      const levelData = frameworkData.levels.find(l => l.level_name.toLowerCase() === levelName);
      const pointValue = levelData ? levelData.point_value : 1;
      totalPossible += levelCounts[levelName] * pointValue;
    });
    
    // Sort levels by point value to establish hierarchy
    const sortedLevels = frameworkData.levels.sort((a, b) => a.point_value - b.point_value);
    
    // Calculate thresholds based on your exact logic
    let maxLearnerPoints = 0;
    let maxQualifiedPoints = 0;
    let maxExperiencedPoints = 0;
    let maxMasterPoints = 0;
    
    // Calculate max points for each level
    sortedLevels.forEach(level => {
      const levelName = level.level_name.toLowerCase();
      const count = levelCounts[levelName] || 0;
      const points = count * level.point_value;
      
      if (level.point_value === 1) maxLearnerPoints += points;
      else if (level.point_value === 2) maxQualifiedPoints += points;
      else if (level.point_value === 3) maxExperiencedPoints += points;
      else if (level.point_value === 4) maxMasterPoints += points;
    });
    
    // Define thresholds
    const learnerThreshold = { min: 0, max: maxLearnerPoints };
    const qualifiedThreshold = { min: maxLearnerPoints + 1, max: maxLearnerPoints + maxQualifiedPoints };
    const experiencedThreshold = { min: maxLearnerPoints + maxQualifiedPoints + 1, max: maxLearnerPoints + maxQualifiedPoints + maxExperiencedPoints };
    const masterThreshold = { min: maxLearnerPoints + maxQualifiedPoints + maxExperiencedPoints + 1, max: totalPossible };
    
    // Determine level based on points earned
    let level;
    if (pointsEarned === 0) {
      level = sortedLevels[0].level_name;
    } else if (pointsEarned >= masterThreshold.min) {
      level = sortedLevels.find(l => l.point_value === 4)?.level_name || sortedLevels[sortedLevels.length - 1].level_name;
    } else if (pointsEarned >= experiencedThreshold.min) {
      level = sortedLevels.find(l => l.point_value === 3)?.level_name || sortedLevels[Math.max(0, sortedLevels.length - 2)].level_name;
    } else if (pointsEarned >= qualifiedThreshold.min) {
      level = sortedLevels.find(l => l.point_value === 2)?.level_name || sortedLevels[Math.max(0, sortedLevels.length - 3)].level_name;
    } else {
      level = sortedLevels[0].level_name;
    }
    
    const percentage = totalPossible > 0 ? Math.round((pointsEarned / totalPossible) * 100) : 0;
    
    return { 
      level, 
      isManual: false, 
      percentage, 
      pointsEarned, 
      totalPossible,
      thresholds: {
        learner: learnerThreshold,
        qualified: qualifiedThreshold,
        experienced: experiencedThreshold,
        master: masterThreshold
      }
    };
  };

  const calculateSubstepProficiency = (substep) => {
    if (!frameworkData?.levels) return { level: 'Not Evaluated', percentage: 0 };
    
    const allBehaviors = Object.values(substep.behaviors).flat();
    if (allBehaviors.length === 0) return { level: 'Not Evaluated', percentage: 0 };
    
    let pointsEarned = 0;
    const levelCounts = {};
    
    // Initialize level counts
    frameworkData.levels.forEach(level => {
      levelCounts[level.level_name.toLowerCase()] = 0;
    });
    
    // Count behaviors by level and calculate points
    Object.keys(substep.behaviors).forEach(levelName => {
      const levelData = frameworkData.levels.find(l => l.level_name.toLowerCase() === levelName);
      const pointValue = levelData ? levelData.point_value : 1;
      
      const behaviors = substep.behaviors[levelName] || [];
      levelCounts[levelName] = behaviors.length;
      
      const checkedCount = behaviors.filter(behavior => checkedBehaviors.has(behavior.id)).length;
      pointsEarned += checkedCount * pointValue;
    });
    
    // Calculate total possible points and thresholds
    let totalPossible = 0;
    let maxLearnerPoints = 0;
    let maxQualifiedPoints = 0;
    let maxExperiencedPoints = 0;
    let maxMasterPoints = 0;
    
    Object.keys(levelCounts).forEach(levelName => {
      const levelData = frameworkData.levels.find(l => l.level_name.toLowerCase() === levelName);
      const pointValue = levelData ? levelData.point_value : 1;
      const count = levelCounts[levelName];
      const points = count * pointValue;
      
      totalPossible += points;
      
      if (pointValue === 1) maxLearnerPoints += points;
      else if (pointValue === 2) maxQualifiedPoints += points;
      else if (pointValue === 3) maxExperiencedPoints += points;
      else if (pointValue === 4) maxMasterPoints += points;
    });
    
    // Define thresholds using your exact logic
    const learnerThreshold = { min: 0, max: maxLearnerPoints };
    const qualifiedThreshold = { min: maxLearnerPoints + 1, max: maxLearnerPoints + maxQualifiedPoints };
    const experiencedThreshold = { min: maxLearnerPoints + maxQualifiedPoints + 1, max: maxLearnerPoints + maxQualifiedPoints + maxExperiencedPoints };
    const masterThreshold = { min: maxLearnerPoints + maxQualifiedPoints + maxExperiencedPoints + 1, max: totalPossible };
    
    // Sort levels by point value
    const sortedLevels = frameworkData.levels.sort((a, b) => a.point_value - b.point_value);
    
    // Determine level based on points earned
    let level;
    if (pointsEarned === 0) {
      level = sortedLevels[0].level_name;
    } else if (pointsEarned >= masterThreshold.min) {
      level = sortedLevels.find(l => l.point_value === 4)?.level_name || sortedLevels[sortedLevels.length - 1].level_name;
    } else if (pointsEarned >= experiencedThreshold.min) {
      level = sortedLevels.find(l => l.point_value === 3)?.level_name || sortedLevels[Math.max(0, sortedLevels.length - 2)].level_name;
    } else if (pointsEarned >= qualifiedThreshold.min) {
      level = sortedLevels.find(l => l.point_value === 2)?.level_name || sortedLevels[Math.max(0, sortedLevels.length - 3)].level_name;
    } else {
      level = sortedLevels[0].level_name;
    }
    
    const percentage = totalPossible > 0 ? Math.round((pointsEarned / totalPossible) * 100) : 0;
    
    return { 
      level, 
      percentage, 
      pointsEarned, 
      totalPossible,
      thresholds: {
        learner: learnerThreshold,
        qualified: qualifiedThreshold,
        experienced: experiencedThreshold,
        master: masterThreshold
      }
    };
  };

  // Calculate overall proficiency for spider graph
  const getOverallProficiency = () => {
    if (!frameworkData?.steps || !frameworkData?.levels) return 'Not Evaluated';
    
    const stepProficiencies = frameworkData.steps.map(step => {
      const stepProf = getStepProficiency(step);
      const levelData = frameworkData.levels.find(l => l.level_name === stepProf.level);
      return levelData ? levelData.point_value : 1;
    });
    
    const avgLevel = stepProficiencies.reduce((sum, level) => sum + level, 0) / stepProficiencies.length;
    const sortedLevels = frameworkData.levels.sort((a, b) => a.point_value - b.point_value);
    
    // Find the closest level to the average
    let closestLevel = sortedLevels[0];
    let minDiff = Math.abs(avgLevel - closestLevel.point_value);
    
    sortedLevels.forEach(level => {
      const diff = Math.abs(avgLevel - level.point_value);
      if (diff < minDiff) {
        minDiff = diff;
        closestLevel = level;
      }
    });
    
    return closestLevel.level_name;
  };

  const renderBehaviorGroup = (behaviors, levelName, substepId) => {
    const isEmpty = behaviors.length === 0;
    
    return (
      <div key={levelName} className="border-t border-gray-100 first:border-t-0">
        <div className={`text-xs font-bold uppercase tracking-wide px-3 py-2 ${getLevelHeaderClass(levelName)} ${isEmpty ? 'opacity-50' : ''}`}>
          {levelName} Level
        </div>
        <div className="px-3 py-2 space-y-2">
          {isEmpty ? (
            <div className="text-sm text-gray-500 italic">No behaviors defined for this level</div>
          ) : (
            behaviors.map(behavior => (
              <div key={behavior.id} className="flex items-start gap-3 p-2 bg-white rounded border border-gray-100">
                <input
                  type="checkbox"
                  id={`behavior-${behavior.id}`}
                  checked={checkedBehaviors.has(behavior.id)}
                  onChange={(e) => handleBehaviorCheck(behavior.id, e.target.checked)}
                  className={`mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 ${!isEditable ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={!isEditable}
                />
                <label htmlFor={`behavior-${behavior.id}`} className="text-sm text-gray-700 flex-1 cursor-pointer">
                  {behavior.text}
                </label>
              </div>
            ))
          )}
        </div>
      </div>
    );
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

  // Loading state
  if (loading) {
    return (
      <LayoutApp>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading framework data...</p>
          </div>
        </div>
      </LayoutApp>
    );
  }

  // Error state
  if (error) {
    return (
      <LayoutApp>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-red-600 text-lg font-semibold mb-2">Error Loading Framework</div>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </div>
      </LayoutApp>
    );
  }

  // No framework data
  if (!frameworkData) {
    return (
      <LayoutApp>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-gray-600">No framework data available</p>
          </div>
        </div>
      </LayoutApp>
    );
  }

  return (
    <LayoutApp>
      {/* Session Info Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <div className="text-xs text-gray-600">Coach: {sessionData.coach}</div>
            <div className="text-sm font-semibold text-gray-900">
              Coachee: {sessionData.coachee} {sessionData.isSelfCoaching && "(Self-Coaching)"}
            </div>
            <div className="text-xs text-gray-500">Framework: {frameworkData.framework.name}</div>
            {!isEditable && (
              <div className="text-xs text-orange-600 font-medium mt-1">
                ⚠️ This session is read-only (Status: {sessionData.status})
              </div>
            )}
          </div>
          <div className="flex flex-col items-end">
            <div className="text-xs text-gray-600">{sessionData.date} - {sessionData.time}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-600">Status:</span>
              <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusBadgeClass(sessionData.status)}`}>
                {sessionData.status.charAt(0).toUpperCase() + sessionData.status.slice(1)}
              </span>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-gray-600">Overall:</span>
              <span className={`px-2 py-1 rounded text-xs font-medium border ${getProficiencyBadgeClass(getOverallProficiency())}`}>
                {getOverallProficiency()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-4">
        {/* Coaching Context & Skills Overview */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Right Side - Spider Graph (First on mobile) */}
            <div className="flex items-center justify-center lg:order-2">
              <SpiderGraph 
                steps={frameworkData.steps}
                getStepProficiency={getStepProficiency}
                frameworkLevels={frameworkData.levels}
                size={350}
                className="w-full max-w-sm"
              />
            </div>

            {/* Left Side - Coaching Context (Second on mobile) */}
            <div className="lg:order-1">
              <h2 className="text-lg font-semibold mb-3 text-gray-900">Coaching Context</h2>
              <div className="space-y-2">
                <label htmlFor="context" className="block text-sm font-medium text-gray-700">
                  Session Context
                </label>
                <textarea
                  id="context"
                  value={context}
                  onChange={(e) => handleContextChange(e.target.value)}
                  placeholder="Describe the context of this coaching session..."
                  className={`w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${!isEditable ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  rows={6}
                  disabled={!isEditable}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Skills Analysis */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Skills Analysis</h2>
          
          <div className="space-y-3">
            {frameworkData.steps.map((step, index) => {
              const stepProf = getStepProficiency(step);
              return (
                <div key={step.id} className={`bg-white rounded-lg border-2 overflow-hidden ${getStepColorClass(index)}`}>
                  {/* Step Header */}
                  <div 
                    className="bg-gray-50 px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => toggleStep(step.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-gray-700 text-base transition-transform duration-200" 
                              style={{ transform: expandedSteps.has(step.id) ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                          ❯
                        </span>
                        <span className="font-semibold text-gray-900 text-base truncate">
                          {step.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${getProficiencyBadgeClass(stepProf.level)}`}>
                          {stepProf.level} {stepProf.isManual && '(Manual)'}
                        </span>
                        {!stepProf.isManual && stepProf.percentage !== undefined && (
                          <span className="text-xs text-gray-500">
                            Auto: {stepProf.percentage}% ({stepProf.pointsEarned || 0}/{stepProf.totalPossible || 0}pts)
                          </span>
                        )}
                        <select 
                          className={`text-xs border border-gray-300 rounded px-2 py-1 bg-white ${!isEditable ? 'opacity-50 cursor-not-allowed' : ''}`}
                          value={stepScores[step.id] || 'Auto-Calculate'}
                          onChange={(e) => handleStepScoreChange(step.id, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          disabled={!isEditable}
                        >
                          <option>Auto-Calculate</option>
                          {frameworkData.levels.sort((a, b) => a.point_value - b.point_value).map(level => (
                            <option key={level.id} value={level.level_name}>{level.level_name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Step Content */}
                  {expandedSteps.has(step.id) && (
                    <div className="p-4 bg-gray-50 space-y-4">
                      {step.substeps.map(substep => {
                        const substepProf = calculateSubstepProficiency(substep);
                        return (
                          <div key={substep.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            {/* Substep Header - Now Clickable */}
                            <div 
                              className="bg-gray-50 px-3 py-2 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                              onClick={() => toggleSubstep(substep.id)}
                            >
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-700 text-sm transition-transform duration-200" 
                                        style={{ transform: expandedSubsteps.has(substep.id) ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                                    ❯
                                  </span>
                                  <span className="font-medium text-sm text-gray-800">{substep.title}</span>
                                </div>
                                <span className="text-xs text-gray-600">
                                  Auto: {substepProf.level} ({substepProf.percentage}% - {substepProf.pointsEarned || 0}/{substepProf.totalPossible || 0}pts)
                                </span>
                              </div>
                            </div>
                            
                            {/* Behavior Groups - Now Collapsible */}
                            {expandedSubsteps.has(substep.id) && (
                              <div className="divide-y divide-gray-100">
                                {Object.keys(substep.behaviors).map(levelName => 
                                  renderBehaviorGroup(substep.behaviors[levelName] || [], levelName, substep.id)
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Coaching Notes */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Coaching Notes</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="observations" className="block text-sm font-medium text-gray-700 mb-2">
                Key Observations
              </label>
              <textarea
                id="observations"
                value={notes.keyObservations}
                onChange={(e) => handleNotesChange('keyObservations', e.target.value)}
                placeholder="What did you observe during this interaction?"
                className={`w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${!isEditable ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                rows={3}
                disabled={!isEditable}
              />
            </div>
            <div>
              <label htmlFor="strengths" className="block text-sm font-medium text-gray-700 mb-2">
                What Went Well
              </label>
              <textarea
                id="strengths"
                value={notes.whatWentWell}
                onChange={(e) => handleNotesChange('whatWentWell', e.target.value)}
                placeholder="Positive aspects and strengths demonstrated..."
                className={`w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${!isEditable ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                rows={3}
                disabled={!isEditable}
              />
            </div>
            <div>
              <label htmlFor="improvements" className="block text-sm font-medium text-gray-700 mb-2">
                What Could Be Improved
              </label>
              <textarea
                id="improvements"
                value={notes.whatCouldBeImproved}
                onChange={(e) => handleNotesChange('whatCouldBeImproved', e.target.value)}
                placeholder="Areas for development and improvement..."
                className={`w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${!isEditable ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                rows={3}
                disabled={!isEditable}
              />
            </div>
            <div>
              <label htmlFor="actionPlan" className="block text-sm font-medium text-gray-700 mb-2">
                Action Plan / Next Steps
              </label>
              <textarea
                id="actionPlan"
                value={notes.actionPlan}
                onChange={(e) => handleNotesChange('actionPlan', e.target.value)}
                placeholder="Recommended actions and follow-up..."
                className={`w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${!isEditable ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                rows={3}
                disabled={!isEditable}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-6">
          {isEditable ? (
            <>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete Session
              </Button>
              <Button 
                onClick={() => saveSession(true)} 
                className="flex-1"
              >
                Save Draft
              </Button>
              <Button 
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={() => setShowSubmitConfirm(true)}
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </Button>
            </>
          ) : (
            <div className="flex-1 text-center py-3 text-gray-600 bg-gray-100 rounded-md">
              Session is {sessionData.status} - No longer editable
            </div>
          )}
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-sm w-full">
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Submit Session?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Once submitted, this session cannot be edited anymore. Are you sure you want to continue?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSubmitConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  onClick={submitSession}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-sm w-full">
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Session?</h3>
              <p className="text-sm text-gray-600 mb-4">
                This will permanently delete this coaching session. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteSession}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auto-save Status */}
      {autoSaveVisible && (
        <div className="fixed bottom-24 left-4 right-4 bg-green-500 text-white px-4 py-2 rounded text-center text-sm z-50 transition-opacity duration-300">
          ✓ Auto-saved just now
        </div>
      )}
    </LayoutApp>
  );
}