const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');
const { requireAuth } = require('../middleware/auth');
const path = require('path');
const { generateSessionReportPDF, generateSessionReportPDFWithCustomName } = require('../utils/pdfGenerator'); // Updated import

// Get all sessions for the authenticated user
router.get('/', requireAuth, async (req, res) => {
  try {
    const { user } = req;
    
    // Get sessions where user is either coach or coachee
    const { data, error } = await supabase
      .from('coaching_sessions')
      .select(`
        *,
        coach:users!coach_id(id, name, email),
        coachee:users!coachee_id(id, name, email),
        framework:sales_frameworks(id, name),
        team:teams(id, name)
      `)
      .or(`coach_id.eq.${user.id},coachee_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get sessions for history page with stored proficiencies
router.get('/history', requireAuth, async (req, res) => {
  try {
    const { user } = req;
    
    // Get sessions where user is the coach
    const { data: sessions, error: sessionsError } = await supabase
      .from('coaching_sessions')
      .select(`
        id,
        session_date,
        created_at,
        status,
        context,
        coachee_id,
        coach:users!coach_id(id, name, email),
        coachee:users!coachee_id(id, name, email),
        framework:sales_frameworks(id, name),
        team:teams(id, name)
      `)
      .or(`coach_id.eq.${user.id},coachee_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (sessionsError) throw sessionsError;

    // Get proficiencies for all sessions
    const sessionIds = sessions.map(s => s.id);
    const { data: proficiencies, error: proficienciesError } = await supabase
      .from('session_proficiencies')
      .select('*')
      .in('session_id', sessionIds)
      .order('step_number');

    if (proficienciesError) throw proficienciesError;

    // Combine sessions with their proficiencies
    const sessionsWithProficiency = sessions.map(session => {
      const sessionProficiencies = proficiencies.filter(p => p.session_id === session.id);
      
      // Get overall proficiency
      const overallProf = sessionProficiencies.find(p => p.proficiency_type === 'overall');
      
      // Get step proficiencies
      const stepProfs = sessionProficiencies
        .filter(p => p.proficiency_type === 'step')
        .sort((a, b) => a.step_number - b.step_number)
        .map(step => ({
          step_number: step.step_number,
          level: step.level_name,
          color: getStepColor(step.level_name),
          letter: step.level_name.charAt(0).toUpperCase()
        }));

      return {
        id: session.id,
        coachee_id: session.coachee_id,
        coach: { name: session.coach?.name || 'Unknown' },
        coachee: { name: session.coachee?.name || 'Unknown' },
        team: session.team ? { name: session.team.name } : null,
        session_date: session.session_date,
        created_at: session.created_at,
        status: session.status,
        context: session.context,
        overall_proficiency: overallProf?.level_name || 'Not Evaluated',
        step_proficiencies: stepProfs
      };
    });

    res.json(sessionsWithProficiency);
  } catch (error) {
    console.error('Error fetching session history:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper function for step colors
function getStepColor(levelName) {
  switch (levelName?.toLowerCase()) {
    case 'master': return 'purple';
    case 'experienced': return 'blue';
    case 'qualified': return 'green';
    case 'learner': return 'orange';
    default: return 'gray';
  }
}

// Get latest session for specific coachee (for pre-populating new sessions)
router.get('/latest-for-coachee/:coacheeId', requireAuth, async (req, res) => {
  try {
    const { user } = req;
    const { coacheeId } = req.params;
    const excludeSessionId = req.query.exclude; // NEW: Optional parameter to exclude current session

    console.log(`🔍 === LATEST SESSION REQUEST ===`);
    console.log(`🔍 Requested coacheeId: ${coacheeId}`);
    console.log(`🔍 Coach making request: ${user.email} (ID: ${user.id})`);
    console.log(`🔍 Exclude session ID: ${excludeSessionId || 'none'}`);

    // First, let's see ALL sessions for this coach to understand what's available
    const { data: allSessions, error: allError } = await supabase
      .from('coaching_sessions')
      .select(`
        id,
        created_at,
        coachee_id,
        coach:users!coach_id(id, name, email),
        coachee:users!coachee_id(id, name, email)
      `)
      .eq('coach_id', user.id)
      .order('created_at', { ascending: false });

    if (allError) {
      console.log(`❌ Error fetching all sessions: ${allError.message}`);
    } else {
      console.log(`📊 All sessions for coach ${user.email}:`);
      allSessions.forEach(session => {
        console.log(`   - Session ${session.id.slice(-8)}: ${session.coachee.name} (ID: ${session.coachee_id}) - ${session.created_at}`);
      });
    }

    // Build the query to get latest session for this coachee
    let query = supabase
      .from('coaching_sessions')
      .select(`
        *,
        coach:users!coach_id(id, name, email),
        coachee:users!coachee_id(id, name, email),
        framework:sales_frameworks(id, name),
        team:teams(id, name)
      `)
      .eq('coach_id', user.id)
      .eq('coachee_id', coacheeId)
      .order('created_at', { ascending: false })
      .limit(1);

    // NEW: Exclude current session if specified
    if (excludeSessionId) {
      console.log(`🚫 Excluding session ID: ${excludeSessionId}`);
      query = query.neq('id', excludeSessionId);
    }

    const { data: session, error: sessionError } = await query.single();

    if (sessionError || !session) {
      console.log(`🚫 No previous session found for coachee ID: ${coacheeId}`);
      console.log(`🚫 Error details:`, sessionError);
      return res.json({
        session: null,
        notes: null,
        scores: [],
        isEditable: true
      });
    }

    console.log(`📋 Found latest session for coachee ${session.coachee.name}:`);
    console.log(`   - Session ID: ${session.id}`);
    console.log(`   - Created: ${session.created_at}`);
    console.log(`   - Coach: ${session.coach.name}`);
    console.log(`   - Coachee: ${session.coachee.name} (ID: ${session.coachee_id})`);

    // Get notes and scores
    const { data: notes, error: notesError } = await supabase
      .from('session_notes')
      .select('*')
      .eq('session_id', session.id)
      .single();

    const { data: scores, error: scoresError } = await supabase
      .from('session_scores')
      .select('*')
      .eq('session_id', session.id);

    console.log(`📝 Notes found: ${notes ? 'Yes' : 'No'}`);
    console.log(`🎯 Scores found: ${scores ? scores.length : 0} records`);

    const response = {
      session,
      notes: notes || null,
      scores: scores || [],
      isEditable: true
    };

    console.log(`📤 Sending latest session data for pre-population`);
    console.log(`🔍 === END LATEST SESSION REQUEST ===`);
    res.json(response);

  } catch (error) {
    console.error('💥 Error fetching latest session for coachee:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get a specific session by ID
router.get('/:sessionId', requireAuth, async (req, res) => {
  try {
    const { user } = req;
    const { sessionId } = req.params;

    // Get session with all related data
    const { data: session, error: sessionError } = await supabase
      .from('coaching_sessions')
      .select(`
        *,
        coach:users!coach_id(id, name, email),
        coachee:users!coachee_id(id, name, email),
        framework:sales_frameworks(id, name),
        team:teams(id, name)
      `)
      .eq('id', sessionId)
      .or(`coach_id.eq.${user.id},coachee_id.eq.${user.id}`)
      .single();

    if (sessionError || !session) {
      return res.status(404).json({ error: 'Session not found or access denied' });
    }

    // Get session notes
    const { data: notes, error: notesError } = await supabase
      .from('session_notes')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    // Get session scores
    const { data: scores, error: scoresError } = await supabase
      .from('session_scores')
      .select('*')
      .eq('session_id', sessionId);

    res.json({
      session,
      notes: notes || null,
      scores: scores || [],
      isEditable: session.status === 'draft' && session.coach_id === user.id
    });

  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new session
router.post('/', requireAuth, async (req, res) => {
  try {
    const { user } = req;
    const { coachee_id, framework_id } = req.body;

    if (!coachee_id || !framework_id) {
      return res.status(400).json({ 
        error: 'coachee_id and framework_id are required' 
      });
    }

    // Verify the coachee exists and belongs to the same tenant
    const { data: coachee, error: coacheeError } = await supabase
      .from('users')
      .select('id, name, tenant_id, active')
      .eq('id', coachee_id)
      .eq('tenant_id', user.tenant_id)
      .eq('active', true)
      .single();

    if (coacheeError || !coachee) {
      return res.status(404).json({ error: 'Coachee not found or inactive' });
    }

    // Find a team where this coaching relationship exists (if not self-coaching)
    let team_id = null;
    if (coachee_id !== user.id) {
      // Get teams where user is coach and coachee is member
      const { data: coachTeams, error: coachTeamsError } = await supabase
        .from('team_memberships')
        .select('team_id')
        .eq('user_id', user.id)
        .eq('team_role', 'coach')
        .eq('tenant_id', user.tenant_id);

      if (coachTeamsError) throw coachTeamsError;

      const { data: coacheeTeams, error: coacheeTeamsError } = await supabase
        .from('team_memberships')
        .select('team_id')
        .eq('user_id', coachee_id)
        .eq('team_role', 'coachee')
        .eq('tenant_id', user.tenant_id);

      if (coacheeTeamsError) throw coacheeTeamsError;

      // Find common teams
      const commonTeams = coachTeams.filter(ct => 
        coacheeTeams.some(cet => cet.team_id === ct.team_id)
      );

      if (commonTeams.length === 0) {
        return res.status(403).json({ 
          error: 'You are not authorized to coach this user' 
        });
      }
      
      team_id = commonTeams[0].team_id; // Use first common team
    }

    // Create the coaching session
    const { data, error } = await supabase
      .from('coaching_sessions')
      .insert([{ 
        coach_id: user.id,
        coachee_id: coachee_id,
        team_id: team_id,
        framework_id: framework_id,
        session_date: new Date().toISOString().split('T')[0],
        status: 'draft' // Always start as draft
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      session_id: data.id,
      coach_id: data.coach_id,
      coachee_id: data.coachee_id,
      team_id: data.team_id,
      framework_id: data.framework_id,
      session_date: data.session_date,
      status: data.status
    });

  } catch (error) {
    console.error('Error creating coaching session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update session status (submit/draft) - WITH PDF GENERATION ON SUBMIT
router.patch('/:sessionId/status', requireAuth, async (req, res) => {
  try {
    const { user } = req;
    const { sessionId } = req.params;
    const { status } = req.body;

    console.log(`🎯 Status update requested: ${status} for session: ${sessionId}`);

    // Validate status
    const validStatuses = ['draft', 'submitted'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Verify the session exists and user is the coach
    const { data: session, error: sessionError } = await supabase
      .from('coaching_sessions')
      .select('id, coach_id, status')
      .eq('id', sessionId)
      .eq('coach_id', user.id)
      .single();

    if (sessionError || !session) {
      return res.status(404).json({ error: 'Session not found or access denied' });
    }

    // Check if session is already submitted and trying to change
    if (session.status === 'submitted' && status === 'draft') {
      return res.status(400).json({ 
        error: 'Cannot change submitted session back to draft' 
      });
    }

    // Update the session status
    const { data, error: updateError } = await supabase
      .from('coaching_sessions')
      .update({ 
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)
      .eq('coach_id', user.id)
      .select()
      .single();

    if (updateError) throw updateError;

 // UPDATED SECTION: PDF Generation when session is submitted
// Replace the PDF generation section in your coachingSessions.js file

// 🆕 NEW: Generate PDF Report when session is submitted
if (status === 'submitted') {
  console.log('🎯 Session submitted - starting PDF report generation...');
  
  try {
    // Gather all data needed for the PDF report
    const reportData = await gatherReportData(sessionId);
    
    // CRITICAL: Ensure we have coachee name and date
    console.log('🔍 Debug reportData structure:');
    console.log('  - Session ID:', reportData.session?.id);
    console.log('  - Coachee name:', reportData.session?.coachee?.name);
    console.log('  - Session date:', reportData.session?.session_date);
    console.log('  - Coach name:', reportData.session?.coach?.name);
    
    // Define reports directory
    const reportsDir = path.join(__dirname, '..', 'reports');
    
    // Generate custom filename with MORE robust error handling
    let coacheeName = 'Unknown-Coachee';
    let sessionDate = 'Unknown-Date';
    
    if (reportData.session?.coachee?.name) {
      coacheeName = reportData.session.coachee.name.trim();
      console.log('✅ Coachee name found:', coacheeName);
    } else {
      console.log('⚠️ Warning: No coachee name found in reportData');
    }
    
    if (reportData.session?.session_date) {
      // Format date as YYYY-MM-DD for filename safety
      const dateObj = new Date(reportData.session.session_date);
      sessionDate = dateObj.toISOString().split('T')[0]; // Gets YYYY-MM-DD
      console.log('✅ Session date found and formatted:', sessionDate);
    } else {
      console.log('⚠️ Warning: No session date found in reportData');
    }
    
    // Format filename - be more aggressive about cleaning characters
    const safeCoacheeName = coacheeName
      .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special chars except spaces
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .substring(0, 30); // Limit length
    
    const safeSessionDate = sessionDate.replace(/[^a-zA-Z0-9-]/g, '');
    
    const customFilename = `Coaching-Session-Report-${safeCoacheeName}-${safeSessionDate}.pdf`;
    
    console.log('🎯 Generated custom filename:', customFilename);
    console.log('🎯 Safe coachee name:', safeCoacheeName);
    console.log('🎯 Safe session date:', safeSessionDate);
    
    // Generate the PDF with custom filename
    const pdfPath = await generateSessionReportPDFWithCustomName(reportData, reportsDir, customFilename);
    
    console.log('📄 PDF generated at path:', pdfPath);
    
    // Update the session with the PDF path - store the FULL path
    const { error: pdfUpdateError } = await supabase
      .from('coaching_sessions')
      .update({ 
        report_pdf_path: pdfPath, // Store full path
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    if (pdfUpdateError) {
      console.error('❌ Error updating PDF path in database:', pdfUpdateError);
      // Don't throw here - the status update succeeded
    } else {
      console.log('✅ PDF path saved to database:', pdfPath);
    }
    
  } catch (pdfError) {
    console.error('❌ PDF generation failed:', pdfError);
    console.error('❌ PDF error stack:', pdfError.stack);
    // Don't throw here - status update should succeed even if PDF fails
  }
}

    res.json({ 
      message: `Session ${status} successfully`,
      session: data
    });

  } catch (error) {
    console.error('Error updating session status:', error);
    res.status(500).json({ 
      error: 'Failed to update session status',
      details: error.message 
    });
  }
});

// Save session notes and scores (only for draft sessions)
router.put('/:sessionId/save', requireAuth, async (req, res) => {
  try {
    const { user } = req;
    const { sessionId } = req.params;
    const { context, notes, scores, stepScores, calculatedProficiencies } = req.body;

    // Verify the session exists, user is coach, and it's still a draft
    const { data: session, error: sessionError } = await supabase
      .from('coaching_sessions')
      .select('id, coach_id, status')
      .eq('id', sessionId)
      .eq('coach_id', user.id)
      .single();

    if (sessionError || !session) {
      return res.status(404).json({ error: 'Session not found or access denied' });
    }

    if (session.status !== 'draft') {
      return res.status(400).json({ 
        error: 'Cannot modify submitted session' 
      });
    }

    // Update session context
    if (context !== undefined) {
      await supabase
        .from('coaching_sessions')
        .update({ 
          context: context,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);
    }

    // Handle session notes with insert/update logic
    if (notes) {
      console.log('Saving notes:', notes);
      
      // First check if notes exist for this session
      const { data: existingNotes, error: checkError } = await supabase
        .from('session_notes')
        .select('id')
        .eq('session_id', sessionId)
        .single();

      const notesData = {
        session_id: sessionId,
        context: notes.context || null,
        key_observations: notes.keyObservations || null,
        what_went_well: notes.whatWentWell || null,
        improvements: notes.whatCouldBeImproved || null,
        next_steps: notes.actionPlan || null,
        updated_at: new Date().toISOString()
      };

      let notesError;
      
      if (existingNotes) {
        // Update existing notes
        console.log('Updating existing notes');
        const { error } = await supabase
          .from('session_notes')
          .update(notesData)
          .eq('session_id', sessionId);
        notesError = error;
      } else {
        // Insert new notes
        console.log('Inserting new notes');
        const { error } = await supabase
          .from('session_notes')
          .insert([notesData]);
        notesError = error;
      }

      if (notesError) {
        console.error('Notes save error:', notesError);
        throw notesError;
      }
      console.log('Notes saved successfully');
    }

    // Handle all session scores (both behavior scores and step overrides)
    console.log('Saving behavior scores:', scores);
    console.log('Saving step overrides:', stepScores);

    // Delete all existing scores for this session
    const { error: deleteError } = await supabase
      .from('session_scores')
      .delete()
      .eq('session_id', sessionId);

    if (deleteError) {
      console.error('Error deleting existing scores:', deleteError);
      throw deleteError;
    }

    const allScoresData = [];

    // Add behavior scores (checked behaviors)
    if (scores && Array.isArray(scores)) {
      scores.forEach(score => {
        allScoresData.push({
          session_id: sessionId,
          behavior_id: score.behavior_id,
          checked: score.checked,
          step_level: null // Behavior scores don't have step_level
        });
      });
    }

    // Add step-level manual overrides
    if (stepScores && Object.keys(stepScores).length > 0) {
      Object.entries(stepScores).forEach(([stepId, level]) => {
        if (level && level !== 'Auto-Calculate') {
          allScoresData.push({
            session_id: sessionId,
            behavior_id: null,
            checked: null,
            step_level: level,
            step_id: stepId // Add the step reference
          });
        }
      });
    }

    // Insert all scores at once
    if (allScoresData.length > 0) {
      console.log('Inserting all scores data:', allScoresData);
      const { error: scoresError } = await supabase
        .from('session_scores')
        .insert(allScoresData);

      if (scoresError) {
        console.error('Scores save error:', scoresError);
        throw scoresError;
      }
      console.log('All scores saved successfully');
    } else {
      console.log('No scores to save');
    }

    // Handle calculated proficiencies
    if (calculatedProficiencies && Array.isArray(calculatedProficiencies)) {
      console.log('Saving calculated proficiencies:', calculatedProficiencies.length);

      // Delete existing proficiencies for this session
      const { error: deleteProficienciesError } = await supabase
        .from('session_proficiencies')
        .delete()
        .eq('session_id', sessionId);

      if (deleteProficienciesError) {
        console.error('❌ Error deleting existing proficiencies:', deleteProficienciesError);
        throw deleteProficienciesError;
      } else {
        console.log('✅ Deleted existing proficiencies');
      }

      // Backend safeguard: Remove duplicate step proficiencies for the same session/step_number/type
      const proficienciesMap = new Map();
      for (const prof of calculatedProficiencies) {
        if (!prof.proficiency_type) continue;
        if (prof.proficiency_type === 'overall') {
          // Use a special key for overall proficiency
          proficienciesMap.set('overall', prof);
        } else if (prof.step_number) {
          const key = `${prof.step_number}-${prof.proficiency_type}`;
          proficienciesMap.set(key, prof);
        }
      }
      
      const uniqueProficiencies = Array.from(proficienciesMap.values());

      const proficienciesData = uniqueProficiencies.map(prof => ({
        session_id: sessionId,
        step_id: prof.step_id,
        step_number: prof.step_number,
        proficiency_type: prof.proficiency_type,
        level_name: prof.level_name,
        is_manual: prof.is_manual,
        points_earned: prof.points_earned,
        total_possible: prof.total_possible,
        percentage: prof.percentage,
        calculated_at: new Date().toISOString()
      }));

      console.log('📝 Inserting proficiencies:', proficienciesData.length);
      const { data: insertedProfs, error: proficienciesError } = await supabase
        .from('session_proficiencies')
        .insert(proficienciesData)
        .select();

      if (proficienciesError) {
        console.error('❌ Proficiencies save error:', proficienciesError);
        throw proficienciesError;
      }
      
      console.log('✅ Proficiencies saved successfully');
    }



    // Send success response to client
    res.status(200).json({ success: true });

  } catch (error) {
    console.error('Error saving session notes/scores:', error);
    res.status(500).json({ 
      error: 'Failed to save session notes/scores',
      details: error.message 
    });
  }
});

// UPDATED gatherReportData function with enhanced debugging
// Replace the existing gatherReportData function in your coachingSessions.js

async function gatherReportData(sessionId) {
  console.log('📊 === ENHANCED GATHERING REPORT DATA ===');
  console.log('📊 Session ID:', sessionId);
  
  // Get session with all related data - MORE EXPLICIT JOIN
  const { data: session, error: sessionError } = await supabase
    .from('coaching_sessions')
    .select(`
      id,
      coach_id,
      coachee_id,
      team_id,
      framework_id,
      session_date,
      context,
      status,
      created_at,
      updated_at,
      coach:users!coach_id(id, name, email),
      coachee:users!coachee_id(id, name, email),
      framework:sales_frameworks(id, name)
    `)
    .eq('id', sessionId)
    .single();

  if (sessionError || !session) {
    console.log('❌ Session error:', sessionError);
    throw new Error('Session not found: ' + sessionError?.message);
  }

  // ENHANCED: Debug session data structure
  console.log('📊 === SESSION DATA DEBUG ===');
  console.log('📊 Raw session object keys:', Object.keys(session));
  console.log('📊 Session ID:', session.id);
  console.log('📊 Coach ID:', session.coach_id);
  console.log('📊 Coachee ID:', session.coachee_id);
  console.log('📊 Session date:', session.session_date);
  console.log('📊 Framework ID:', session.framework_id);
  
  console.log('📊 === COACH DATA DEBUG ===');
  console.log('📊 Coach object:', session.coach);
  console.log('📊 Coach name:', session.coach?.name);
  console.log('📊 Coach email:', session.coach?.email);
  
  console.log('📊 === COACHEE DATA DEBUG ===');
  console.log('📊 Coachee object:', session.coachee);
  console.log('📊 Coachee name:', session.coachee?.name);
  console.log('📊 Coachee email:', session.coachee?.email);
  
  console.log('📊 === FRAMEWORK DATA DEBUG ===');
  console.log('📊 Framework object:', session.framework);
  console.log('📊 Framework name:', session.framework?.name);

  // If coachee name is missing, try a direct query
  if (!session.coachee?.name) {
    console.log('⚠️ Coachee name missing, trying direct query...');
    const { data: coacheeData, error: coacheeError } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('id', session.coachee_id)
      .single();
    
    if (coacheeData) {
      console.log('📊 Direct coachee query result:', coacheeData);
      // Patch the session object
      session.coachee = coacheeData;
    } else {
      console.log('❌ Direct coachee query failed:', coacheeError);
    }
  }

  // Get session notes - ENHANCED with error handling
  const { data: notes, error: notesError } = await supabase
    .from('session_notes')
    .select('*')
    .eq('session_id', sessionId)
    .single();

  if (notesError && notesError.code !== 'PGRST116') { // PGRST116 = no rows found
    console.log('❌ Error fetching notes (not "no rows"):', notesError);
  } else if (notesError?.code === 'PGRST116') {
    console.log('📝 No session notes found for session:', sessionId);
  } else {
    console.log('📝 Session notes found, context length:', notes?.context?.length || 0);
  }

  // Get session scores
  const { data: scores, error: scoresError } = await supabase
    .from('session_scores')
    .select('*')
    .eq('session_id', sessionId);

  if (scoresError) {
    console.log('❌ Error fetching scores:', scoresError);
  }

  // Get proficiencies
  const { data: proficiencies, error: proficienciesError } = await supabase
    .from('session_proficiencies')
    .select('*')
    .eq('session_id', sessionId)
    .order('step_number');

  if (proficienciesError) {
    console.log('❌ Error fetching proficiencies:', proficienciesError);
  }

  // Get framework steps
  const { data: frameworkSteps, error: stepsError } = await supabase
    .from('framework_steps')
    .select('*')
    .eq('framework_id', session.framework_id)
    .order('step_number');

  if (stepsError) {
    console.log('❌ Error fetching framework steps:', stepsError);
  }

  // Get all framework data needed for proper behavior organization
  let allBehaviors = [];
  let substeps = [];
  let behaviorLevels = [];
  
  if (frameworkSteps && frameworkSteps.length > 0) {
    // Get substeps for the framework
    const { data: frameworkSubsteps, error: substepsError } = await supabase
      .from('framework_substeps')
      .select('*')
      .eq('framework_id', session.framework_id);
    
    if (substepsError) {
      console.log('❌ Error fetching framework substeps:', substepsError);
    } else {
      substeps = frameworkSubsteps || [];
    }

    // Get all behaviors for the framework WITH their level information
    const { data: frameworkBehaviors, error: behaviorError } = await supabase
      .from('framework_behaviors')
      .select(`
        *,
        level:behavior_levels(level_name, point_value)
      `)
      .eq('framework_id', session.framework_id);
    
    if (behaviorError) {
      console.log('❌ Error fetching framework behaviors:', behaviorError);
    } else {
      allBehaviors = frameworkBehaviors || [];
    }

    // Get behavior levels for proper ordering
    const { data: levels, error: levelsError } = await supabase
      .from('behavior_levels')
      .select('*')
      .eq('framework_id', session.framework_id)
      .order('point_value');
    
    if (levelsError) {
      console.log('❌ Error fetching behavior levels:', levelsError);
    } else {
      behaviorLevels = levels || [];
    }
  }

  console.log(`📊 Found ${frameworkSteps?.length || 0} framework steps`);
  console.log(`📊 Found ${substeps?.length || 0} framework substeps`);
  console.log(`📊 Found ${allBehaviors?.length || 0} framework behaviors`);
  console.log(`📊 Found ${behaviorLevels?.length || 0} behavior levels`);
  console.log(`📊 Found ${scores?.length || 0} session scores`);
  console.log(`📊 Found ${proficiencies?.length || 0} proficiencies`);

  // Process step proficiencies with sub-steps showing behaviors with level prefixes
  const stepProficiencies = frameworkSteps?.map(step => {
    const stepProf = proficiencies?.find(p => p.step_number === step.step_number && p.proficiency_type === 'step');
    
    // Get substeps for this step
    const stepSubsteps = substeps.filter(substep => substep.step_id === step.id);
    
    // Group by substep, add level prefixes to behaviors
    const substepGroups = [];
    
    stepSubsteps.forEach(substep => {
      // Get behaviors for this specific substep
      const substepBehaviors = allBehaviors.filter(behavior => behavior.substep_id === substep.id);
      
      if (substepBehaviors.length > 0) {
        // Sort behaviors by level (L1, L2, L3, L4) and add prefixes
        const behaviorsWithPrefixes = substepBehaviors
          .sort((a, b) => {
            const aLevel = a.level?.point_value || 0;
            const bLevel = b.level?.point_value || 0;
            return aLevel - bLevel;
          })
          .map(behavior => {
            // Find if this behavior was scored in the session
            const scoreRecord = scores?.find(s => s.behavior_id === behavior.id);
            
            // Get level prefix (L1, L2, L3, L4)
            const levelValue = behavior.level?.point_value || 1;
            const levelPrefix = `L${levelValue}`;
            
            return {
              text: `${levelPrefix}. ${behavior.description || 'No description'}`,
              checked: scoreRecord ? scoreRecord.checked : false
            };
          });

        substepGroups.push({
          group_name: substep.name, // Sub-step name as group header
          items: behaviorsWithPrefixes
        });
      }
    });

    console.log(`📊 Step ${step.step_number} (${step.name}): ${substepGroups.length} substeps with behaviors`);

    return {
      step_number: step.step_number,
      step_name: step.name,
      level_name: stepProf?.level_name || 'Not Evaluated',
      behaviors: substepGroups  // Now organized by substep with level prefixes
    };
  }) || [];

  // Get overall proficiency
  const overallProf = proficiencies?.find(p => p.proficiency_type === 'overall');

  // FINAL DEBUG: Verify coachee name is available
  console.log('📊 === FINAL VERIFICATION ===');
  console.log('📊 Final session.coachee?.name:', session.coachee?.name);
  console.log('📊 Final session.session_date:', session.session_date);
  console.log('📊 Overall proficiency:', overallProf?.level_name);
  console.log('📊 Step proficiencies count:', stepProficiencies.length);
  console.log('📊 === END REPORT DATA GATHERING ===');
  
  return {
    session,
    notes: notes || {},
    session_scores: scores || [], // Include session_scores for template
    stepProficiencies,
    overallProficiency: overallProf?.level_name || 'Not Evaluated'
  };
}

// Delete a coaching session (only drafts)
router.delete('/:sessionId', requireAuth, async (req, res) => {
  try {
    const { user } = req;
    const { sessionId } = req.params;

    // Verify the session exists, user is coach, and it's a draft
    const { data: session, error: sessionError } = await supabase
      .from('coaching_sessions')
      .select('id, coach_id, status')
      .eq('id', sessionId)
      .eq('coach_id', user.id)
      .single();

    if (sessionError || !session) {
      return res.status(404).json({ error: 'Session not found or access denied' });
    }

    if (session.status !== 'draft') {
      return res.status(400).json({ 
        error: 'Cannot delete submitted session' 
      });
    }

    // Delete the session (cascade will handle related records)
    const { error: deleteError } = await supabase
      .from('coaching_sessions')
      .delete()
      .eq('id', sessionId)
      .eq('coach_id', user.id);

    if (deleteError) throw deleteError;

    res.json({ message: 'Session deleted successfully' });

  } catch (error) {
    console.error('Error deleting coaching session:', error);
    res.status(500).json({ 
      error: 'Failed to delete coaching session',
      details: error.message 
    });
  }
});

module.exports = router;