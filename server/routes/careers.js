const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const CareerApplication = require('../models/CareerApplication');
const { sendCareerEmail } = require('../utils/sendMail');

const router = express.Router();

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.pdf';
    const safe = `${Date.now()}-${Math.random().toString(16).slice(2)}${ext}`;
    cb(null, safe);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only .pdf, .doc, and .docx files are allowed.'));
  },
});

router.post('/', upload.single('fileToUpload'), async (req, res) => {
  try {
    const { name, phone, email, status, experience, details } = req.body;
    if (!name || !phone || !email || !status || experience === undefined || !details) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(400).json({ ok: false, message: 'Please fill all required fields.' });
    }
    const phoneStr = String(phone).replace(/\D/g, '');
    if (phoneStr.length !== 10) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(400).json({ ok: false, message: 'Contact number must be 10 digits.' });
    }

    const expNum = Number(experience);
    if (Number.isNaN(expNum) || expNum < 0) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(400).json({ ok: false, message: 'Invalid experience value.' });
    }

    const doc = await CareerApplication.create({
      name: String(name).trim(),
      phone: phoneStr,
      email: String(email).trim(),
      applyFor: String(status).trim(),
      experience: expNum,
      details: String(details).trim(),
      resumeFilename: req.file ? req.file.originalname : '',
      resumePath: req.file ? req.file.filename : '',
    });

    try {
      await sendCareerEmail(
        {
          name: doc.name,
          phone: doc.phone,
          email: doc.email,
          applyFor: doc.applyFor,
          experience: doc.experience,
          details: doc.details,
        },
        req.file ? req.file.path : null,
        req.file ? req.file.originalname : null
      );
    } catch (mailErr) {
      console.error('Career mail error:', mailErr.message);
    }

    return res.json({ ok: true, message: 'Thanks! We will contact you soon.' });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlink(req.file.path, () => {});
    if (err.message && err.message.includes('allowed')) {
      return res.status(400).json({ ok: false, message: err.message });
    }
    console.error(err);
    return res.status(500).json({ ok: false, message: 'Error uploading file! Please try again.' });
  }
});

module.exports = router;
