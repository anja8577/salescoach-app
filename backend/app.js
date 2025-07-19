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

// Add request logging middleware (BEFORE route loading)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.method === 'PUT' || req.method === 'POST' || req.method === 'PATCH') {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Routes - with debugging
console.log('=== LOADING ROUTES ===');
const routes = require('./routes');
const teamsRoutes = require('./routes/teams');
const teamMembershipsRoutes = require('./routes/teamMemberships');

console.log('=== LOADING COACHING SESSIONS ROUTES ===');
const coachingSessionsRoutes = require('./routes/coachingSessions');
console.log('=== COACHING SESSIONS ROUTES LOADED SUCCESSFULLY ===');

const sessionNotesRoutes = require('./routes/sessionNotes');
const sessionScoresRoutes = require('./routes/sessionScores');
const sessionReportsRoutes = require('./routes/sessionReports');
const tenantsRoutes = require('./routes/tenants');
const frameworksRoutes = require('./routes/frameworks');
const profileRoutes = require('./routes/profile');
const authRoutes = require('./routes/auth');
const coachingRoutes = require('./routes/coaching');

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

// Register routes - with debugging
console.log('=== REGISTERING ROUTES ===');
app.use('/api', routes);
app.use('/api/teams', teamsRoutes);
app.use('/api/team-memberships', teamMembershipsRoutes);

console.log('=== REGISTERING /api/coaching-sessions ROUTE ===');
app.use('/api/coaching-sessions', coachingSessionsRoutes);
console.log('=== /api/coaching-sessions ROUTE REGISTERED ===');

app.use('/api/session-notes', sessionNotesRoutes);
app.use('/api/session-scores', sessionScoresRoutes);
app.use('/api/sessionReports', sessionReportsRoutes);
app.use('/api', tenantsRoutes);
app.use('/api/frameworks', frameworksRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/coaching', coachingRoutes);

// Only add admin routes if they loaded successfully
if (adminUsersRoutes && adminTeamsRoutes) {
  app.use('/api/admin/users', adminUsersRoutes);
  app.use('/api/admin/teams', adminTeamsRoutes);
  console.log('=== ADMIN ROUTES REGISTERED SUCCESSFULLY ===');
} else {
  console.log('=== ADMIN ROUTES NOT REGISTERED DUE TO LOADING ERRORS ===');
}

// Test route to verify save endpoint structure
app.put('/api/coaching-sessions/:sessionId/save-test', (req, res) => {
  console.log('=== TEST SAVE ROUTE HIT ===');
  console.log('Session ID:', req.params.sessionId);
  console.log('Body received:', req.body);
  res.json({ 
    message: 'Test save route working!',
    sessionId: req.params.sessionId,
    bodyReceived: !!req.body
  });
});

// Debug route to list all registered routes
app.get('/api/debug/routes', (req, res) => {
  const routes = [];
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      });
    } else if (middleware.name === 'router') {
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          routes.push({
            path: handler.route.path,
            methods: Object.keys(handler.route.methods)
          });
        }
      });
    }
  });
  res.json({ routes });
});

console.log('=== ALL ROUTES REGISTERED ===');

// Start server
app.listen(PORT, () => {
  console.log(`=== Backend server running on port ${PORT} ===`);
  console.log(`=== Available endpoints: ===`);
  console.log(`- GET  http://localhost:${PORT}/api/coaching-sessions`);
  console.log(`- PUT  http://localhost:${PORT}/api/coaching-sessions/:id/save`);
  console.log(`- PUT  http://localhost:${PORT}/api/coaching-sessions/:id/save-test`);
  console.log(`- GET  http://localhost:${PORT}/api/debug/routes`);
});