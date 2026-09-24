const { verifyRequest } = require('../../lib/auth');
const { getContent, setContent, isValidType, WRAPPER_KEYS } = require('../../lib/kv');

module.exports = async (req, res) => {
  const { type } = req.query;

  if (!isValidType(type)) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ error: 'Unknown content type' }));
  }

  if (req.method === 'GET') {
    // Public read — anyone visiting the site needs this, no login required.
    const data = await getContent(type);
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(data));
  }

  if (req.method === 'POST') {
    // Protected write — only the logged-in admin can save changes.
    const session = verifyRequest(req);
    if (!session) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ error: 'Not logged in' }));
    }
    const wrapperKey = WRAPPER_KEYS[type];
    const body = req.body || {};
    if (!Array.isArray(body[wrapperKey])) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ error: `Expected a "${wrapperKey}" array in the request body` }));
    }
    await setContent(type, body);
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ ok: true }));
  }

  res.statusCode = 405;
  res.end('Method not allowed');
};
