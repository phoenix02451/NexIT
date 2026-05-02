const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { signToken } = require('../utils/jwt');

const SALT_ROUNDS = 10;
const GOOGLE_CLIENT_ID = (process.env.GOOGLE_CLIENT_ID || '').trim();

function userPublic(user) {
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name || '',
    picture: user.picture || '',
    hasPassword: Boolean(user.passwordHash),
  };
}

function fail(status, message) {
  return { ok: false, status, message };
}

function ok(payload) {
  return { ok: true, ...payload };
}

/** Some proxies / clients send a JSON string; keys may use different casing. */
function asJsonObject(body) {
  if (body == null) return {};
  if (typeof Buffer !== 'undefined' && Buffer.isBuffer(body)) {
    try {
      const o = JSON.parse(body.toString('utf8'));
      return typeof o === 'object' && o !== null && !Array.isArray(o) ? o : {};
    } catch {
      return {};
    }
  }
  if (typeof body === 'string') {
    const s = body.trim();
    if (!s) return {};
    try {
      const o = JSON.parse(s);
      return typeof o === 'object' && o !== null && !Array.isArray(o) ? o : {};
    } catch {
      return {};
    }
  }
  if (typeof body === 'object' && !Array.isArray(body)) return body;
  return {};
}

/** Some clients wrap fields in `data`, `payload`, or `body`. */
function mergeNestedCredentials(body) {
  const base = asJsonObject(body);
  const nested = base.data ?? base.payload ?? base.body;
  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    return { ...nested, ...base };
  }
  return base;
}

function pickField(obj, lowerName) {
  for (const k of Object.keys(obj)) {
    if (k.toLowerCase() === lowerName) {
      const v = obj[k];
      if (v == null) return '';
      return typeof v === 'string' ? v : String(v);
    }
  }
  return '';
}

async function registerWithPassword(body) {
  const o = mergeNestedCredentials(body);
  const email = pickField(o, 'email').trim();
  const password = pickField(o, 'password');
  const name = pickField(o, 'name');
  if (!email) {
    return fail(400, 'Email is required');
  }
  if (!password || password.length < 8) {
    return fail(400, 'Password must be at least 8 characters');
  }
  const normalized = email.toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    return fail(400, 'Enter a valid email address');
  }
  const existing = await User.findOne({ email: normalized });
  if (existing) {
    return fail(409, 'An account with this email already exists');
  }
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const nameTrim = name.trim().slice(0, 120);
  let user;
  try {
    user = await User.create({
      email: normalized,
      passwordHash,
      name: nameTrim,
    });
  } catch (e) {
    if (e.code === 11000) return fail(409, 'An account with this email already exists');
    throw e;
  }
  const token = signToken(user._id.toString());
  return ok({ user: userPublic(user), token });
}

async function loginWithPassword(body) {
  const o = mergeNestedCredentials(body);
  const email = pickField(o, 'email').trim();
  const password = pickField(o, 'password');
  if (!email || !password) {
    return fail(400, 'Email and password are required');
  }
  const normalized = email.toLowerCase();
  const user = await User.findOne({ email: normalized });
  if (!user || !user.passwordHash) {
    return fail(401, 'Invalid email or password');
  }
  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    return fail(401, 'Invalid email or password');
  }
  const token = signToken(user._id.toString());
  return ok({ user: userPublic(user), token });
}

async function signInWithGoogleCredential(credential) {
  if (!credential || typeof credential !== 'string') {
    return fail(400, 'Google credential is required');
  }
  if (!GOOGLE_CLIENT_ID) {
    return fail(503, 'Google sign-in is not configured on the server');
  }
  const client = new OAuth2Client(GOOGLE_CLIENT_ID);
  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload?.email) {
    return fail(400, 'Google did not return an email');
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
        return fail(409, 'This email is already linked to another account');
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

  const fresh = await User.findById(user._id);
  const token = signToken(fresh._id.toString());
  return ok({ user: userPublic(fresh), token });
}

module.exports = {
  userPublic,
  registerWithPassword,
  loginWithPassword,
  signInWithGoogleCredential,
  getGoogleClientId: () => GOOGLE_CLIENT_ID,
};
