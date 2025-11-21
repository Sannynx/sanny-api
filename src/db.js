import { sql } from "@vercel/postgres";

// Salva novo código
export async function saveCode(code) {
  await sql`
    INSERT INTO codes (code, created_at, used, used_at, expires_at)
    VALUES (${code}, NOW(), FALSE, NULL, NULL)
  `;
}

// Lista códigos
export async function listCodes() {
  const { rows } = await sql`
    SELECT code, created_at, used, used_at, expires_at
    FROM codes
    ORDER BY created_at DESC
  `;
  return rows;
}

// Obtém o código completo
export async function getCodeDB(code) {
  const { rows } = await sql`
    SELECT *
    FROM codes
    WHERE code = ${code}
    LIMIT 1
  `;
  return rows[0] || null;
}

// Marca o código como usado e define expiração
export async function setCodeUsedDB(code, expiresAt) {
  const { rows } = await sql`
    UPDATE codes
    SET used = TRUE,
        used_at = NOW(),
        expires_at = ${expiresAt}
    WHERE code = ${code}
    RETURNING *;
  `;
  return rows[0] || null;
}

// Invalida (marca como usado)
export async function invalidateCode(code) {
  const { rows } = await sql`
    UPDATE codes
    SET used = TRUE,
        used_at = NOW(),
        expires_at = NOW()  -- expira na hora
    WHERE code = ${code}
    RETURNING *;
  `;
  return rows[0] || null;
}
