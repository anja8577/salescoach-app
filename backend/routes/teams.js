const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// Get all teams
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('teams')
    .select('*');

  if (error) return res.status(500).json({ error: error.message });

  res.json(data);
});

// Create new team
router.post('/', async (req, res) => {
  const { name } = req.body;

  if (!name) return res.status(400).json({ error: 'Team name is required' });

  const { data, error } = await supabase
    .from('teams')
    .insert([{ name }])
    .select();

  if (error) return res.status(500).json({ error: error.message });

  res.status(201).json(data[0]);
});

module.exports = router;
