const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// Add session notes
router.post('/', async (req, res) => {
  const { session_id, context, key_observations, what_went_well, improvements, next_steps } = req.body;

  if (!session_id) return res.status(400).json({ error: 'session_id is required' });

  const { data, error } = await supabase
    .from('session_notes')
    .insert([{ session_id, context, key_observations, what_went_well, improvements, next_steps }])
    .select();

  if (error) return res.status(500).json({ error: error.message });

  res.status(201).json(data[0]);
});

module.exports = router;
