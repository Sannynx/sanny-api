import { sql } from "@vercel/postgres";

// cria código
export async function saveCode(code) {
  await sql`
    INSERT INTO codes (code, created_at, used, used_at, expires_at)
    VALUES (${code}, NOW(), FALSE, NULL, NULL)
  `;
}

// lista códigos
export async function listCodes() {
  const { rows } = await sql`
    SELECT code, created_at, used, used_at, expires_at
    FROM codes
    ORDER BY created_at DESC
  `;
  return rows;
}

// pega um código específico
export async function getCodeDB(code) {
  const { rows } = await sql`
    SELECT *
    FROM codes
    WHERE code = ${code}
    LIMIT 1;
  `;
  return rows[0] || null;
}

// marca como usado e define expiração
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

// função antiga (mantida para compatibilidade)
// NÃO USE para lógica de expiração
export async function useCodeDB(code) {
  const { rows } = await sql`
    UPDATE codes
    SET used = TRUE,
        used_at = NOW()
    WHERE code = ${code} AND used = FALSE
    RETURNING *;
  `;
  return rows[0] || null;
}

// invalida o código (expira na hora)
export async function invalidateCode(code) {
  const { rows } = await sql`
    UPDATE codes
    SET used = TRUE,
        used_at = NOW(),
        expires_at = NOW()
    WHERE code = ${code}
    RETURNING *;
  `;
  return rows[0] || null;
}
