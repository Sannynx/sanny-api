import fs from "fs";
import path from "path";
import { isAdminReq } from "./auth.js";

export default function handler(req, res) {
  const pathOnly = req.url.split('?')[0];
  // Serve admin page only on GET /admin
  if (req.method === 'GET' && pathOnly === '/admin') {
    if (!isAdminReq(req)) {
      res.writeHead(302, { Location: '/login' });
      res.end();
      return;
    }
    const adminPath = path.join(process.cwd(), 'public', 'admin.html');
    try {
      const html = fs.readFileSync(adminPath, 'utf8');
      res.setHeader('Content-Type', 'text/html');
      res.end(html);
    } catch (e) {
      res.statusCode = 500;
      res.end('Error loading admin page');
    }
    return;
  }

  // fallback - return 404
  res.statusCode = 404;
  res.end('Not found');
}
