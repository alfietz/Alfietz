import { createClient } from "@libsql/client";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local (from Vercel) and .env
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Use environment variables (Secrets in Vercel)
  const url = process.env.TURSO_URL || process.env.VITE_TURSO_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN || process.env.VITE_TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    console.error('Database configuration missing on server');
    return res.status(500).json({ 
      error: 'Database configuration missing on server',
    });
  }

  const { sql, args } = req.body;

  if (!sql) {
    return res.status(400).json({ error: 'SQL query is required' });
  }

  try {
    const client = createClient({
      url: url,
      authToken: authToken,
    });

    const result = await client.execute({ sql: sql, args: args || [] });

    // Explicitly convert Rows to plain objects for consistent JSON serialization
    const rows = result.rows.map(row => {
      const obj = {};
      result.columns.forEach((col, i) => {
        obj[col] = row[i];
      });
      return obj;
    });

    return res.status(200).json(JSON.parse(JSON.stringify({ ...result, rows }, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    )));
  } catch (error) {
    console.error('Database Proxy Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
