const { kv } = require('@vercel/kv');
const bcrypt = require('bcryptjs');
const { signToken, setSessionCookie } = require('../lib/auth');
const { authPage } = require('../lib/page');

module.exports = async (req, res) => {
  const existing = await kv.get('admin:account');

  if (req.method === 'GET') {
    if (existing) {
      res.setHeader('Content-Type', 'text/html');
      return res.send(authPage('Admin Already Exists', `
        <h1>An Admin Account Already Exists</h1>
        <p class="sub">Only one admin account is allowed. To reset it, delete the "admin:account" key in your Vercel KV database from the Vercel dashboard, then reload this page.</p>
        <a class="auth-links" href="/login">Go to Login →</a>
      `));
    }
    res.setHeader('Content-Type', 'text/html');
    return res.send(authPage('Create Admin Account', `
      <h1>Create the Admin Account</h1>
      <p class="sub">This is a one-time setup. Once created, this is the only account that can edit the site.</p>
      <form method="POST" action="/signup">
        <div class="field"><label>Email</label>
          <input type="email" name="email" required placeholder="you@example.com">
        </div>
        <div class="field"><label>Password</label>
          <input type="password" name="password" required minlength="8" placeholder="At least 8 characters">
        </div>
        <button class="btn" type="submit">Create Account</button>
      </form>
      <div class="auth-links">Already have an account? <a href="/login">Log in</a></div>
    `));
  }

  if (req.method === 'POST') {
    if (existing) {
      res.statusCode = 302;
      res.setHeader('Location', '/login');
      return res.end();
    }
    const { email, password } = req.body || {};
    if (!email || !password || password.length < 8) {
      res.setHeader('Content-Type', 'text/html');
      return res.send(authPage('Create Admin Account', `
        <div class="auth-error">Please provide a valid email and a password of at least 8 characters.</div>
        <a class="auth-links" href="/signup">← Try again</a>
      `));
    }
    const passwordHash = await bcrypt.hash(password, 10);
    await kv.set('admin:account', { email, passwordHash });

    const token = signToken(email);
    setSessionCookie(res, token);
    res.statusCode = 302;
    res.setHeader('Location', '/admin');
    return res.end();
  }

  res.statusCode = 405;
  res.end('Method not allowed');
};
