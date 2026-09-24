const { kv } = require('@vercel/kv');
const fs = require('fs');
const path = require('path');

// Maps the friendly content type name to its seed file (used only the very
// first time, to populate the database with your existing content).
const SEED_FILES = {
  news: 'news.json',
  leadership: 'leadership.json',
  economy: 'economy-programs.json',
  projects: 'projects.json',
  locations: 'locations.json',
};

const WRAPPER_KEYS = {
  news: 'articles',
  leadership: 'members',
  economy: 'programs',
  projects: 'items',
  locations: 'locations',
};

function isValidType(type) {
  return Object.prototype.hasOwnProperty.call(SEED_FILES, type);
}

async function getContent(type) {
  const key = `content:${type}`;
  let data = await kv.get(key);
  if (!data) {
    // First time this type has ever been requested: seed the database
    // from the JSON file bundled in the deployment, then remember it.
    const seedPath = path.join(process.cwd(), 'content', SEED_FILES[type]);
    const raw = fs.readFileSync(seedPath, 'utf-8');
    data = JSON.parse(raw);
    await kv.set(key, data);
  }
  return data;
}

async function setContent(type, data) {
  await kv.set(`content:${type}`, data);
}

module.exports = { getContent, setContent, isValidType, WRAPPER_KEYS, SEED_FILES };
