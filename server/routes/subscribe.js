const express = require('express');
const Subscriber = require('../models/Subscriber');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ ok: false, message: 'Please enter a valid email.' });
    }
    await Subscriber.findOneAndUpdate(
      { email },
      { email },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return res.json({ ok: true, message: 'Thanks for subscribing!' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: 'Something went wrong. Please try again.' });
  }
});

module.exports = router;
