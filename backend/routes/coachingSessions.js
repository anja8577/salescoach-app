const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// Get all sessions
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('coaching_sessions')
    .select('*');

  if (error) return res.status(500).json({ error: error.message });

  res.json(data);
});

// Create new session
router.post('/', async (req, res) => {
  const { coach_id, coachee_id, team_id } = req.body;

  if (!coach_id || !coachee_id || !team_id) {
    return res.status(400).json({ error: 'coach_id, coachee_id, and team_id are required' });
  }

  const { data, error } = await supabase
    .from('coaching_sessions')
    .insert([{ coach_id, coachee_id, team_id }])
    .select();

  if (error) return res.status(500).json({ error: error.message });

  res.status(201).json(data[0]);
});

module.exports = router;
