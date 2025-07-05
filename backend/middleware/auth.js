// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const supabase = require('../supabaseClient');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      userId: user.id, 
      email: user.email, 
      name: user.name,
      systemRole: user.system_role 
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Authentication middleware (FIXED VERSION)
const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Verify user still exists and get fresh data - EXPLICITLY select tenant_id
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, system_role, tenant_id, active, created_at')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      console.error('User lookup error:', error);
      return res.status(401).json({ error: 'User not found' });
    }

    // Debug logging
    console.log('Auth middleware - User loaded:', {
      id: user.id,
      email: user.email,
      tenant_id: user.tenant_id,
      system_role: user.system_role
    });

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

// Role-based middleware
const requireRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.user.system_role !== requiredRole) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

// Admin middleware
const requireAdmin = requireRole('admin');

module.exports = {
  generateToken,
  verifyToken,
  requireAuth,
  requireRole,
  requireAdmin
};