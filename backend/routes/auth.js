// backend/routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const supabase = require('../supabaseClient');
const { generateToken, requireAuth } = require('../middleware/auth');

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt for:', email);

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Get user by email
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (error || !user) {
      console.log('User not found:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    let isValidPassword = false;

    // Check if password_hash looks like a bcrypt hash (starts with $2b$)
    if (user.password_hash && user.password_hash.startsWith('$2b$')) {
      // It's a bcrypt hash - use bcrypt comparison
      isValidPassword = await bcrypt.compare(password, user.password_hash);
      console.log('Used bcrypt comparison');
    } else {
      // It's plain text - direct comparison
      isValidPassword = password === user.password_hash;
      console.log('Used plain text comparison');
    }
    
    if (!isValidPassword) {
      console.log('Invalid password for:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = generateToken(user);

    // Return user data (without password hash) and token
    const { password_hash, ...userWithoutPassword } = user;
    
    console.log('Login successful for:', email);
    res.json({
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user profile
router.get('/me', requireAuth, async (req, res) => {
  try {
    const { password_hash, ...userWithoutPassword } = req.user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/me', requireAuth, async (req, res) => {
  try {
    const { name, email } = req.body;

    console.log('=== PROFILE UPDATE DEBUG ===');
    console.log('User ID:', req.user.id);
    console.log('Current user email:', req.user.email);
    console.log('New name:', name);
    console.log('New email:', email);

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    // Check if email is already taken by another user
    console.log('Checking for existing email...');
    const { data: existingUser, error: existingUserError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .neq('id', req.user.id)
      .single();

    if (existingUserError && existingUserError.code !== 'PGRST116') {
      console.log('Error checking existing user:', existingUserError);
    }

    if (existingUser) {
      console.log('Email already taken by user:', existingUser.id);
      return res.status(409).json({ error: 'Email already taken' });
    }

    console.log('Email is available, proceeding with update...');

    // First, let's verify the user exists
    console.log('Checking if user exists...');
    const { data: userCheck, error: userCheckError } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('id', req.user.id)
      .single();

    console.log('User check result:');
    console.log('Error:', userCheckError);
    console.log('User found:', userCheck);

    if (!userCheck) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({
        name,
        email: email.toLowerCase()
        // Removed updated_at since column doesn't exist
      })
      .eq('id', req.user.id)
      .select()
      .single();

    console.log('Update result:');
    console.log('Error:', error);
    console.log('Updated user:', updatedUser);

    if (error) {
      console.error('Profile update error details:', error);
      return res.status(500).json({ 
        error: 'Failed to update profile',
        details: error.message 
      });
    }

    if (!updatedUser) {
      console.error('No user returned after update');
      return res.status(500).json({ error: 'Update failed - no user returned' });
    }

    console.log('Profile updated successfully for:', req.user.id);

    // Return user data (without password hash)
    const { password_hash, ...userWithoutPassword } = updatedUser;
    
    res.json({
      message: 'Profile updated successfully',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Profile update catch error:', error);
    res.status(500).json({ 
      error: 'Profile update failed',
      details: error.message 
    });
  }
});

// Change password
router.put('/change-password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    // Verify current password
    let isValidPassword = false;
    if (req.user.password_hash && req.user.password_hash.startsWith('$2b$')) {
      isValidPassword = await bcrypt.compare(currentPassword, req.user.password_hash);
    } else {
      isValidPassword = currentPassword === req.user.password_hash;
    }
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    const { error } = await supabase
      .from('users')
      .update({
        password_hash: newPasswordHash
        // Removed updated_at since column doesn't exist
      })
      .eq('id', req.user.id);

    if (error) {
      console.error('Password update error:', error);
      return res.status(500).json({ error: 'Failed to update password' });
    }

    res.json({ message: 'Password updated successfully' });

  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: 'Password change failed' });
  }
});

module.exports = router;