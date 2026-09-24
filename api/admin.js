const fs = require('fs');
const path = require('path');
const { verifyRequest } = require('../lib/auth');

module.exports = (req, res) => {
  const session = verifyRequest(req);
  if (!session) {
    res.statusCode = 302;
    res.setHeader('Location', '/login');
    return res.end();
  }
  const filePath = path.join(process.cwd(), 'views', 'dashboard.html');
  res.setHeader('Content-Type', 'text/html');
  res.send(fs.readFileSync(filePath, 'utf-8'));
};
