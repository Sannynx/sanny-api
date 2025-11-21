import { invalidateCode } from "../src/db.js";
import { isAdminReq } from "../src/auth.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  if (!isAdminReq(req)) return res.status(401).json({ error: "Unauthorized" });

  const { code } = req.body || {};
  if (!code) return res.status(400).json({ error: "Code required" });

  const result = await invalidateCode(code);
  if (!result) return res.status(404).json({ error: "Not found" });

  return res.json({ ok: true });
}
