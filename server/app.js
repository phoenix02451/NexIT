require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

const contactRoutes = require('./routes/contact');
const careerRoutes = require('./routes/careers');
const subscribeRoutes = require('./routes/subscribe');
const authRoutes = require('./routes/auth');
const { isConnected } = require('./db');

const app = express();
app.set('trust proxy', 1);
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const localhostOrigin =
  /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/;

function isOriginAllowed(origin) {
  if (!origin) return true;
  if (localhostOrigin.test(origin)) return true;
  if (origin === CLIENT_URL) return true;
  try {
    const host = new URL(origin).hostname;
    if (host.endsWith('.netlify.app') || host === 'netlify.app') return true;
  } catch {
    /* ignore */
  }
  return false;
}

app.use(
  cors({
    origin(origin, cb) {
      if (isOriginAllowed(origin)) return cb(null, true);
      return cb(null, false);
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const isServerless =
  process.env.NETLIFY === 'true' ||
  Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME) ||
  Boolean(process.env.LAMBDA_TASK_ROOT);
if (!isServerless) {
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
}

app.use('/api/contact', contactRoutes);
app.use('/api/careers', careerRoutes);
app.use('/api/subscribe', subscribeRoutes);
app.use('/api/auth', authRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, mongo: isConnected() });
});

module.exports = app;
