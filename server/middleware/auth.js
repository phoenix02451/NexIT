const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');

function getTokenFromRequest(req) {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) return header.slice(7);
  if (req.cookies && req.cookies.access_token) return req.cookies.access_token;
  return null;
}

async function requireAuth(req, res, next) {
  const token = getTokenFromRequest(req);
  if (!token) return res.status(401).json({ message: 'Not authenticated' });
  const payload = verifyToken(token);
  if (!payload?.sub) return res.status(401).json({ message: 'Invalid or expired session' });
  const user = await User.findById(payload.sub);
  if (!user) return res.status(401).json({ message: 'User not found' });
  req.user = user;
  next();
}

async function optionalAuth(req, res, next) {
  const token = getTokenFromRequest(req);
  if (!token) return next();
  const payload = verifyToken(token);
  if (!payload?.sub) return next();
  const user = await User.findById(payload.sub);
  if (user) req.user = user;
  next();
}

module.exports = { requireAuth, optionalAuth, getTokenFromRequest };
