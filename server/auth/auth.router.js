const express = require('express');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { setAuthCookie, clearAuthCookie } = require('./cookies');
const authService = require('./auth.service');
const { isMongoConnectivityError, mongoMessage } = require('./mongoErrorResponse');

const router = express.Router();

router.get('/config', (_req, res) => {
  res.json({ googleClientId: authService.getGoogleClientId() });
});

router.post('/register', async (req, res) => {
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

router.post('/login', async (req, res) => {
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
