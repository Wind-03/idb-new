const { clearSessionCookie } = require('../lib/auth');

module.exports = (req, res) => {
  clearSessionCookie(res);
  res.statusCode = 302;
  res.setHeader('Location', '/login');
  res.end();
};
