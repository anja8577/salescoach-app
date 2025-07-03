// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// For now, we'll create a simple password change without bcrypt
// You can add bcrypt later when you have proper authentication

// PUT /api/auth/change-password - Change user password
router.put('/change-password', async (req, res) => {
  try {
    // TODO: Add authentication middleware to get user ID from token
    // For now, we'll use a hardcoded user ID or get it from query params
    const userId = req.query.userId || req.body.userId;
    const { currentPassword, newPassword } = req.body;

    console.log('Changing password for user:', userId);

    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    // For now, we'll just update the password without verification
    // TODO: Add proper password verification with bcrypt
    
    // Update password in database (storing plain text for now - NOT recommended for production)
    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash: newPassword }) // TODO: Hash this password with bcrypt
      .eq('id', userId);

    if (updateError) {
      console.error('Supabase update error:', updateError);
      throw updateError;
    }

    res.json({ message: 'Password changed successfully' });

  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

module.exports = router;