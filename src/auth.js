export function parseCookies(cookieHeader) {
  if (!cookieHeader) return {};
  return cookieHeader.split(';').map(c => c.trim()).reduce((acc, pair) => {
    const eq = pair.indexOf('=');
    if (eq === -1) return acc;
    const k = pair.slice(0, eq).trim();
    const v = pair.slice(eq + 1).trim();
    acc[k] = decodeURIComponent(v);
    return acc;
  }, {});
}

export function isAdminReq(req) {
  const authHeader = req.headers && req.headers.authorization ? req.headers.authorization : '';
  const cookieHeader = req.headers && req.headers.cookie ? req.headers.cookie : '';
  const ADMIN_USER = process.env.ADMIN_USER || 'admin';
  const ADMIN_PASS = process.env.ADMIN_PASS || 'admin';

  // check Authorization header Basic
  if (authHeader && authHeader.startsWith('Basic ')) {
    try {
      const b = authHeader.slice(6);
      const s = Buffer.from(b, 'base64').toString('utf8');
      return s === (ADMIN_USER + ':' + ADMIN_PASS);
    } catch(e) {}
  }

  // check cookie admin_token (base64)
  const cookies = parseCookies(cookieHeader);
  if (cookies && cookies.admin_token) {
    try {
      const s = Buffer.from(cookies.admin_token, 'base64').toString('utf8');
      return s === (ADMIN_USER + ':' + ADMIN_PASS);
    } catch(e) {}
  }

  return false;
}
