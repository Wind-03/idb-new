const jwt = require('jsonwebtoken');
const cookie = require('cookie');

const SECRET = process.env.JWT_SECRET;
const COOKIE_NAME = 'idb_session';

function requireSecret() {
  if (!SECRET) {
    throw new Error(
      'JWT_SECRET environment variable is not set. Add it in your Vercel project settings ' +
      '(Settings → Environment Variables) — any long random string works.'
    );
  }
}

function signToken(email) {
  requireSecret();
  return jwt.sign({ email }, SECRET, { expiresIn: '8h' });
}

function verifyRequest(req) {
  if (!SECRET) return null;
  const cookies = cookie.parse(req.headers.cookie || '');
  const token = cookies[COOKIE_NAME];
  if (!token) return null;
  try {
    return jwt.verify(token, SECRET);
  } catch (e) {
    return null;
  }
}

function setSessionCookie(res, token) {
  res.setHeader('Set-Cookie', cookie.serialize(COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 8,
    path: '/',
  }));
}

function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', cookie.serialize(COOKIE_NAME, '', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  }));
}

module.exports = { signToken, verifyRequest, setSessionCookie, clearSessionCookie };
