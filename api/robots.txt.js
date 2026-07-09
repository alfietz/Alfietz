export default function handler(req, res) {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=3600');

  const robots = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /chats
Disallow: /chat/
Disallow: /negotiations
Disallow: /orders
Disallow: /tailor-console
Disallow: /edit-profile
Disallow: /settings

Sitemap: https://alfietz.shop/api/sitemap.xml
`;

  res.status(200).send(robots);
}
