const express = require('express');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { setAuthCookie, clearAuthCookie } = require('./cookies');
const authService = require('./auth.service');
const { isMongoConnectivityError, mongoMessage } = require('./mongoErrorResponse');

const router = express.Router();

/** If express.json left an empty object, re-parse from raw buffer (Netlify / API Gateway edge cases). */
function reviveAuthJsonBody(req, _res, next) {
  if (req.method !== 'POST') return next();
  const b = req.body;
  const keys = b && typeof b === 'object' && !Array.isArray(b) ? Object.keys(b) : [];
  const hasEmailKey = keys.some((k) => k.toLowerCase() === 'email');
  if (!hasEmailKey && typeof req.rawJsonBody === 'string' && req.rawJsonBody.trim()) {
    try {
      const parsed = JSON.parse(req.rawJsonBody);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        req.body = parsed;
      }
    } catch {
      /* keep existing body */
    }
  }
  next();
}

router.get('/config', (_req, res) => {
  res.json({ googleClientId: authService.getGoogleClientId() });
});

router.post('/register', reviveAuthJsonBody, async (req, res) => {
  try {
    const result = await authService.registerWithPassword(req.body);
    if (!result.ok) {
      return res.status(result.status).json({ message: result.message });
    }
    setAuthCookie(res, result.token, req);
    return res.status(201).json({ user: result.user });
  } catch (err) {
    console.error('auth register', err);
    if (isMongoConnectivityError(err)) {
      return res.status(503).json({ message: mongoMessage() });
    }
    return res.status(500).json({ message: 'Registration failed' });
  }
});

router.post('/login', reviveAuthJsonBody, async (req, res) => {
  try {
    const result = await authService.loginWithPassword(req.body);
    if (!result.ok) {
      return res.status(result.status).json({ message: result.message });
    }
    setAuthCookie(res, result.token, req);
    return res.json({ user: result.user });
  } catch (err) {
    console.error('auth login', err);
    if (isMongoConnectivityError(err)) {
      return res.status(503).json({ message: mongoMessage() });
    }
    return res.status(500).json({ message: 'Sign-in failed' });
  }
});

router.post('/logout', (req, res) => {
  clearAuthCookie(res, req);
  res.json({ ok: true });
});

router.get('/session', optionalAuth, (req, res) => {
  res.json({ user: req.user ? authService.userPublic(req.user) : null });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: authService.userPublic(req.user) });
});

router.post('/google', async (req, res) => {
  try {
    const result = await authService.signInWithGoogleCredential(req.body.credential);
    if (!result.ok) {
      return res.status(result.status).json({ message: result.message });
    }
    setAuthCookie(res, result.token, req);
    return res.json({ user: result.user });
  } catch (err) {
    console.error('auth google', err);
    if (isMongoConnectivityError(err)) {
      return res.status(503).json({ message: mongoMessage() });
    }
    return res.status(401).json({ message: 'Google sign-in failed' });
  }
});

module.exports = router;
