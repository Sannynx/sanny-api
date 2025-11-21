const fs = require('fs');
const path = require('path');

if (req.method === 'GET' && pathOnly === '/admin') {
  const authorized = checkBasicAuth(req);
  if (!authorized) {
    res.statusCode = 302;
    res.setHeader('Location', '/login');
    return res.end();
  }

  // serve admin.html
  const adminPath = path.join(__dirname, '..', 'public', 'admin.html');
  const html = fs.readFileSync(adminPath, 'utf8');
  res.setHeader('Content-Type', 'text/html');
  return res.end(html);
}


const CODES_FILE = process.env.CODES_FILE || '/tmp/codes.json'; // on Vercel use /tmp
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'admin';

// helpers
function loadCodes() {
  try {
    const raw = fs.readFileSync(CODES_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function saveCodes(codes) {
  try {
    fs.writeFileSync(CODES_FILE, JSON.stringify(codes, null, 2), 'utf8');
  } catch (e) {
    // ignore write errors
  }
}

function checkBasicAuth(req) {
  const auth = req.headers['authorization'] || '';
  if (!auth.startsWith('Basic ')) return false;
  const b = auth.slice(6);
  const s = Buffer.from(b, 'base64').toString('utf8');
  const [u, p] = s.split(':');
  return u === ADMIN_USER && p === ADMIN_PASS;
}

module.exports = (req, res) => {
  const url = req.url || '/';
  const pathOnly = url.split('?')[0];
  let body = [];
  req.on('data', chunk => { body.push(chunk); });
  req.on('end', () => {
    try {
      body = Buffer.concat(body).toString();
      if (body) {
        try { body = JSON.parse(body); } catch(e) { /* keep raw */ }
      } else body = {};
    } catch (e) { body = {}; }

    // POST /api/generate -> require Basic auth
    if (req.method === 'POST' && pathOnly === '/api/generate') {
      if (!checkBasicAuth(req)) {
        res.statusCode = 401;
        res.setHeader('Content-Type','application/json');
        res.end(JSON.stringify({ error: 'Unauthorized' }));
        return;
      }
      // generate unique code: 8 chars uppercase alnum
      const newCode = Math.random().toString(36).substring(2,10).toUpperCase();
      const codes = loadCodes();
      codes.push({ code: newCode, created_at: new Date().toISOString(), used: false });
      saveCodes(codes);
      res.setHeader('Content-Type','application/json');
      res.end(JSON.stringify({ code: newCode }));
      return;
    }

    // GET /api/codes -> require Basic auth
    if (req.method === 'GET' && pathOnly === '/api/codes') {
      if (!checkBasicAuth(req)) {
        res.statusCode = 401;
        res.setHeader('Content-Type','application/json');
        res.end(JSON.stringify({ error: 'Unauthorized' }));
        return;
      }
      const codes = loadCodes();
      res.setHeader('Content-Type','application/json');
      res.end(JSON.stringify({ codes }));
      return;
    }

    // POST /api/use -> body: { code: "XXXX" } ; single-use: if exists and not used -> mark used and return ok
    if (req.method === 'POST' && pathOnly === '/api/use') {
      const inputCode = (body && body.code) ? String(body.code).trim().toUpperCase() : '';
      if (!inputCode) {
        res.statusCode = 400;
        res.setHeader('Content-Type','application/json');
        res.end(JSON.stringify({ error: 'Code required' }));
        return;
      }
      const codes = loadCodes();
      const idx = codes.findIndex(c => String(c.code).toUpperCase() === inputCode && !c.used);
      if (idx === -1) {
        res.statusCode = 404;
        res.setHeader('Content-Type','application/json');
        res.end(JSON.stringify({ valid: false, error: 'Invalid or already used' }));
        return;
      }
      // mark used (single-use)
      codes[idx].used = true;
      codes[idx].used_at = new Date().toISOString();
      saveCodes(codes);
      res.setHeader('Content-Type','application/json');
      res.end(JSON.stringify({ valid: true }));
      return;
    }

    // POST /api/invalidate -> admin only, body { code: "XXXX" } -> mark used=true
    if (req.method === 'POST' && pathOnly === '/api/invalidate') {
      if (!checkBasicAuth(req)) {
        res.statusCode = 401;
        res.setHeader('Content-Type','application/json');
        res.end(JSON.stringify({ error: 'Unauthorized' }));
        return;
      }
      const inputCode = (body && body.code) ? String(body.code).trim().toUpperCase() : '';
      if (!inputCode) {
        res.statusCode = 400;
        res.setHeader('Content-Type','application/json');
        res.end(JSON.stringify({ error: 'Code required' }));
        return;
      }
      const codes = loadCodes();
      const idx = codes.findIndex(c => String(c.code).toUpperCase() === inputCode);
      if (idx === -1) {
        res.statusCode = 404;
        res.setHeader('Content-Type','application/json');
        res.end(JSON.stringify({ error: 'Not found' }));
        return;
      }
      codes[idx].used = true;
      codes[idx].used_at = new Date().toISOString();
      saveCodes(codes);
      res.setHeader('Content-Type','application/json');
      res.end(JSON.stringify({ ok: true }));
      return;
    }

    // default
    res.setHeader('Content-Type','application/json');
    res.end(JSON.stringify({ message: 'API root. Available endpoints: POST /api/generate (admin), GET /api/codes (admin), POST /api/use' }));
  });
};
