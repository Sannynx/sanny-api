export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  res.setHeader('Set-Cookie', 'admin_token=; Path=/; HttpOnly; Secure; SameSite=Strict; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
  return res.json({ ok: true });
}
