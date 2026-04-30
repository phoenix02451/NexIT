const express = require('express');
const Contact = require('../models/Contact');
const { sendContactEmail } = require('../utils/sendMail');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { name, phone, email, message } = req.body;
    if (!name || !phone || !email || !message) {
      return res.status(400).json({ ok: false, message: 'Please fill all required fields.' });
    }
    const phoneStr = String(phone).replace(/\D/g, '');
    if (phoneStr.length !== 10) {
      return res.status(400).json({ ok: false, message: 'Contact number must be 10 digits.' });
    }

    await Contact.create({
      name: String(name).trim(),
      phone: phoneStr,
      email: String(email).trim(),
      message: String(message).trim(),
    });

    try {
      await sendContactEmail({
        name: String(name).trim(),
        phone: phoneStr,
        email: String(email).trim(),
        message: String(message).trim(),
      });
    } catch (mailErr) {
      console.error('Contact mail error:', mailErr.message);
    }

    return res.json({ ok: true, message: 'Thanks! We will contact you soon.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: 'Error sending message! Please try again.' });
  }
});

module.exports = router;
