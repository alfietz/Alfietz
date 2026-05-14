import { createClient } from "@libsql/client";

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Use environment variables (Secrets in Vercel)
  const url = process.env.TURSO_URL || process.env.VITE_TURSO_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN || process.env.VITE_TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    console.error('Environment variables missing. Expected TURSO_URL and TURSO_AUTH_TOKEN.');
    return res.status(500).json({ 
      error: 'Database configuration missing on server',
      debug: {
        hasUrl: !!process.env.TURSO_URL,
        hasViteUrl: !!process.env.VITE_TURSO_URL,
        hasToken: !!process.env.TURSO_AUTH_TOKEN,
        hasViteToken: !!process.env.VITE_TURSO_AUTH_TOKEN
      }
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

    const result = await client.execute({ sql, args: args || [] });
    return res.status(200).json(result);
  } catch (error) {
    console.error('Database Proxy Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
