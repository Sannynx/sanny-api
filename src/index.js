const fs = require('fs');
const path = require('path');

let codesFile = '/tmp/codes.json';

// Load existing codes
function loadCodes() {
  try {
    return JSON.parse(fs.readFileSync(codesFile, 'utf8'));
  } catch {
    return [];
  }
}

// Save codes
function saveCodes(codes) {
  fs.writeFileSync(codesFile, JSON.stringify(codes));
}

module.exports = (req, res) => {
  const url = req.url;

  // Basic admin login check
  if (url.startsWith('/api/generate')) {
    const auth = req.headers.authorization;
    if (!auth || auth !== 'Basic ' + Buffer.from('admin:admin').toString('base64')) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Generate a simple random code
    const newCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    const codes = loadCodes();
    codes.push(newCode);
    saveCodes(codes);

    res.status(200).json({ code: newCode });
    return;
  }

  if (url.startsWith('/api/codes')) {
    const codes = loadCodes();
    res.status(200).json({ codes });
    return;
  }

  res.status(200).json({ message: "API OK" });
};
