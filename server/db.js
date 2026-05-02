const mongoose = require('mongoose');

/**
 * In Netlify (AWS Lambda) each invocation is short-lived; reuse the same connection.
 * @see https://www.mongodb.com/docs/drivers/node/current/faq/
 */
const isLambdaRuntime = Boolean(
  process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME
);

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

const MONGO_URI = resolveMongoUri();

async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  if (!MONGO_URI) {
    const err = new Error(
      'No MongoDB URI: set MONGO_URI, MONGODB_URI, or DATABASE_URL in Netlify → Site configuration → Environment variables (Atlas or other hosted MongoDB).'
    );
    err.code = 'MONGO_CONFIG';
    throw err;
  }

  const globalCache = globalThis;
  if (globalCache.__mongoConnPromise) {
    await globalCache.__mongoConnPromise;
    return mongoose.connection;
  }

  const opts = {
    maxPoolSize: 5,
    serverSelectionTimeoutMS: 10_000,
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
