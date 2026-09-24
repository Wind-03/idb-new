function authPage(title, bodyHtml) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} — Ife Development Board</title>
<link rel="stylesheet" href="/style.css">
<style>
  .auth-wrap { max-width: 420px; margin: 6rem auto; padding: 0 1.5rem; }
  .auth-card { background: var(--white); border: 1px solid var(--stone-200); padding: 2.5rem; }
  .auth-card h1 { font-family: var(--font-display); color: var(--terracotta-900); font-size: 1.5rem; margin-bottom: 0.5rem; }
  .auth-card p.sub { color: var(--stone-500); font-size: 0.88rem; margin-bottom: 1.8rem; }
  .auth-error { background: #FBEAE5; border-left: 3px solid #B3402A; color: #7A2A1A; padding: 0.8rem 1rem; font-size: 0.85rem; margin-bottom: 1.3rem; }
  .auth-card .field { margin-bottom: 1.2rem; }
  .auth-card .btn { width: 100%; justify-content: center; margin-top: 0.5rem; }
  .auth-links { margin-top: 1.5rem; font-size: 0.85rem; text-align: center; color: var(--stone-500); }
  .auth-links a { color: var(--terracotta-700); font-weight: 600; }
</style>
</head>
<body style="background: var(--cream-50);">
<div class="auth-wrap">
  <div class="auth-card">
    ${bodyHtml}
  </div>
</div>
</body>
</html>`;
}

module.exports = { authPage };
