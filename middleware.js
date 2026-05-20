export const config = {
  matcher: ['/product/:id*', '/tailor/:id*', '/legal/:path*'],
};

export default async function middleware(req) {
  const url = new URL(req.url);
  const userAgent = req.headers.get('user-agent') || '';
  
  // Detection for social media bots
  const isBot = /WhatsApp|facebookexternalhit|Twitterbot|LinkedInBot|Pinterest|Slackbot|TelegramBot|Discordbot/i.test(userAgent);

  if (isBot) {
    const pathParts = url.pathname.split('/');
    const type = pathParts[1]; // 'product' or 'tailor'
    const id = pathParts[2];

    if (id) {
      try {
        // Fetch data from Turso via HTTP
        const tursoUrl = process.env.VITE_TURSO_URL;
        const tursoToken = process.env.VITE_TURSO_AUTH_TOKEN;

        if (tursoUrl && tursoToken) {
          const sql = type === 'product'
            ? `SELECT name, description, image FROM products WHERE id = '${id}'`
            : `SELECT first_name || ' ' || last_name as name, gives as description, avatar as image FROM users WHERE id = '${id}'`;
          const response = await fetch(`${tursoUrl}/v1/execute`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${tursoToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              statements: [{ q: sql }],
            }),
          });

          const data = await response.json();
          const item = data?.results?.[0]?.response?.result?.rows?.[0];

          if (item) {
            // We can't easily modify the full HTML in Vercel Middleware without a re-response
            // but we can redirect to a dedicated SEO proxy or return a simplified HTML head.
            // For Vercel Edge, the best pattern is to return a custom Response with the tags.
            
            const title = `Alfietz - ${item.name || 'Heritage Craft'}`;
            const description = item.description || 'Discover authentic African heritage craftsmanship.';
            const image = item.image || 'https://alfietz.com/og-image.png';

            return new Response(
              `<!DOCTYPE html>
              <html>
                <head>
                  <title>${title}</title>
                  <meta property="og:title" content="${title}" />
                  <meta property="og:description" content="${description}" />
                  <meta property="og:image" content="${image}" />
                  <meta property="og:type" content="website" />
                  <meta name="twitter:card" content="summary_large_image" />
                  <meta name="twitter:title" content="${title}" />
                  <meta name="twitter:description" content="${description}" />
                  <meta name="twitter:image" content="${image}" />
                </head>
                <body>
                  <p>Redirecting to Alfietz Heritage...</p>
                  <script>window.location.href = '${url.href}';</script>
                </body>
              </html>`,
              {
                headers: { 'Content-Type': 'text/html' },
              }
            );
          }
        }
      } catch (e) {
        console.error('Edge Middleware Error:', e);
      }
    }
  }

  return new Response(null, {
    headers: {
      'x-middleware-next': '1',
    },
  });
}
