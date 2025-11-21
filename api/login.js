export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { user, pass } = req.body || {};
  const ADMIN_USER = process.env.ADMIN_USER || 'admin';
  const ADMIN_PASS = process.env.ADMIN_PASS || 'admin';
  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    const token = Buffer.from(user + ':' + pass).toString('base64');
    // Set HttpOnly, Secure cookie for 1 day
    res.setHeader('Set-Cookie', `admin_token=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`);
    return res.json({ ok: true });
  }
  return res.status(401).json({ error: 'Invalid credentials' });
}
