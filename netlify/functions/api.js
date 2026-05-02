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
  return undefined;
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

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  if (!isAuthConfigGet(event)) {
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
            : 'Database connection failed. Confirm MONGO_URI in Netlify, Atlas cluster is running, database user/password are correct, and Network Access allows connections (e.g. 0.0.0.0/0 for serverless).',
          error: err.message,
          hint: missingConfig ? undefined : mongoFailureHint(err),
        }),
      };
    }
  }
  return handler(event, context);
};
