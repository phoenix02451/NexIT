require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

const contactRoutes = require('./routes/contact');
const careerRoutes = require('./routes/careers');
const subscribeRoutes = require('./routes/subscribe');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/itcompany';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const localhostOrigin =
  /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/;

app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true);
      if (localhostOrigin.test(origin)) return cb(null, true);
      if (origin === CLIENT_URL) return cb(null, true);
      return cb(null, false);
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/contact', contactRoutes);
app.use('/api/careers', careerRoutes);
app.use('/api/subscribe', subscribeRoutes);
app.use('/api/auth', authRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, mongo: mongoose.connection.readyState === 1 });
});

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});
