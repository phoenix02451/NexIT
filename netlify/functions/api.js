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
    return {
      statusCode: 503,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ok: false,
        message: 'Database is not available. Set MONGO_URI in Netlify (use MongoDB Atlas).',
        error: err.code === 'MONGO_CONFIG' ? err.message : undefined,
      }),
    };
  }
  return handler(event, context);
};
