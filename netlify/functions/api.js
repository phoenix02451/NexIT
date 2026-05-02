const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../../server/.env') });

const serverless = require('serverless-http');
const { connectDB } = require('../../server/db');
const app = require('../../server/app');

const handler = serverless(app);

function mongoFailureHint(err) {
  const msg = String(err?.message || '').toLowerCase();
  if (msg.includes('authentication failed') || msg.includes('bad auth'))
    return 'Atlas rejected the DB user or password. If the password contains @ # / ? & etc., URL-encode those characters in MONGO_URI.';
  if (msg.includes('enotfound') || msg.includes('querysrv') || msg.includes('srv record'))
    return 'DNS/SRV lookup failed. Copy the connection string again from Atlas → Connect → Drivers (mongodb+srv://…).';
  if (msg.includes('ip') && msg.includes('whitelist'))
    return 'Atlas blocked the IP. In Atlas → Network Access, add 0.0.0.0/0 (or allow AWS) for serverless.';
  if (msg.includes('timed out') || msg.includes('serverselectionerror'))
    return 'Could not reach Atlas in time. Resume the cluster if paused (M0), confirm Network Access, and retry.';
  if (msg.includes('querytxt') || msg.includes('etimeout') || msg.includes('enodata'))
    return 'DNS lookup to Atlas failed or timed out. Check the hostname in MONGO_URI and your network; try again after a minute.';
  if (msg.includes('ssl') || msg.includes('tls') || msg.includes('certificate'))
    return 'TLS error talking to Atlas. Use the official mongodb+srv:// string from Atlas; avoid proxies that intercept HTTPS.';
  return undefined;
}

function getHeader(event, name) {
  const h = event.headers || {};
  const want = name.toLowerCase();
  const key = Object.keys(h).find((k) => k.toLowerCase() === want);
  return key ? String(h[key]) : '';
}

/** GET /api/auth/config only returns env-based googleClientId — no DB. Skip connect so the SPA can load when Mongo is misconfigured. */
function isAuthConfigGet(event) {
  const method = (
    event.httpMethod ||
    event.requestContext?.http?.method ||
    ''
  ).toUpperCase();
  if (method !== 'GET') return false;
  const reqPath = event.path || event.rawPath || '';
  return reqPath.includes('auth/config');
}

/**
 * Session with no auth cookie/header only returns { user: null } — no DB.
 * Skipping connect avoids Netlify 504 when Atlas is slow/unreachable (default function limit ~10s).
 */
function isAnonymousSessionGet(event) {
  const method = (
    event.httpMethod ||
    event.requestContext?.http?.method ||
    ''
  ).toUpperCase();
  if (method !== 'GET') return false;
  const reqPath = event.path || event.rawPath || '';
  if (!reqPath.includes('auth/session')) return false;
  const auth = getHeader(event, 'authorization');
  if (auth && /^Bearer\s+\S/i.test(auth.trim())) return false;
  const cookie = getHeader(event, 'cookie');
  if (cookie.includes('access_token=')) return false;
  return true;
}

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  if (!isAuthConfigGet(event) && !isAnonymousSessionGet(event)) {
    try {
      await connectDB();
    } catch (err) {
      console.error('MongoDB connection error:', err.message);
      const missingConfig = err.code === 'MONGO_CONFIG';
      return {
        statusCode: 503,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ok: false,
          message: missingConfig
            ? 'Database is not configured. In Netlify: Site configuration → Environment variables → add MONGO_URI (or MONGODB_URI / DATABASE_URL) with your MongoDB Atlas connection string.'
            : 'Database connection failed. Check the JSON fields error and hint below, GET /api/health after deploy, and Netlify function logs. Common fixes: MONGO_URI applies to this deploy (Production vs Previews) and to Serverless functions; Atlas Network Access 0.0.0.0/0; URL-encode special characters in the DB password inside the URI; redeploy after env changes.',
          error: err.message,
          hint: missingConfig ? undefined : mongoFailureHint(err),
          checkUrl: '/api/health',
        }),
      };
    }
  }
  return handler(event, context);
};
