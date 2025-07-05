// backend/app.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS setup - allow only your frontend during development
app.use(cors({
  origin: 'http://localhost:3000', // Adjust if frontend uses a different port
}));

app.use(express.json());

// Routes
const routes = require('./routes');
const teamsRoutes = require('./routes/teams');
const teamMembershipsRoutes = require('./routes/teamMemberships');
const coachingSessionsRoutes = require('./routes/coachingSessions');
const sessionNotesRoutes = require('./routes/sessionNotes');
const sessionScoresRoutes = require('./routes/sessionScores');
const sessionReportsRoutes = require('./routes/sessionReports');
const tenantsRoutes = require('./routes/tenants');
const frameworksRoutes = require('./routes/frameworks');
const profileRoutes = require('./routes/profile');
const authRoutes = require('./routes/auth'); // NEW: Add auth routes

// Admin routes with error handling
console.log('=== ABOUT TO LOAD ADMIN ROUTES ===');
let adminUsersRoutes, adminTeamsRoutes;
try {
  adminUsersRoutes = require('./routes/admin/users');
  console.log('=== ADMIN USERS LOADED SUCCESSFULLY ===');
  adminTeamsRoutes = require('./routes/admin/teams');
  console.log('=== ADMIN TEAMS LOADED SUCCESSFULLY ===');
} catch (error) {
  console.error('=== ERROR LOADING ADMIN ROUTES ===');
  console.error(error);
}

app.use('/api', routes);
app.use('/api/teams', teamsRoutes);
app.use('/api/team-memberships', teamMembershipsRoutes);
app.use('/api/coaching-sessions', coachingSessionsRoutes);
app.use('/api/session-notes', sessionNotesRoutes);
app.use('/api/session-scores', sessionScoresRoutes);
app.use('/api/session-reports', sessionReportsRoutes);
app.use('/api', tenantsRoutes);
app.use('/api/frameworks', frameworksRoutes);
app.use('/api/auth', authRoutes);

// Only add admin routes if they loaded successfully
if (adminUsersRoutes && adminTeamsRoutes) {
  app.use('/api/admin/users', adminUsersRoutes); // NEW: Admin user management
  app.use('/api/admin/teams', adminTeamsRoutes); // NEW: Admin team management
  console.log('=== ADMIN ROUTES REGISTERED SUCCESSFULLY ===');
} else {
  console.log('=== ADMIN ROUTES NOT REGISTERED DUE TO LOADING ERRORS ===');
}

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});