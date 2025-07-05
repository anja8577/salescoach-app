const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');
const { requireAuth } = require('../middleware/auth');

// Get eligible coachees for the logged-in coach
router.get('/eligible-coachees', requireAuth, async (req, res) => {
  try {
    const { user } = req;
    
    // Get all teams where the user is a coach
    const { data: coachTeams, error: coachTeamsError } = await supabase
      .from('team_memberships')
      .select(`
        team_id,
        teams!inner (
          id,
          name
        )
      `)
      .eq('user_id', user.id)
      .eq('team_role', 'coach')
      .eq('tenant_id', user.tenant_id);

    if (coachTeamsError) {
      throw coachTeamsError;
    }

    // For each team, get all coachees
    const teamsWithCoachees = await Promise.all(
      coachTeams.map(async (coachTeam) => {
        const { data: coachees, error: coacheesError } = await supabase
          .from('team_memberships')
          .select(`
            user_id,
            users!inner (
              id,
              name,
              email,
              active
            )
          `)
          .eq('team_id', coachTeam.team_id)
          .eq('team_role', 'coachee')
          .eq('tenant_id', user.tenant_id)
          .eq('users.active', true);

        if (coacheesError) {
          throw coacheesError;
        }

        return {
          id: coachTeam.teams.id,
          name: coachTeam.teams.name,
          coachees: coachees.map(c => ({
            id: c.users.id,
            name: c.users.name,
            email: c.users.email
          }))
        };
      })
    );

    res.json({
      teams: teamsWithCoachees.filter(team => team.coachees.length > 0)
    });

  } catch (error) {
    console.error('Error fetching eligible coachees:', error);
    res.status(500).json({ 
      error: 'Failed to fetch eligible coachees',
      details: error.message 
    });
  }
});

module.exports = router;