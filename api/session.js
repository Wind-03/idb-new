const { verifyRequest } = require('../lib/auth');

module.exports = (req, res) => {
  const session = verifyRequest(req);
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
    loggedIn: !!session,
    email: session ? session.email : null,
  }));
};
