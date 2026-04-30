function isSecureRequest(req) {
  if (!req) return process.env.NODE_ENV === 'production';
  if (req.secure) return true;
  const proto = req.get?.('X-Forwarded-Proto');
  return proto === 'https';
}

function setAuthCookie(res, token, req) {
  const secure = isSecureRequest(req);
  res.cookie('access_token', token, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function clearAuthCookie(res, req) {
  const secure = isSecureRequest(req);
  res.clearCookie('access_token', {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
  });
}

module.exports = { setAuthCookie, clearAuthCookie };
