import pool from "@/lib/db";

export async function POST(req) {
  const { code } = await req.json();

  if (!code) {
    return Response.json({ valid: false, error: "Code required" });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM codes WHERE code = $1",
      [code]
    );

    if (result.rows.length === 0) {
      return Response.json({ valid: false, error: "Invalid code" });
    }

    const row = result.rows[0];

    // Se já usado e não expirado -> negar
    if (row.used && row.expires_at !== null) {
      const now = new Date();
      const expires = new Date(row.expires_at);

      if (now < expires) {
        return Response.json({
          valid: false,
          error: "Code already used and still active"
        });
      }
    }

    // Definir validade de 24 horas
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await pool.query(
      "UPDATE codes SET used = true, expires_at = $1 WHERE code = $2",
      [expiresAt, code]
    );

    return Response.json({
      valid: true,
      expires_at: expiresAt,
    });

  } catch (err) {
    console.error(err);
    return Response.json({ valid: false, error: "Server error" });
  }
}
