const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');
const { requireAuth } = require('../middleware/auth');

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

// Update session status (submit/draft)
router.patch('/:sessionId/status', requireAuth, async (req, res) => {
  try {
    const { user } = req;
    const { sessionId } = req.params;
    const { status } = req.body;

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
    const { context, notes, scores, stepScores } = req.body;

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
        step_id: stepId // ← Add the step reference
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

    res.json({ message: 'Session notes and scores saved successfully' });

  } catch (error) {
    console.error('Error saving session notes/scores:', error);
    res.status(500).json({ 
      error: 'Failed to save session notes/scores',
      details: error.message 
    });
  }
});

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