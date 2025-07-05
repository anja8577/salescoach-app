// backend/routes/admin/teams.js
const express = require('express');
const router = express.Router();
const supabase = require('../../supabaseClient');
const { requireAuth, requireAdmin } = require('../../middleware/auth');

// Apply authentication and admin middleware to all routes in this file
router.use(requireAuth);  // First authenticate
router.use(requireAdmin); // Then check admin role

// GET /api/admin/teams - List all teams with member counts
router.get('/', async (req, res) => {
  try {
    console.log('Fetching all teams with member details...');

    // Get all teams for this tenant only
    const { data: allTeams, error: teamsError } = await supabase
      .from('teams')
      .select('id, name, created_at')
      .eq('tenant_id', req.user.tenant_id) // Filter by tenant
      .order('created_at', { ascending: false });

    if (teamsError) {
      console.error('Error fetching teams:', teamsError);
      throw teamsError;
    }

    console.log(`Found ${allTeams.length} teams`);

    // Get all team memberships for this tenant
    const { data: allMemberships, error: membershipsError } = await supabase
      .from('team_memberships')
      .select('team_id, user_id, team_role')
      .eq('tenant_id', req.user.tenant_id); // Filter by tenant

    if (membershipsError) {
      console.error('Error fetching memberships:', membershipsError);
      throw membershipsError;
    }

    console.log(`Found ${allMemberships.length} memberships`);

    // Get all active users for this tenant
    const { data: allUsers, error: usersError } = await supabase
      .from('users')
      .select('id, name, email, active')
      .eq('tenant_id', req.user.tenant_id) // Filter by tenant
      .eq('active', true);

    if (usersError) {
      console.error('Error fetching users:', usersError);
      throw usersError;
    }

    console.log(`Found ${allUsers.length} active users`);

    // Create user lookup map
    const userMap = {};
    allUsers.forEach(user => {
      userMap[user.id] = user;
    });

    // Group memberships by team with user details
    const membershipsByTeam = {};
    allMemberships.forEach(membership => {
      const user = userMap[membership.user_id];
      if (user) { // Only include if user exists and is active
        if (!membershipsByTeam[membership.team_id]) {
          membershipsByTeam[membership.team_id] = [];
        }
        membershipsByTeam[membership.team_id].push({
          user_id: user.id,
          name: user.name,
          email: user.email,
          role: membership.team_role
        });
      }
    });

    // Transform teams with member data
    const teamsWithCounts = allTeams.map(team => {
      const members = membershipsByTeam[team.id] || [];
      const coaches = members.filter(m => m.role === 'coach');
      const coachees = members.filter(m => m.role === 'coachee');
      
      return {
        id: team.id,
        name: team.name,
        created_at: team.created_at,
        coach_count: coaches.length,
        coachee_count: coachees.length,
        total_members: members.length,
        members: members
      };
    });

    console.log(`Returning ${teamsWithCounts.length} teams with member data`);
    res.json(teamsWithCounts);

  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

// POST /api/admin/teams - Create new team
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;

    console.log('Creating new team:', name);

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Team name is required' });
    }

    if (!req.user.tenant_id) {
      return res.status(400).json({ error: 'User tenant not found' });
    }

    // Check if team name already exists in this tenant
    const { data: existingTeam, error: checkError } = await supabase
      .from('teams')
      .select('id')
      .eq('name', name.trim())
      .eq('tenant_id', req.user.tenant_id) // Check within tenant only
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existingTeam) {
      return res.status(409).json({ error: 'Team name already exists' });
    }

    // Create team with tenant_id
    const { data: newTeam, error } = await supabase
      .from('teams')
      .insert({
        name: name.trim(),
        tenant_id: req.user.tenant_id // Use admin's tenant
      })
      .select()
      .single();

    if (error) throw error;

    console.log('Team created successfully:', newTeam.id);
    res.status(201).json({
      message: 'Team created successfully',
      team: {
        ...newTeam,
        coach_count: 0,
        coachee_count: 0,
        total_members: 0,
        members: []
      }
    });

  } catch (error) {
    console.error('Error creating team:', error);
    res.status(500).json({ error: 'Failed to create team' });
  }
});

// PUT /api/admin/teams/:id - Update team
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    console.log('Updating team:', id, { name });
    console.log('User tenant_id:', req.user.tenant_id);

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Team name is required' });
    }

    if (!req.user.tenant_id) {
      return res.status(400).json({ error: 'User tenant not found' });
    }

    // Check if team name is taken by another team in this tenant
    const { data: existingTeam, error: checkError } = await supabase
      .from('teams')
      .select('id')
      .eq('name', name.trim())
      .eq('tenant_id', req.user.tenant_id) // Filter by tenant
      .neq('id', id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existingTeam) {
      return res.status(409).json({ error: 'Team name already taken' });
    }

    // Update team (with tenant_id filter for security)
    const { data: updatedTeam, error } = await supabase
      .from('teams')
      .update({ name: name.trim() })
      .eq('id', id)
      .eq('tenant_id', req.user.tenant_id) // Security: only update teams in user's tenant
      .select()
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      throw error;
    }

    if (!updatedTeam) {
      return res.status(404).json({ error: 'Team not found' });
    }

    console.log('Team updated successfully:', id);
    res.json({
      message: 'Team updated successfully',
      team: updatedTeam
    });

  } catch (error) {
    console.error('Error updating team:', error);
    res.status(500).json({ error: 'Failed to update team' });
  }
});

