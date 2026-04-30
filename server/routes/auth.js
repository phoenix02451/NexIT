const express = require('express');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { signToken } = require('../utils/jwt');
const { requireAuth, optionalAuth } = require('../middleware/auth');

const router = express.Router();
const SALT_ROUNDS = 10;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';

function setAuthCookie(res, token) {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('access_token', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function clearAuthCookie(res) {
  const isProd = process.env.NODE_ENV === 'production';
  res.clearCookie('access_token', {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
  });
}

function userResponse(user) {
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name || '',
    picture: user.picture || '',
    hasPassword: Boolean(user.passwordHash),
  };
}

router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ message: 'Email is required' });
    }
    if (!password || typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }
    const normalized = email.trim().toLowerCase();
    const existing = await User.findOne({ email: normalized });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({
      email: normalized,
      passwordHash,
      name: typeof name === 'string' ? name.trim().slice(0, 120) : '',
    });
    const token = signToken(user._id.toString());
    setAuthCookie(res, token);
    return res.status(201).json({ user: userResponse(user) });
  } catch (err) {
    console.error('register', err);
    return res.status(500).json({ message: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const user = await User.findOne({ email: String(email).trim().toLowerCase() });
    if (!user || !user.passwordHash) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid email or password' });
    const token = signToken(user._id.toString());
    setAuthCookie(res, token);
    return res.json({ user: userResponse(user) });
  } catch (err) {
    console.error('login', err);
    return res.status(500).json({ message: 'Login failed' });
  }
});

router.post('/logout', (_req, res) => {
  clearAuthCookie(res);
  res.json({ ok: true });
});

router.get('/session', optionalAuth, (req, res) => {
  res.json({ user: req.user ? userResponse(req.user) : null });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: userResponse(req.user) });
});

router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential || typeof credential !== 'string') {
      return res.status(400).json({ message: 'Google credential is required' });
    }
    if (!GOOGLE_CLIENT_ID) {
      return res.status(503).json({ message: 'Google sign-in is not configured on the server' });
    }
    const client = new OAuth2Client(GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload?.email) {
      return res.status(400).json({ message: 'Google did not return an email' });
    }
    const email = payload.email.toLowerCase();
    const googleId = payload.sub;
    const name = (payload.name || '').slice(0, 120);
    const picture = payload.picture || '';

    let user = await User.findOne({ googleId });
    if (!user) {
      user = await User.findOne({ email });
      if (user) {
        if (!user.googleId) {
          user.googleId = googleId;
          if (picture) user.picture = picture;
          if (name && !user.name) user.name = name;
          await user.save();
        } else if (user.googleId !== googleId) {
          return res.status(409).json({ message: 'This email is already linked to another account' });
        }
      } else {
        user = await User.create({
          email,
          googleId,
          name,
          picture,
          passwordHash: null,
        });
      }
    }

    const token = signToken(user._id.toString());
    setAuthCookie(res, token);
    const fresh = await User.findById(user._id);
    return res.json({ user: userResponse(fresh) });
  } catch (err) {
    console.error('google auth', err);
    return res.status(401).json({ message: 'Google sign-in failed' });
  }
});

module.exports = router;
