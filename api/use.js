import { useCodeDB } from "../src/db.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { code } = req.body || {};
  if (!code) return res.status(400).json({ error: "Code required" });

  const result = await useCodeDB(code);
  if (!result) return res.json({ valid: false, error: 'Invalid or already used' });

  return res.json({ valid: true });
}
