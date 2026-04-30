import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Account() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function onLogout() {
    await logout();
    navigate('/', { replace: true });
  }

  return (
    <section className="auth-page">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="auth-card">
              <p className="auth-eyebrow">Your account</p>
              <h1 className="auth-title">Signed in</h1>
              <div className="auth-account-block">
                {user?.picture ? (
                  <img src={user.picture} alt="" className="auth-avatar" width={72} height={72} />
                ) : (
                  <div className="auth-avatar auth-avatar--placeholder" aria-hidden>
                    {(user?.email || '?').charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  {user?.name ? <p className="auth-account-name">{user.name}</p> : null}
                  <p className="auth-account-email">{user?.email}</p>
                  <p className="auth-muted mb-0">
                    {user?.hasPassword ? 'Email & password' : 'Google'} sign-in
                  </p>
                </div>
              </div>
              <div className="auth-account-actions">
                <button type="button" className="auth-submit auth-submit--ghost" onClick={onLogout}>
                  Sign out
                </button>
                <Link to="/" className="auth-link-home">
                  Back to home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
