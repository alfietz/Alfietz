import Hashids from 'hashids';

const hashids = new Hashids('alfietz-product-hash', 4);
const decodeId = (hash) => { const d = hashids.decode(String(hash)); return d.length > 0 ? d[0] : null; };

export const config = {
  matcher: ['/product/:productId*', '/tailor/:tailorId*', '/@:username'],
};

export default async function middleware(req) {
  const url = new URL(req.url);
  const userAgent = req.headers.get('user-agent') || '';
  const isBot = /WhatsApp|facebookexternalhit|facebot|Twitterbot|LinkedInBot|Pinterest|Slackbot|TelegramBot|Discordbot|Googlebot|Bingbot|Baiduspider|YandexBot|DuckDuckBot|Slurp|Applebot/i.test(userAgent);

  if (isBot) {
    const pathParts = url.pathname.split('/');
    let type = pathParts[1];
    let id = pathParts[2];

    if (type.startsWith('@')) {
      id = type.substring(1);
      type = 'tailor-by-username';
    }

    if (id || type === 'tailor-by-username') {
      let tursoUrl = process.env.TURSO_URL || '';
      const tursoToken = process.env.TURSO_AUTH_TOKEN;

      if (tursoUrl.startsWith('libsql://')) {
        tursoUrl = 'https://' + tursoUrl.slice(9);
      }

      if (!tursoUrl || !tursoToken) {
        return new Response(null, { headers: { 'x-middleware-next': '1' } });
      }

      try {
        let sql = '';
        if (type === 'product') {
          const decoded = decodeId(id);
          sql = 'SELECT name, description, image, price, status FROM products WHERE id = ' + (Number(decoded ?? id) || 0);
        } else if (type === 'tailor') {
          sql = "SELECT first_name || ' ' || last_name as name, gives as description, avatar as image FROM users WHERE id = " + (Number(id) || 0);
        } else if (type === 'tailor-by-username') {
          sql = "SELECT first_name || ' ' || last_name as name, gives as description, avatar as image FROM users WHERE username = '" + id.replace(/'/g, "''") + "'";
        }

        const apiUrl = `${tursoUrl.replace(/\/$/, '')}/v1/execute`;
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${tursoToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ stmt: { sql } }),
        });

        if (!response.ok) {
          return new Response(null, { headers: { 'x-middleware-next': '1' } });
        }

        const data = await response.json();
        const cols = data?.result?.cols || [];
        const rows = data?.result?.rows || [];
        const row = rows[0] || [];

        if (row.length) {
          const item = Object.fromEntries(cols.map((c, i) => [c.name, row[i]?.value ?? '']));

          const title = `Alfietz - ${item.name || 'Heritage Craft'}`;
          const description = item.description || 'Discover authentic African heritage craftsmanship.';
          const image = item.image || 'https://alfietz.shop/og-image.png';
          const ogType = type === 'product' ? 'product' : 'website';
          const priceTags = type === 'product' && item.price
            ? `\n                  <meta property="product:price:amount" content="${item.price}" />\n                  <meta property="product:price:currency" content="TZS" />`
            : '';

          return new Response(
            `<!DOCTYPE html>
            <html>
              <head>
                 <title>${title}</title>
                <meta name="description" content="${description}" />
                <meta property="og:title" content="${title}" />
                <meta property="og:description" content="${description}" />
                <meta property="og:image" content="${image}" />
                <meta property="og:url" content="${url.href}" />
                <meta property="og:type" content="${ogType}" />${priceTags}
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
              headers: {
                'Content-Type': 'text/html',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
              },
            }
          );
        }
      } catch (e) {
        console.error('Edge Middleware Error:', e);
      }
    }
  }

  return new Response(null, {
    headers: { 'x-middleware-next': '1' },
  });
}
