const mongoose = require('mongoose');

/**
 * In Netlify (AWS Lambda) each invocation is short-lived; reuse the same connection.
 * @see https://www.mongodb.com/docs/drivers/node/current/faq/
 */
const MONGO_URI =
  process.env.MONGO_URI ||
  (process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME
    ? ''
    : 'mongodb://127.0.0.1:27017/itcompany');

async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  if (!MONGO_URI) {
    const err = new Error(
      'MONGO_URI is not set. On Netlify you must use MongoDB Atlas (or other hosted MongoDB) and add MONGO_URI in the Netlify UI.'
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
