import { useCodeDB, getCodeDB, setCodeUsedDB } from "../src/db.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { code } = req.body || {};
  if (!code) return res.status(400).json({ error: "Code required" });

  // Obter dados do código
  const row = await getCodeDB(code);
  if (!row) {
    return res.json({ valid: false, error: "Invalid code" });
  }

  const now = new Date();

  // Se o código já foi usado anteriormente
  if (row.used) {
    if (row.expires_at) {
      const expires = new Date(row.expires_at);

      // Ainda válido → bloquear
      if (now < expires) {
        return res.json({
          valid: false,
          error: "Code already used and still active",
          expires_at: row.expires_at
        });
      }
    }

    // Já expirou → pode usar outro código novo
    return res.json({
      valid: false,
      error: "Expired code. Insert a new code."
    });
  }

  // Ativar por 24h
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await setCodeUsedDB(code, expiresAt);

  return res.json({
    valid: true,
    expires_at: expiresAt
  });
}
