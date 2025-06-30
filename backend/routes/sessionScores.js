const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// Add session scores
router.post('/', async (req, res) => {
  const { session_id, behavior_id, checked, step_level } = req.body;

  if (!session_id || !behavior_id) {
    return res.status(400).json({ error: 'session_id and behavior_id are required' });
  }

  const { data, error } = await supabase
    .from('session_scores')
    .insert([{ session_id, behavior_id, checked, step_level }])
    .select();

  if (error) return res.status(500).json({ error: error.message });

  res.status(201).json(data[0]);
});

module.exports = router;
