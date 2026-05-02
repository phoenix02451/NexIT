import { useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/http';
import { getApiErrorMessage } from '../utils/apiErrorMessage';
import AuthGoogleSignIn from '../components/AuthGoogleSignIn';

export default function Login() {
  const { login, setUserFromGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/account';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const submitLock = useRef(false);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  async function onSubmit(e) {
    e.preventDefault();
    if (submitLock.current) return;
    submitLock.current = true;
    setError('');
    setPending(true);
    try {
      const emailVal = (emailRef.current?.value ?? email).trim();
      const passwordVal = passwordRef.current?.value ?? password;
      await login(emailVal, passwordVal);
      navigate(from, { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not sign in.'));
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
      navigate(from, { replace: true });
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
              <p className="auth-eyebrow">Welcome back</p>
              <h1 className="auth-title">Sign in</h1>
              <p className="auth-lead">Use your email and password, or continue with Google.</p>

              <AuthGoogleSignIn
                mode="login"
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
                <label className="auth-label" htmlFor="login-email">
                  Email
                </label>
                <input
                  id="login-email"
                  ref={emailRef}
                  name="email"
                  className="auth-input"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onInput={(e) => setEmail(e.currentTarget.value)}
                  required
                />
                <label className="auth-label" htmlFor="login-password">
                  Password
                </label>
                <input
                  id="login-password"
                  ref={passwordRef}
                  name="password"
                  className="auth-input"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onInput={(e) => setPassword(e.currentTarget.value)}
                  required
                />
                <button type="submit" className="auth-submit" disabled={pending}>
                  {pending ? 'Signing in…' : 'Sign in'}
                </button>
              </form>

              <p className="auth-footer-text">
                No account? <Link to="/register">Create one</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
