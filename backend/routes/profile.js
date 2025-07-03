// backend/routes/profile.js
const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// GET /api/profile - Get current user profile
router.get('/', async (req, res) => {
  try {
    // TODO: Add authentication middleware to get user ID from token
    // For now, we'll use a hardcoded user ID or get it from query params
    const userId = req.query.userId || 'cd663ebb-a679-4841-88b0-afe1eb13bec8'; // Your tenant ID as fallback
    
    console.log('Fetching profile for user:', userId);

    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, system_role, created_at')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// PUT /api/profile - Update user profile
router.put('/', async (req, res) => {
  try {
    // TODO: Add authentication middleware to get user ID from token
    // For now, we'll use a hardcoded user ID or get it from query params
    const userId = req.query.userId || req.body.userId;
    const { name, email } = req.body;

    console.log('Updating profile for user:', userId, { name, email });

    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    // Check if email is already taken by another user
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .neq('id', userId)
      .single();

    if (existingUser) {
      return res.status(409).json({ error: 'Email address is already in use' });
    }

    // Update user profile
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({ 
        name: name,
        email: email 
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      throw error;
    }

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;