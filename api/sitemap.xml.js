import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Hashids from 'hashids';

const hashids = new Hashids('alfietz-product-hash', 4);
const encodeId = (id) => hashids.encode(Number(id));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const envPath = path.resolve(projectRoot, '.env');
const envLocalPath = path.resolve(projectRoot, '.env.local');

dotenv.config({ path: envLocalPath });
dotenv.config({ path: envPath });

function readEnvVar(name, fallback = '') {
  if (fs.existsSync(envPath) && dotenv.parse(fs.readFileSync(envPath, 'utf-8'))[name]) {
    return dotenv.parse(fs.readFileSync(envPath, 'utf-8'))[name];
  }
  if (fs.existsSync(envLocalPath) && dotenv.parse(fs.readFileSync(envLocalPath, 'utf-8'))[name]) {
    return dotenv.parse(fs.readFileSync(envLocalPath, 'utf-8'))[name];
  }
  return process.env[name] || fallback;
}

const DB_URL = readEnvVar('TURSO_URL', readEnvVar('VITE_TURSO_URL', ''));
const DB_TOKEN = readEnvVar('TURSO_AUTH_TOKEN', readEnvVar('VITE_TURSO_AUTH_TOKEN', ''));

async function query(sql) {
  const dbUrl = DB_URL.replace(/^[a-z][a-z0-9+.-]*:\/\//, '');
  const res = await fetch(`https://${dbUrl}/v2/pipeline`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${DB_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [{ type: 'execute', stmt: { sql, args: [] } }]
    }),
  });
  const json = await res.json();
  const result = json.results?.[0]?.response?.result;
  if (!result) return { rows: [], cols: [] };
  const cols = result.cols || [];
  const rows = (result.rows || []).map(r => {
    const obj = {};
    r.forEach((cell, i) => {
      obj[cols[i]?.name || i] = cell.value;
    });
    return obj;
  });
  return { rows, cols };
}

const BASE_URL = 'https://alfietz.shop';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'text/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=3600');

  try {
    const [productsRes, tailorsRes, categoriesRes] = await Promise.all([
      query("SELECT id, updated_at FROM products WHERE status = 'In Stock'"),
      query("SELECT username FROM users WHERE user_type = 'supplier'"),
      query("SELECT DISTINCT category_name FROM products WHERE category_name IS NOT NULL"),
    ]);

    let urls = `
  <url>
    <loc>${BASE_URL}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${BASE_URL}/home</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`;

    for (const p of productsRes.rows) {
      urls += `
  <url>
    <loc>${BASE_URL}/product/${encodeId(p.id)}</loc>
    <lastmod>${p.updated_at || new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    }

    for (const t of tailorsRes.rows) {
      urls += `
  <url>
    <loc>${BASE_URL}/@${t.username}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    }

    for (const c of categoriesRes.rows) {
      if (c.category_name) {
        urls += `
  <url>
    <loc>${BASE_URL}/explore/${encodeURIComponent(c.category_name)}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
      }
    }

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`;

    res.status(200).send(sitemap);
  } catch (e) {
    console.error('Sitemap generation error:', e);
    res.status(500).send('Error generating sitemap');
  }
}
