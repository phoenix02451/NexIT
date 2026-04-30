import { useState } from 'react';
import axios from 'axios';
import '../styles/careers.css';
import { siteInfo } from '../config/siteInfo';

const POSTS = [
  'Web Designer',
  'Web Developer',
  'Mobile App Designer',
  'Mobile App Developer',
  'Digital Marketer',
];

export default function Careers() {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    status: 'Web Designer',
    experience: '',
    details: '',
  });
  const [file, setFile] = useState(null);
  const [fileKey, setFileKey] = useState(0);
  const [statusMsg, setStatusMsg] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setStatusMsg(null);
    const fd = new FormData();
    fd.append('name', form.name);
    fd.append('phone', form.phone);
    fd.append('email', form.email);
    fd.append('status', form.status);
    fd.append('experience', form.experience);
    fd.append('details', form.details);
    if (file) fd.append('fileToUpload', file);
    try {
      const { data } = await axios.post('/api/careers', fd);
      setStatusMsg({ ok: true, text: data.message });
      setForm({
        name: '',
        phone: '',
        email: '',
        status: 'Web Designer',
        experience: '',
        details: '',
      });
      setFile(null);
      setFileKey((k) => k + 1);
    } catch (err) {
      setStatusMsg({
        ok: false,
        text: err.response?.data?.message || 'Error uploading file! Please try again.',
      });
    }
  }

  return (
    <div className="careers-page">
      <section id="home" className="home">
        <h2>Home / Careers</h2>
      </section>

      <section id="career-heading" className="career-heading">
        <h1 className="heading">Career</h1>
        <p>
          Job openings at {siteInfo.companyName} — apply now.
        </p>
      </section>
      <div className="career">
        <div className="career-form">
          <form onSubmit={onSubmit} encType="multipart/form-data">
            <input
              type="text"
              name="name"
              placeholder="Name"
              className="career-form-txt"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              type="tel"
              id="phone"
              name="phone"
              pattern="[0-9]{10}"
              required
              placeholder="Contact number"
              maxLength={10}
              className="career-form-phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="career-form-email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <div className="radio-class">
              <h2 className="name">Apply For Which Post?</h2>
              {POSTS.map((label, i) => (
                <label className="radio" key={label}>
                  <input
                    className={`radio-${['one', 'two', 'three', 'four', 'five'][i]}`}
                    type="radio"
                    name="status"
                    checked={form.status === label}
                    value={label}
                    onChange={() => setForm({ ...form, status: label })}
                  />
                  <span className="checkmark" />
                  {label}
                </label>
              ))}
            </div>
            <input
              type="number"
              id="experience"
              name="experience"
              required
              placeholder="Years of Experience"
              className="career-form-experience"
              min={0}
              value={form.experience}
              onChange={(e) => setForm({ ...form, experience: e.target.value })}
            />
            <textarea
              placeholder="Other Details"
              name="details"
              className="career-form-txtarea"
              required
              value={form.details}
              onChange={(e) => setForm({ ...form, details: e.target.value })}
            />
            <div className="file">
              <h2 className="name">Upload Your Resume</h2>
              <input
                key={fileKey}
                className="upload"
                type="file"
                name="fileToUpload"
                accept=".doc,.docx,.pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <br />
              <br />
              <br />
            </div>
            <input type="submit" value="Submit" name="submit" className="career-form-btn" />
          </form>
          {statusMsg ? (
            <p
              style={{
                textAlign: 'center',
                marginTop: '2rem',
                fontSize: '2rem',
                color: statusMsg.ok ? 'green' : 'crimson',
              }}
            >
              {statusMsg.text}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
