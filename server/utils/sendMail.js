const fs = require('fs');
const nodemailer = require('nodemailer');

function isSmtpConfigured() {
  return !!(process.env.SMTP_USER && process.env.SMTP_PASS && process.env.SMTP_TO);
}

function createTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function sendContactEmail({ name, phone, email, message }) {
  if (!isSmtpConfigured()) return { sent: false };
  const transporter = createTransport();
  const html = `<ul><li>Name: ${escapeHtml(name)}</li><li>Phone: ${escapeHtml(phone)}</li><li>Email: ${escapeHtml(email)}</li><li>Message: ${escapeHtml(message)}</li></ul>`;
  await transporter.sendMail({
    from: `"${process.env.SMTP_FROM_NAME || 'Website Form'}" <${process.env.SMTP_USER}>`,
    to: process.env.SMTP_TO,
    subject: 'Someone Contacted You!',
    html,
    text: `Name: ${name}\nPhone: ${phone}\nEmail: ${email}\nMessage: ${message}`,
  });
  return { sent: true };
}

async function sendCareerEmail(payload, attachmentPath, attachmentFilename) {
  if (!isSmtpConfigured()) return { sent: false };
  const transporter = createTransport();
  const { name, phone, email, applyFor, experience, details } = payload;
  const html = `<ul><li>Name: ${escapeHtml(name)}</li><li>Phone: ${escapeHtml(phone)}</li><li>Email: ${escapeHtml(email)}</li><li>Apply For: ${escapeHtml(applyFor)}</li><li>Experience: ${escapeHtml(String(experience))} Yrs.</li><li>Other details: ${escapeHtml(details)}</li><li>Resume: see attachment</li></ul>`;
  const mail = {
    from: `"${process.env.SMTP_FROM_NAME || 'Website Form'}" <${process.env.SMTP_USER}>`,
    to: process.env.SMTP_TO,
    subject: 'Someone Contacted You!',
    html,
    text: `${name} applied for ${applyFor}`,
  };
  if (attachmentPath && fs.existsSync(attachmentPath)) {
    mail.attachments = [{ path: attachmentPath, filename: attachmentFilename || 'resume' }];
  }
  await transporter.sendMail(mail);
  return { sent: true };
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

module.exports = { sendContactEmail, sendCareerEmail, isSmtpConfigured };
