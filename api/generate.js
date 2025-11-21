import { saveCode } from "../src/db.js";
import { isAdminReq } from "../src/auth.js";
import { randomUUID } from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  if (!isAdminReq(req)) return res.status(401).json({ error: "Unauthorized" });

  const code = randomUUID().split("-")[0].toUpperCase();
  await saveCode(code);
  res.json({ code });
}
