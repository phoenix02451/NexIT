import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/http';

const GoogleClientIdContext = createContext({
  clientId: '',
  loading: false,
  source: 'none', // 'vite' | 'api' | 'none'
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

  useEffect(() => {
    if (viteId) {
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get('/api/auth/config');
        const id = typeof data?.googleClientId === 'string' ? data.googleClientId.trim() : '';
        if (!cancelled) {
          setClientId(id);
          setSource(id ? 'api' : 'none');
        }
      } catch {
        if (!cancelled) {
          setClientId('');
          setSource('none');
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
    () => ({ clientId, loading, source }),
    [clientId, loading, source]
  );

  return <GoogleClientIdContext.Provider value={value}>{children}</GoogleClientIdContext.Provider>;
}

export function useGoogleClientId() {
  return useContext(GoogleClientIdContext);
}
