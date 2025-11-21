import { sql } from "@vercel/postgres";

export async function saveCode(code) {
  await sql`INSERT INTO codes (code, created_at) VALUES (${code}, NOW())`;
}

export async function listCodes() {
  const { rows } = await sql`SELECT code, created_at, used, used_at FROM codes ORDER BY created_at DESC`;
  return rows;
}

export async function useCodeDB(code) {
  const { rows } = await sql`
    UPDATE codes
    SET used = TRUE, used_at = NOW()
    WHERE code = ${code} AND used = FALSE
    RETURNING *;
  `;
  return rows[0] || null;
}

export async function invalidateCode(code) {
  const { rows } = await sql`
    UPDATE codes
    SET used = TRUE, used_at = NOW()
    WHERE code = ${code}
    RETURNING *;
  `;
  return rows[0] || null;
}