// DELETE /api/admin/teams/:id - Delete team
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    console.log('Deleting team:', id);

    if (!req.user.tenant_id) {
      return res.status(400).json({ error: 'User tenant not found' });
    }

    // First, delete all team memberships for this tenant
    const { error: membershipError } = await supabase
      .from('team_memberships')
      .delete()
      .eq('team_id', id)
      .eq('tenant_id', req.user.tenant_id); // Security: only delete memberships in user's tenant

    if (membershipError) throw membershipError;

    // Then delete the team (with tenant_id filter for security)
    const { data: deletedTeam, error } = await supabase
      .from('teams')
      .delete()
      .eq('id', id)
      .eq('tenant_id', req.user.tenant_id) // Security: only delete teams in user's tenant
      .select()
      .single();

    if (error) throw error;

    if (!deletedTeam) {
      return res.status(404).json({ error: 'Team not found' });
    }

    console.log('Team deleted successfully:', id);
    res.json({
      message: 'Team and all memberships deleted successfully',
      team: deletedTeam
    });

  } catch (error) {
    console.error('Error deleting team:', error);
    res.status(500).json({ error: 'Failed to delete team' });
  }
});

// POST /api/admin/teams/:id/members - Add member to team (FIXED VERSION)
router.post('/:id/members', async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, team_role } = req.body;

    console.log('Adding member to team:', { team_id: id, user_id, team_role });

    if (!user_id || !team_role) {
      return res.status(400).json({ error: 'User ID and team role are required' });
    }

    if (!['coach', 'coachee'].includes(team_role)) {
      return res.status(400).json({ error: 'Team role must be "coach" or "coachee"' });
    }

    if (!req.user.tenant_id) {
      return res.status(400).json({ error: 'User tenant not found' });
    }

    // Remove any existing membership for this user on this team within this tenant
    await supabase
      .from('team_memberships')
      .delete()
      .eq('team_id', id)
      .eq('user_id', user_id)
      .eq('tenant_id', req.user.tenant_id); // Security filter

    // Add new membership with tenant_id
    const { data: newMembership, error } = await supabase
      .from('team_memberships')
      .insert({
        team_id: id,
        user_id,
        team_role,
        tenant_id: req.user.tenant_id // IMPORTANT: Include tenant_id
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting team membership:', error);
      throw error;
    }

    // Get user details with separate query (avoids join issues)
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, name, email, system_role')
      .eq('id', user_id)
      .eq('tenant_id', req.user.tenant_id) // Security: only get users from same tenant
      .single();

    if (userError) {
      console.error('Error fetching user details:', userError);
      throw userError;
    }

    console.log('Member added successfully:', newMembership.id);
    res.status(201).json({
      message: 'Member added to team successfully',
      member: {
        membership_id: newMembership.id,
        user_id: user.id,
        name: user.name,
        email: user.email,
        system_role: user.system_role,
        team_role: newMembership.team_role,
        joined_at: newMembership.created_at
      }
    });

  } catch (error) {
    console.error('Error adding team member:', error);
    res.status(500).json({ error: 'Failed to add team member' });
  }
});

// DELETE /api/admin/teams/:id/members/:userId - Remove member from team
router.delete('/:id/members/:userId', async (req, res) => {
  try {
    const { id, userId } = req.params;

    console.log('Removing member from team:', { team_id: id, user_id: userId });

    if (!req.user.tenant_id) {
      return res.status(400).json({ error: 'User tenant not found' });
    }

    // Remove membership with tenant_id filter for security
    const { data: deletedMembership, error } = await supabase
      .from('team_memberships')
      .delete()
      .eq('team_id', id)
      .eq('user_id', userId)
      .eq('tenant_id', req.user.tenant_id) // Security: only remove memberships in user's tenant
      .select('id')
      .single();

    if (error) {
      console.error('Error removing team member:', error);
      throw error;
    }

    if (!deletedMembership) {
      return res.status(404).json({ error: 'Team membership not found' });
    }

    console.log('Member removed successfully:', deletedMembership.id);
    res.json({
      message: 'Member removed from team successfully'
    });

  } catch (error) {
    console.error('Error removing team member:', error);
    res.status(500).json({ error: 'Failed to remove team member' });
  }
});

module.exports = router;