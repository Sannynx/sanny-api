Neon Postgres-ready codes API for Vercel

Setup steps:
1. In Vercel Marketplace add Neon (Serverless Postgres) and attach to this project.
2. Copy the provided DATABASE_URL / POSTGRES_* env vars into your project env.
3. Create table (run once):
   CREATE TABLE IF NOT EXISTS codes (
     code TEXT PRIMARY KEY,
     created_at TIMESTAMP DEFAULT NOW(),
     used BOOLEAN DEFAULT FALSE,
     used_at TIMESTAMP NULL
   );

Env vars:
- ADMIN_USER (optional, default 'admin')
- ADMIN_PASS (optional, default 'admin')

Files:
- vercel.json
- package.json
- src/db.js
- src/auth.js
- src/admin.js
- api/*.js
- public/login.html
- public/admin.html
