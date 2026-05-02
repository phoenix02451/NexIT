import { useState, useRef, useLayoutEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useGoogleClientId } from '../context/GoogleClientIdContext';
import GoogleGLogo from './GoogleGLogo';

/**
 * Sign-in / sign-up with Google block for login and register pages.
 * Client ID: Vite env VITE_GOOGLE_CLIENT_ID, or runtime GET /api/auth/config (GOOGLE_CLIENT_ID on the server, e.g. Netlify).
 */
export default function AuthGoogleSignIn({ mode = 'login', onCredential, onFlowError, disabled = false }) {
  const { clientId, loading: configLoading, configLoadError } = useGoogleClientId();
  const clientConfigured = Boolean((clientId || '').trim());
  const [showSetupHint, setShowSetupHint] = useState(false);
  const shellRef = useRef(null);
  // Match shell width in px — avoid changing on every tick (GSI re-runs when `width` changes; ResizeObserver can thrash the button into blank state)
  const [gsiButtonWidth, setGsiButtonWidth] = useState(400);

  const regionLabel = mode === 'register' ? 'Sign up with Google' : 'Sign in with Google';
  const googleText = mode === 'register' ? 'signup_with' : 'signin_with';
  const fallbackLabel = regionLabel;

  useLayoutEffect(() => {
    if (!clientConfigured) return;
    let cancelled = false;
    const measure = () => {
      const el = shellRef.current;
      if (!el || cancelled) return;
      const w = Math.floor(el.clientWidth);
      if (w > 0) {
        const inner = Math.max(200, w);
        setGsiButtonWidth((prev) => (prev === inner ? prev : inner));
      }
    };
    measure();
    // Second frame: layout (e.g. flex) sometimes reports 0 width on first pass
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(measure);
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [clientConfigured]);

  if (configLoading) {
    return (
      <div className="auth-google-block" role="region" aria-label={regionLabel}>
        <div className="auth-google-wrap auth-google-widget-shell">
          <p className="mb-0 text-muted" style={{ fontSize: '0.9rem' }}>
            Loading Google sign-in…
          </p>
        </div>
      </div>
    );
  }

  if (configLoadError && !clientConfigured) {
    return (
      <div className="auth-google-block" role="region" aria-label={regionLabel}>
        <div className="auth-google-wrap auth-google-widget-shell">
          <p className="auth-alert mb-0" role="alert">
            {configLoadError}
          </p>
        </div>
      </div>
    );
  }

  if (!clientConfigured) {
    return (
      <div className="auth-google-block" role="region" aria-label={regionLabel}>
        <div className="auth-google-wrap auth-google-widget-shell">
          <button
            type="button"
            className="auth-google-fallback-btn"
            disabled={disabled}
            onClick={() => setShowSetupHint(true)}
            aria-describedby={showSetupHint ? 'auth-google-setup-hint' : undefined}
          >
            <span className="auth-google-fallback-btn__logo" aria-hidden>
              <GoogleGLogo />
            </span>
            <span className="auth-google-fallback-btn__label">{fallbackLabel}</span>
          </button>
        </div>
        {showSetupHint ? (
          <p id="auth-google-setup-hint" className="auth-hint auth-google-setup-hint">
            Use the same <strong>OAuth 2.0 Web client ID</strong> everywhere (ends in{' '}
            <code>.apps.googleusercontent.com</code>). Set <code>GOOGLE_CLIENT_ID</code> in{' '}
            <code>server/.env</code> locally, or in <strong>Netlify → Site configuration → Environment variables</strong>{' '}
            for production (then redeploy). Optionally set <code>VITE_GOOGLE_CLIENT_ID</code> in <code>client/.env</code>{' '}
            for local Vite, or add it to Netlify build env so the ID is baked into the client bundle. In{' '}
            <strong>Google Cloud Console → APIs &amp; Services → Credentials</strong>, open your Web client and add
            this app’s origin (e.g. <code>http://localhost:5173</code> and your <code>https://…</code> site) under{' '}
            <strong>Authorized JavaScript origins</strong>.
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="auth-google-block" role="region" aria-label={regionLabel}>
      <div
        ref={shellRef}
        className={`auth-google-wrap auth-google-widget-shell auth-google-gsi-stack${
          disabled ? ' auth-google-wrap--disabled' : ''
        }`}
      >
        <div className="auth-google-gsi-skin" aria-hidden="true">
          <span className="auth-google-gsi-skin__logo">
            <GoogleGLogo />
          </span>
          <span className="auth-google-gsi-skin__text">{regionLabel}</span>
        </div>
        <div className="auth-google-gsi-hit">
          <GoogleLogin
            onSuccess={(credentialResponse) => {
              const cred = credentialResponse?.credential;
              if (cred) onCredential(cred);
            }}
            onError={() => onFlowError?.()}
            type="standard"
            theme="outline"
            size="large"
            text={googleText}
            shape="rectangular"
            width={gsiButtonWidth}
            logo_alignment="left"
            containerProps={{ className: 'auth-google-gsi-root', style: { width: '100%' } }}
          />
        </div>
      </div>
    </div>
  );
}
