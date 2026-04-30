/**
 * Human-readable message for failed API calls (axios).
 * When the server is down, CORS blocks, or the function crashes, `response` is often missing.
 */
export function getApiErrorMessage(err, fallback) {
  const body = err?.response?.data;
  if (typeof body?.message === 'string' && body.message.trim()) {
    const detail = typeof body.detail === 'string' && body.detail.trim() ? ` ${body.detail}` : '';
    return `${body.message}${detail}`;
  }
  const status = err?.response?.status;
  if (status === 502 || status === 503) {
    return 'The service is temporarily unavailable. Try again in a moment.';
  }
  if (status === 504 || status === 408) {
    return 'The request timed out. Try again.';
  }
  if (!err?.response) {
    const msg = (err?.message || '').toLowerCase();
    if (msg.includes('network') || err?.code === 'ERR_NETWORK' || err?.code === 'ECONNREFUSED') {
      return 'Could not reach the server. Check your connection, or wait for the site to finish deploying.';
    }
    if (msg.includes('timeout') || err?.code === 'ECONNABORTED') {
      return 'The request took too long. Try again.';
    }
    if (msg.includes('canceled') || err?.code === 'ERR_CANCELED') {
      return 'Request was canceled.';
    }
  }
  return fallback;
}
