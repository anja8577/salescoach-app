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


app.use('/api', routes);
app.use('/api/teams', teamsRoutes);
app.use('/api/team-memberships', teamMembershipsRoutes);
app.use('/api/coaching-sessions', coachingSessionsRoutes);
app.use('/api/session-notes', sessionNotesRoutes);
app.use('/api/session-scores', sessionScoresRoutes);
app.use('/api/session-reports', sessionReportsRoutes);
app.use('/api', tenantsRoutes);
app.use('/api/frameworks', frameworksRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
