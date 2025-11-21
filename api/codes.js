import { listCodes } from "../src/db.js";
import { isAdminReq } from "../src/auth.js";

export default async function handler(req, res) {
  if (!isAdminReq(req)) return res.status(401).json({ error: "Unauthorized" });
  const codes = await listCodes();
  res.json({ codes });
}
