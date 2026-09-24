const { kv } = require('@vercel/kv');
const bcrypt = require('bcryptjs');
const { signToken, setSessionCookie } = require('../lib/auth');
const { authPage } = require('../lib/page');

module.exports = async (req, res) => {
  const admin = await kv.get('admin:account');

  if (req.method === 'GET') {
    if (!admin) {
      res.statusCode = 302;
      res.setHeader('Location', '/signup');
      return res.end();
    }
    res.setHeader('Content-Type', 'text/html');
    return res.send(authPage('Admin Login', `
      <h1>Admin Login</h1>
      <p class="sub">Restricted to the site administrator only.</p>
      <form method="POST" action="/login">
        <div class="field"><label>Email</label>
          <input type="email" name="email" required placeholder="you@example.com">
        </div>
        <div class="field"><label>Password</label>
          <input type="password" name="password" required placeholder="Your password">
        </div>
        <button class="btn" type="submit">Log In</button>
      </form>
    `));
  }

  if (req.method === 'POST') {
    const { email, password } = req.body || {};
    const fail = () => {
      res.setHeader('Content-Type', 'text/html');
      res.send(authPage('Admin Login', `
        <div class="auth-error">Incorrect email or password.</div>
        <a class="auth-links" href="/login">← Try again</a>
      `));
    };
    if (!admin || admin.email !== email) return fail();
    const match = await bcrypt.compare(password, admin.passwordHash);
    if (!match) return fail();

    const token = signToken(admin.email);
    setSessionCookie(res, token);
    res.statusCode = 302;
    res.setHeader('Location', '/admin');
    return res.end();
  }

  res.statusCode = 405;
  res.end('Method not allowed');
};
