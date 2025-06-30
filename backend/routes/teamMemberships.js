const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// Get all team memberships
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('team_memberships')
    .select('*');

  if (error) return res.status(500).json({ error: error.message });

  res.json(data);
});

// Add user to a team with role
router.post('/', async (req, res) => {
  const { user_id, team_id, team_role } = req.body;

  if (!user_id || !team_id || !team_role) {
    return res.status(400).json({ error: 'user_id, team_id, and team_role are required' });
  }

  const { data, error } = await supabase
    .from('team_memberships')
    .insert([{ user_id, team_id, team_role }])
    .select();

  if (error) return res.status(500).json({ error: error.message });

  res.status(201).json(data[0]);
});

module.exports = router;
