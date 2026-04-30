import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/http';
import { getApiErrorMessage } from '../utils/apiErrorMessage';

const GoogleClientIdContext = createContext({
  clientId: '',
  loading: false,
  source: 'none', // 'vite' | 'api' | 'none'
  /** Set when GET /api/auth/config fails (e.g. API cold start, deploy, or function error). */
  configLoadError: null,
});

/**
 * Resolves the Google Web client ID for the SPA.
 * 1) import.meta.env.VITE_GOOGLE_CLIENT_ID (Vite build / local .env)
 * 2) GET /api/auth/config (Netlify: set GOOGLE_CLIENT_ID on the server; no VITE_ needed)
 */
export function GoogleClientIdProvider({ children }) {
  const viteId = useMemo(
    () => (import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim(),
    []
  );
  const [clientId, setClientId] = useState(viteId);
  const [loading, setLoading] = useState(!viteId);
  const [source, setSource] = useState(viteId ? 'vite' : 'none');
  const [configLoadError, setConfigLoadError] = useState(null);

  useEffect(() => {
    if (viteId) {
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setConfigLoadError(null);
        const { data } = await api.get('/api/auth/config');
        const id = typeof data?.googleClientId === 'string' ? data.googleClientId.trim() : '';
        if (!cancelled) {
          setClientId(id);
          setSource(id ? 'api' : 'none');
        }
      } catch (err) {
        if (!cancelled) {
          setClientId('');
          setSource('none');
          setConfigLoadError(
            getApiErrorMessage(err, 'Could not load Google sign-in settings. Try refreshing the page.')
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [viteId]);

  const value = useMemo(
    () => ({ clientId, loading, source, configLoadError }),
    [clientId, loading, source, configLoadError]
  );

  return <GoogleClientIdContext.Provider value={value}>{children}</GoogleClientIdContext.Provider>;
}

export function useGoogleClientId() {
  return useContext(GoogleClientIdContext);
}
