console.log('=== ADMIN USERS ROUTE FILE LOADING ===');
// backend/routes/admin/users.js
const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const supabase = require('../../supabaseClient');
const { requireAuth, requireAdmin } = require('../../middleware/auth');

// Apply authentication and admin middleware to all routes in this file
router.use(requireAuth);  // First authenticate
router.use(requireAdmin); // Then check admin role

// GET /api/admin/users - List all active users
router.get('/', async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email, system_role, active, created_at, last_login, force_password_change')
      .eq('active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Don't return password hashes
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST /api/admin/users - Create new user
router.post('/', async (req, res) => {
  try {
    const { name, email, temporaryPassword, isAdmin } = req.body;

    console.log('Creating new user:', { name, email, isAdmin });

    if (!name || !email || !temporaryPassword) {
      return res.status(400).json({ error: 'Name, email, and temporary password are required' });
    }

    if (temporaryPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check if email already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    // Hash the temporary password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(temporaryPassword, saltRounds);

    // Create user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        name,
        email: email.toLowerCase(),
        password_hash: hashedPassword,
        system_role: isAdmin ? 'admin' : 'user',
        active: true,
        force_password_change: true, // Force password change on first login
        tenant_id: req.user.tenant_id // Use admin's tenant
      })
      .select('id, name, email, system_role, active, created_at')
      .single();

    if (error) throw error;

    console.log('User created successfully:', newUser.id);
    res.status(201).json({
      message: 'User created successfully',
      user: newUser
    });

  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// PUT /api/admin/users/:id - Update user
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, isAdmin } = req.body;

    console.log('Updating user:', id, { name, email, isAdmin });

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    // Check if email is taken by another user
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .neq('id', id)
      .single();

    if (existingUser) {
      return res.status(409).json({ error: 'Email already taken by another user' });
    }

    // Update user
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({
        name,
        email: email.toLowerCase(),
        system_role: isAdmin ? 'admin' : 'user'
      })
      .eq('id', id)
      .select('id, name, email, system_role, active, created_at')
      .single();

    if (error) throw error;

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('User updated successfully:', id);
    res.json({
      message: 'User updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// DELETE /api/admin/users/:id - Soft delete user
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    console.log('Soft deleting user:', id);

    // Check if user exists and is not the current admin
    if (id === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    // Soft delete by setting active to false
    const { data: deletedUser, error } = await supabase
      .from('users')
      .update({ active: false })
      .eq('id', id)
      .select('id, name, email')
      .single();

    if (error) throw error;

    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('User soft deleted successfully:', id);
    res.json({
      message: 'User deactivated successfully',
      user: deletedUser
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// POST /api/admin/users/:id/reset-password - Reset user password
router.post('/:id/reset-password', async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    console.log('Resetting password for user:', id);

    if (!newPassword) {
      return res.status(400).json({ error: 'New password is required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Hash the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password and force change on next login
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({
        password_hash: hashedPassword,
        force_password_change: true
      })
      .eq('id', id)
      .select('id, name, email')
      .single();

    if (error) throw error;

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('Password reset successfully for user:', id);
    res.json({
      message: 'Password reset successfully. User will be required to change password on next login.',
      user: updatedUser
    });

  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

module.exports = router;