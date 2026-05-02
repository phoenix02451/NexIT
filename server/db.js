const mongoose = require('mongoose');

/**
 * In Netlify (AWS Lambda) each invocation is short-lived; reuse the same connection.
 * @see https://www.mongodb.com/docs/drivers/node/current/faq/
 */
const isLambdaRuntime = Boolean(
  process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME
);

function envFlagTrue(name) {
  const v = String(process.env[name] || '').toLowerCase().trim();
  return v === '1' || v === 'true' || v === 'yes';
}

/** Optional: set MONGO_FORCE_IPV4=1 on Netlify only if Atlas times out and Atlas support suggests forcing IPv4. */
function useIpv4FamilyForLambda() {
  return isLambdaRuntime && envFlagTrue('MONGO_FORCE_IPV4');
}

function resolveMongoUri() {
  const fromEnv =
    process.env.MONGO_URI ||
    process.env.MONGODB_URI ||
    process.env.DATABASE_URL ||
    '';
  if (fromEnv) return fromEnv.trim();
  if (isLambdaRuntime) return '';
  return 'mongodb://127.0.0.1:27017/itcompany';
}

/** Netlify UI sometimes saves the URI wrapped in quotes or with stray newlines. */
function normalizeMongoUri(uri) {
  let s = String(uri).trim();
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1).trim();
  }
  return s.replace(/[\r\n]+/g, '');
}

async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const MONGO_URI = normalizeMongoUri(resolveMongoUri());

  if (!MONGO_URI) {
    const err = new Error(
      'No MongoDB URI: set MONGO_URI, MONGODB_URI, or DATABASE_URL in Netlify → Site configuration → Environment variables (Atlas or other hosted MongoDB).'
    );
    err.code = 'MONGO_CONFIG';
    throw err;
  }

  const globalCache = globalThis;
  if (globalCache.__mongoConnPromise) {
    try {
      await globalCache.__mongoConnPromise;
      return mongoose.connection;
    } catch (e) {
      globalCache.__mongoConnPromise = undefined;
      throw e;
    }
  }

  // Netlify/Lambda: optional IPv4 (MONGO_FORCE_IPV4); shorter timeouts avoid Netlify 504 vs hung connect.
  if (isLambdaRuntime) {
    mongoose.set('bufferCommands', false);
  }

  // Stay under Netlify’s default function wall clock (~10s) so we return JSON 503 instead of 504 gateway timeout.
  const opts = {
    maxPoolSize: 5,
    serverSelectionTimeoutMS: isLambdaRuntime ? 8_000 : 10_000,
    connectTimeoutMS: isLambdaRuntime ? 7_000 : 10_000,
    ...(useIpv4FamilyForLambda() ? { family: 4 } : {}),
  };

  globalCache.__mongoConnPromise = mongoose.connect(MONGO_URI, opts);
  try {
    await globalCache.__mongoConnPromise;
    console.log('MongoDB connected');
  } catch (e) {
    globalCache.__mongoConnPromise = undefined;
    throw e;
  }
  return mongoose.connection;
}

function isConnected() {
  return mongoose.connection.readyState === 1;
}

module.exports = { connectDB, isConnected, mongoose };
