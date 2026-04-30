import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { siteInfo } from '../config/siteInfo';

export default function Footer() {
  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [msg, setMsg] = useState(null);

  async function onSubscribe(e) {
    e.preventDefault();
    setMsg(null);
    try {
      const { data } = await axios.post('/api/subscribe', { email: subscribeEmail });
      setMsg(data.message || 'Thanks!');
      setSubscribeEmail('');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Something went wrong.');
    }
  }

  const { companyName, legalName, tagline, addressLines, hoursNote, phoneDisplay, phoneTel, email, social, logoSrc } =
    siteInfo;

  return (
    <div className="footer footer-modern footer-v2">
      <div className="footer-top footer-modern-top">
        <div className="container">
          <div className="row footer-v2-grid align-items-stretch">
            <div className="col-lg-4 col-md-12 footer-v2-brand footer-modern-col">
              <Link to="/" className="footer-v2-logo-link">
                <img src={logoSrc} alt={`${companyName} logo`} className="footer-v2-logo" />
              </Link>
              <p className="footer-v2-tagline">{tagline}</p>
              <div className="footer-v2-contact-block" id="footer-contact">
                <a className="footer-v2-contact-line" href={`tel:${phoneTel}`}>
                  <span className="footer-v2-contact-icon" aria-hidden="true">
                    <i className="fas fa-phone-alt" />
                  </span>
                  <span>
                    <span className="footer-v2-contact-label">Phone</span>
                    <span className="footer-v2-contact-value">{phoneDisplay}</span>
                  </span>
                </a>
                <a className="footer-v2-contact-line" href={`mailto:${email}`}>
                  <span className="footer-v2-contact-icon" aria-hidden="true">
                    <i className="fas fa-envelope" />
                  </span>
                  <span>
                    <span className="footer-v2-contact-label">Email</span>
                    <span className="footer-v2-contact-value">{email}</span>
                  </span>
                </a>
                <div className="footer-v2-contact-line footer-v2-contact-line--static">
                  <span className="footer-v2-contact-icon" aria-hidden="true">
                    <i className="fas fa-map-marker-alt" />
                  </span>
                  <span>
                    <span className="footer-v2-contact-label">Location</span>
                    <span className="footer-v2-contact-value">
                      {addressLines[0]}
                      <br />
                      {addressLines[1]}
                    </span>
                  </span>
                </div>
                <p className="footer-v2-hours">{hoursNote}</p>
              </div>
              <div className="social-links footer-v2-social">
                <a href={social.facebook} aria-label="Facebook" rel="noreferrer noopener" target="_blank">
                  <i className="ion-logo-facebook" />
                </a>
                <a href={social.x} aria-label="X" rel="noreferrer noopener" target="_blank">
                  <i className="ion-logo-twitter" />
                </a>
                <a href={social.linkedin} aria-label="LinkedIn" rel="noreferrer noopener" target="_blank">
                  <i className="ion-logo-linkedin" />
                </a>
                <a href={social.instagram} aria-label="Instagram" rel="noreferrer noopener" target="_blank">
                  <i className="ion-logo-instagram" />
                </a>
              </div>
            </div>

            <div className="col-lg-2 col-md-6 footer-links footer-modern-col footer-v2-col footer-v2-panel footer-v2-panel--explore">
              <div className="footer-v2-panel-head">
                <span className="footer-v2-panel-eyebrow">Sitemap</span>
                <h4 id="footer-explore-heading">Explore</h4>
              </div>
              <ul className="footer-v2-navlist" aria-labelledby="footer-explore-heading">
                <li>
                  <Link className="footer-v2-navlink" to="/">
                    Home
                  </Link>
                </li>
                <li>
                  <a className="footer-v2-navlink" href="/#about">
                    About
                  </a>
                </li>
                <li>
                  <a className="footer-v2-navlink" href="/#service">
                    Services
                  </a>
                </li>
                <li>
                  <a className="footer-v2-navlink" href="/#introduce">
                    Introduce
                  </a>
                </li>
                <li>
                  <a className="footer-v2-navlink" href="/#team">
                    Team
                  </a>
                </li>
                <li>
                  <a className="footer-v2-navlink" href="/#faq">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            <div className="col-lg-3 col-md-6 footer-links footer-modern-col footer-v2-col footer-v2-panel footer-v2-panel--company">
              <div className="footer-v2-panel-head">
                <span className="footer-v2-panel-eyebrow">Legal & work</span>
                <h4 id="footer-company-heading">Company</h4>
              </div>
              <ul className="footer-v2-navlist" aria-labelledby="footer-company-heading">
                <li>
                  <Link className="footer-v2-navlink" to="/careers">
                    Careers
                  </Link>
                </li>
                <li>
                  <a className="footer-v2-navlink" href="/#footer-contact">
                    Contact
                  </a>
                </li>
                <li>
                  <a className="footer-v2-navlink" href="/#">
                    Terms of use
                  </a>
                </li>
                <li>
                  <a className="footer-v2-navlink" href="/#">
                    Privacy policy
                  </a>
                </li>
              </ul>
            </div>

            <div className="col-lg-3 col-md-12 footer-newsletter footer-modern-col footer-v2-col footer-v2-panel footer-v2-panel--newsletter">
              <div className="footer-v2-panel-head">
                <span className="footer-v2-panel-eyebrow">Stay in the loop</span>
                <h4 id="footer-newsletter-heading">Newsletter</h4>
              </div>
              <div className="footer-v2-newsletter-body">
                <p className="footer-v2-newsletter-lead">
                  Product notes, release tips, and occasional company news. A few emails per quarter—unsubscribe in one
                  click.
                </p>
                <div className="footer-v2-subscribe-shell">
                  <form className="footer-subscribe-form footer-v2-subscribe-form" onSubmit={onSubscribe}>
                    <div className="footer-subscribe-field footer-v2-subscribe-field">
                      <input
                        type="email"
                        name="email"
                        className="footer-subscribe-input footer-v2-subscribe-input"
                        value={subscribeEmail}
                        onChange={(e) => setSubscribeEmail(e.target.value)}
                        placeholder="you@company.com"
                        autoComplete="email"
                        required
                      />
                      <button type="submit" className="footer-subscribe-btn footer-v2-subscribe-btn">
                        <span className="footer-v2-subscribe-btn-label">Join</span>
                        <span className="footer-v2-subscribe-btn-icon" aria-hidden="true">
                          <i className="ion-ios-arrow-round-forward" />
                        </span>
                      </button>
                    </div>
                  </form>
                  {msg ? <p className="footer-subscribe-msg footer-v2-subscribe-msg">{msg}</p> : null}
                </div>
              </div>
            </div>
          </div>

          <div className="footer-v2-divider" aria-hidden />
          <div className="footer-v2-meta">
            <span className="footer-v2-meta-item">Secure delivery</span>
            <span className="footer-v2-meta-dot" />
            <span className="footer-v2-meta-item">Clear SLAs</span>
            <span className="footer-v2-meta-dot" />
            <span className="footer-v2-meta-item">Long-term support</span>
          </div>
        </div>
      </div>

      <div className="container footer-modern-bottom footer-v2-bottom">
        <div className="row align-items-center justify-content-between gy-2 footer-v2-bottom-row">
          <div className="col-md-7 copyright footer-v2-copy">
            © {new Date().getFullYear()} {legalName}. All rights reserved.
          </div>
          <div className="col-md-5 text-md-end footer-v2-stack">
            <span className="footer-v2-stack-label">Stack</span> MongoDB · Express · React · Node.js
          </div>
        </div>
      </div>
    </div>
  );
}
