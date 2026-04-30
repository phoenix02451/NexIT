import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/http';
import { getApiErrorMessage } from '../utils/apiErrorMessage';
import AuthGoogleSignIn from '../components/AuthGoogleSignIn';

export default function Register() {
  const { register, setUserFromGoogle } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const submitLock = useRef(false);

  async function onSubmit(e) {
    e.preventDefault();
    if (submitLock.current) return;
    submitLock.current = true;
    setError('');
    setPending(true);
    try {
      await register({ email, password, name });
      navigate('/account', { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Registration failed.'));
    } finally {
      setPending(false);
      submitLock.current = false;
    }
  }

  async function onGoogleSuccess(credential) {
    if (!credential) return;
    setError('');
    setPending(true);
    try {
      const { data } = await api.post('/api/auth/google', { credential });
      setUserFromGoogle(data.user);
      navigate('/account', { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Google sign-in failed.'));
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="auth-page auth-page--forms-lg">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-11 col-lg-10 col-xl-9">
            <div className="auth-card">
              <p className="auth-eyebrow">Get started</p>
              <h1 className="auth-title">Create account</h1>
              <p className="auth-lead">Register with email and password, or continue with Google.</p>

              <AuthGoogleSignIn
                mode="register"
                onCredential={onGoogleSuccess}
                onFlowError={() => setError('Google sign-in was interrupted.')}
                disabled={pending}
              />

              <div className="auth-divider">
                <span>or with email</span>
              </div>

              <form onSubmit={onSubmit} className="auth-form">
                {error ? (
                  <div className="auth-alert" role="alert">
                    {error}
                  </div>
                ) : null}
                <label className="auth-label" htmlFor="reg-name">
                  Name <span className="auth-optional">(optional)</span>
                </label>
                <input
                  id="reg-name"
                  className="auth-input"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <label className="auth-label" htmlFor="reg-email">
                  Email
                </label>
                <input
                  id="reg-email"
                  className="auth-input"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <label className="auth-label" htmlFor="reg-password">
                  Password
                </label>
                <input
                  id="reg-password"
                  className="auth-input"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  required
                />
                <p className="auth-field-hint">At least 8 characters.</p>
                <button type="submit" className="auth-submit" disabled={pending}>
                  {pending ? 'Creating…' : 'Create account'}
                </button>
              </form>

              <p className="auth-footer-text">
                Already have an account? <Link to="/login">Sign in</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
