const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../../server/.env') });

const serverless = require('serverless-http');
const { connectDB } = require('../../server/db');
const app = require('../../server/app');

const handler = serverless(app);

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
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
      }),
    };
  }
  return handler(event, context);
};
