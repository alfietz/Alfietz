import * as dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')

const envPath = path.resolve(projectRoot, '.env')
if (fs.existsSync(envPath)) dotenv.config({ path: envPath })

const TURSO_URL = process.env.TURSO_URL || 'https://alfie1-alfietz.aws-us-east-1.turso.io'
const AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN || process.env.VITE_TURSO_AUTH_TOKEN
const API = `${TURSO_URL}/v2/pipeline`

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
const daysAgo = (d) => {
  const dt = new Date()
  dt.setDate(dt.getDate() - d)
  dt.setHours(dt.getHours() - Math.floor(Math.random() * 24))
  dt.setMinutes(Math.floor(Math.random() * 60))
  return dt.toISOString().replace('T', ' ').split('.')[0]
}

const img = (i) => `https://images.unsplash.com/photo-${i}?q=80&w=800&auto=format`

const productImages = [
  '1598300042247-d088f8ab3a91','1544441893-675973e31985','1584917865442-de89df76afd3',
  '1523381210434-271e8be1f52b','1556905055-8f358a7a47b2','1592078615290-033ee584e267',
  '1564257631407-4deb1f99d992','1602814724293-9c3b4cb70a4b','1594727094182-75e2d67ca1f2',
  '1617125211468-f0b1e4cf6edc','1605532394755-7d5f6a49dae8','1544025162-d76694265947',
  '1601760482736-f1b6c7e2a1b4','1559582924-18d6c6dd175c','1593032465262-fef5c1217ff7',
  '1612077009705-0f8c64018cd7','1583338201644-91488cc28f17','1572635196237-14b3f281503f',
  '1604664162034-b8f8b6ad05f3','1592655166945-7323f0a4b907','1540877374424-70f18d594192',
  '1605719409877-94a0e097aba8','1597733332737-5851d0eaba37','1596809862328-b6ab4d4c40d3',
  '1606046288631-451af643baa0','1595555116478-4b526dcaae2f','1608231987411-4cf00b285cb8',
  '1591022765607-c1a72212f9d1','1595916944277-201b9d5ad19d','1603400520522-0c7befbaa65d',
  '1585740640872-250d1c32bde5','1599555944114-1a77a39df0b4',
]

const newProducts = [
  ['Ankara Statement Blazer','$129.00',1,'s_amina'],
  ['Kente Stole Wrap','$49.00',2,'s_kofi'],
  ['Dashiki Maxi Dress','$85.00',3,'s_elena'],
  ['Maasai Beaded Cuff','$28.00',4,'s_zahara'],
  ['Bridal Kente Veil','$199.00',5,'s_kofi'],
  ['Ankara Turban','$32.00',6,'s_amina'],
  ['Maasai Sandals','$48.00',7,'s_juma'],
  ['Agbada Short Set','$180.00',8,'s_moussa'],
  ['Ankara Maxi Skirt','$65.00',1,'s_elena'],
  ['Kente Bow Tie','$22.00',2,'s_kofi'],
  ['Beaded Waist Beads','$18.00',4,'s_zahara'],
  ['Ankara Face Mask Set 3','$15.00',9,'s_sara'],
  ['Embroidered Agbada Cap','$38.00',8,'s_moussa'],
  ['Kente Pocket Square','$16.00',2,'s_kofi'],
  ['Dashiki Jumpsuit','$95.00',3,'s_elena'],
  ['Handwoven Scarf','$35.00',6,'s_zahara'],
  ['Ankara Crop Top','$29.00',1,'s_amina'],
  ['Beaded Anklet','$14.00',4,'s_zahara'],
  ['Agbada Wedding Set','$350.00',8,'s_moussa'],
  ['Kente Suspenders','$24.00',2,'s_kofi'],
  ['Ankara Baseball Cap','$20.00',6,'s_kwame'],
  ['Maasai Shield Tote Bag','$42.00',4,'s_zahara'],
  ['Mudcloth Bomber Jacket','$95.00',3,'s_kwame'],
  ['Leather Bead Sandals','$58.00',7,'s_juma'],
  ['Ankara Pencil Skirt','$55.00',1,'s_elena'],
  ['Kente Vest','$65.00',2,'s_kofi'],
  ['Beaded Earrings Pair','$12.00',4,'s_zahara'],
  ['Traditional Wedding Bouquet Wrap','$44.00',5,'s_amina'],
  ['Dashiki Shorts','$38.00',3,'s_elena'],
  ['Agbada Party Robe','$220.00',8,'s_moussa'],
  ['Leather Crossbody Bag','$72.00',7,'s_juma'],
  ['Ankara Loungewear Set','$68.00',9,'s_sara'],
]

const tailors = ['s_amina','s_kofi','s_zahara','s_moussa','s_elena','s_juma','s_sara','s_kwame']
const orderItems = ['Ankara Infinity Dress','Royal Kente Blazer','Tribal Print Kaftan','Maasai Warrior Shuka','Agbada Grand Robe','Dashiki Hoodie','Kente Graduation Stole','Adire Indigo Wrap Dress','Zulu Beaded Sandals','Heritage Gold Headwrap']
const statuses = ['Pending','In Progress','Shipped','Delivered','Cancelled']
const negStatuses = ['Awaiting Reply','Accepted','Declined']
const sizes = ['S','M','L','XL','XXL']
const colors = ['Gold','Burgundy','Emerald','Indigo','Crimson']
const notesOpts = ['Please rush order','Gift wrap please','Need by next week','Custom measurements attached','']

const messages = [
  "Hi, I'm interested in this piece. Is it available?",
  'Yes it is available! Would you like to place an order?',
  'Can you customize the size? I need a different measurement.',
  "Of course! Just send me your measurements and I'll adjust it.",
  'How long does shipping usually take?',
  'Shipping takes about 5-7 business days within the continent.',
  'Do you have this in a different color?',
  'Yes, we have gold, burgundy, and emerald options available.',
  "I love the design. Can I see more photos?",
  'Sure, I can send additional photos via WhatsApp.',
  "What's your best price on this item?",
  'The price is firm for this quality, but I can offer a discount on bulk orders.',
  'Can I get this customized for a wedding?',
  "Absolutely! I specialize in wedding attire. Let's discuss your vision.",
  'How do I care for this fabric?',
  'Hand wash cold and hang to dry. Avoid direct sunlight to preserve colors.',
  'The item arrived today! Its even more beautiful in person!',
  'Thats wonderful to hear! Enjoy your heritage piece!',
  'I need a rush order. Can you deliver within 3 days?',
  'I can expedite it for an additional rush fee of $15.',
  'Do you ship internationally?',
  'Yes, we ship worldwide. International shipping takes 10-14 days.',
  'Can I return if it doesnt fit?',
  'We offer free resizing within 14 days of delivery.',
  'The fabric quality is outstanding. Thank you!',
  "You're welcome! It was my pleasure crafting it for you.",
  'Do you have matching accessories for this outfit?',
  'Yes! We have matching headwraps and jewelry to complete the look.',
  'Is the price negotiable?',
  'I can offer 10% off if you order two or more items.',
  'Can I see the fabric swatches before ordering?',
  "I'll send you a video of the fabric options on WhatsApp.",
  'Thank you for the quick response!',
  'Always happy to help! Feel free to ask any questions.',
  'The measurements are perfect! Great tailoring work.',
  "I'm glad it fits well! Wear it in good health.",
  'Shipping was faster than expected. Very impressed!',
  'We prioritize fast delivery for our customers!',
  'I want to order this as a gift. Can you gift wrap it?',
  'Yes, we offer complimentary gift wrapping with a handwritten note.',
]

const reviewTexts = [
  'Absolutely love this piece! The quality is amazing and the craftsmanship is unparalleled.',
  'Beautiful craftsmanship. Worth every cent. The attention to detail is remarkable.',
  'Fits perfectly and the colors are so vibrant! Will definitely order again.',
  'Great service and fast delivery. Highly recommend this artisan.',
  'The material feels so premium. Im impressed by the authenticity of the design.',
  'A true masterpiece of heritage fashion. I receive compliments everywhere I go.',
  'The tailor understood exactly what I wanted. The custom fit is perfect.',
  'Stunning work! The embroidery is incredibly detailed and beautiful.',
]

const notifMsgs = [
  'Your order has been shipped! Track your delivery now.',
  'New message from Kofi about your Kente Blazer.',
  'Amina has accepted your negotiation offer!',
  'Your Ankara Infinity Dress is now in production.',
  'Weekly trend alert: Ankara is trending this week!',
  'Your review was posted successfully.',
  'Moussa has replied to your Agbada inquiry.',
  'Sale alert: Up to 30% off on Ankara Collection!',
  'Your package has been delivered. Enjoy your piece!',
  'New collection drop from Elena - Modern Dashiki.',
  'Zahara shared new beadwork designs in her portfolio.',
  'Order update: Your item is being customized.',
  'Juma has new leather sandals in stock!',
  'Dont forget to leave a review for your recent purchase.',
  'Kwame just listed 3 new designer pieces.',
]

const feedbackMsgs = [
  'Love this app! Finding authentic African fashion has never been easier.',
  'The WhatsApp integration makes communication with artisans seamless.',
  'Would love to see more payment options added soon.',
  'The heritage theme is gorgeous. Really captures the essence of African fashion.',
  'Great platform for discovering talented artisans across Africa.',
  'More filtering options would be helpful for finding specific items.',
  'The ordering process was smooth and the artisan kept me updated throughout.',
  'This app connects me to my roots through fashion. Truly special.',
  'Fast delivery and excellent customer service. Highly recommend!',
  'A game-changer for African fashion lovers worldwide!',
]

let totalOk = 0

async function runSQL(sql, args = []) {
  const body = JSON.stringify({
    requests: [{
      type: "execute",
      stmt: { sql, args: args.map(a => ({ type: a === null ? "null" : typeof a === "number" ? "integer" : "text", value: a === null ? null : String(a) })) }
    }]
  })
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${AUTH_TOKEN}`, 'Content-Type': 'application/json' },
    body
  })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`HTTP ${res.status}: ${txt}`)
  }
  const json = await res.json()
  totalOk++
  return json
}

async function batchSQL(operations) {
  const chunkSize = 15
  for (let i = 0; i < operations.length; i += chunkSize) {
    const chunk = operations.slice(i, i + chunkSize)
    const requests = chunk.map(op => ({
      type: "execute",
      stmt: {
        sql: op.sql,
        args: (op.args || []).map(a => ({ type: a === null ? "null" : typeof a === "number" ? "integer" : "text", value: a === null ? null : String(a) }))
      }
    }))
    const body = JSON.stringify({ requests })
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${AUTH_TOKEN}`, 'Content-Type': 'application/json' },
      body
    })
    if (!res.ok) {
      const txt = await res.text()
      // fallback to individual
      for (const op of chunk) {
        try { await runSQL(op.sql, op.args || []) } catch (e) { console.error(`FAIL: ${e.message}`) }
      }
    } else {
      await res.json()
      totalOk += chunk.length
    }
    process.stdout.write('.')
  }
  console.log(` (${operations.length})`)
}

async function seed() {
  console.log('Seeding Turso database via HTTP API...')

  try {
    // Test & get counts
    const testRes = await runSQL("SELECT (SELECT COUNT(*) FROM products) as p, (SELECT COUNT(*) FROM orders) as o, (SELECT COUNT(*) FROM messages) as m, (SELECT COUNT(*) FROM reviews) as r, (SELECT COUNT(*) FROM notifications) as n, (SELECT COUNT(*) FROM favorites) as f, (SELECT COUNT(*) FROM feedback) as fb")
    const cnt = testRes.results?.[0]?.response?.result?.rows?.[0] || { p: '?', o: '?', m: '?' }
    console.log(`Before: P=${cnt.p} O=${cnt.o} M=${cnt.m}`)
    totalOk = 0

    // Clear
    console.log('\nClearing...')
    await runSQL('DELETE FROM orders')
    await runSQL('DELETE FROM negotiations')
    await runSQL('DELETE FROM messages')
    await runSQL('DELETE FROM reviews')
    await runSQL('DELETE FROM notifications')
    await runSQL('DELETE FROM favorites')
    await runSQL('DELETE FROM feedback')
    console.log('Cleared 7 tables')

    // ── Products ──
    console.log('\n[Products] 32...')
    const prodOps = newProducts.map((p, i) => ({
      sql: `INSERT INTO products (name, price, description, material, image, category_id, likes_count, owner_id, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [p[0], p[1], `Exquisite ${p[0]} handcrafted with premium African textiles.`, 'Premium African Textile', img(productImages[i % productImages.length]), p[2], Math.floor(Math.random() * 150), p[3], Math.random() > 0.15 ? 'In Stock' : 'Out of Stock', daysAgo(Math.floor(Math.random() * 120) + 10)]
    }))
    await batchSQL(prodOps)

    const prodRes = await runSQL('SELECT id FROM products')
    const prodRows = prodRes.results?.[0]?.response?.result?.rows || []
    const prodIds = prodRows.map(r => r[0]?.value)

    // ── Orders ──
    console.log('[Orders] 30...')
    const ordOps = []
    for (let i = 0; i < 30; i++) {
      ordOps.push({
        sql: `INSERT INTO orders (id, item_name, customer_id, tailor_id, price, status, size, color, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: ['ord_' + Math.random().toString(36).substring(2, 10), pick(orderItems), 'guest', pick(tailors), '$' + (Math.floor(Math.random() * 200) + 20) + '.00', pick(statuses), pick(sizes), pick(colors), Math.random() > 0.5 ? pick(notesOpts) : '', daysAgo(Math.floor(Math.random() * 45))]
      })
    }
    await batchSQL(ordOps)

    // ── Negotiations ──
    console.log('[Negotiations] 15...')
    const negOps = []
    for (let i = 0; i < 15; i++) {
      negOps.push({
        sql: `INSERT INTO negotiations (id, item_name, customer_id, tailor_id, proposed_price, status, size, color, notes, image, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: ['neg_' + Math.random().toString(36).substring(2, 10), pick(orderItems), 'guest', pick(tailors), '$' + (Math.floor(Math.random() * 150) + 30) + '.00', pick(negStatuses), pick(sizes), pick(colors), Math.random() > 0.4 ? pick(notesOpts) : '', img(pick(productImages)), daysAgo(Math.floor(Math.random() * 30))]
      })
    }
    await batchSQL(negOps)

    // ── Messages ──
    console.log('[Messages] ~200...')
    const msgOps = []
    for (const tailor of tailors) {
      const numMsgs = 15 + Math.floor(Math.random() * 20)
      for (let i = 0; i < numMsgs; i++) {
        const sender = i % 2 === 0 ? 'guest' : tailor
        const receiver = i % 2 === 0 ? tailor : 'guest'
        msgOps.push({
          sql: `INSERT INTO messages (sender_id, receiver_id, content, is_read, created_at) VALUES (?, ?, ?, ?, ?)`,
          args: [sender, receiver, pick(messages), sender === tailor ? 1 : 0, daysAgo(Math.min(Math.floor(i * 1.2) + Math.floor(Math.random() * 2), 60))]
        })
      }
    }
    for (let i = 0; i < 30; i++) {
      const t = pick(tailors)
      msgOps.push({
        sql: `INSERT INTO messages (sender_id, receiver_id, content, is_read, created_at) VALUES (?, ?, ?, ?, ?)`,
        args: [i % 3 === 0 ? t : 'guest', i % 3 === 0 ? 'guest' : t, pick(messages), 0, daysAgo(Math.floor(Math.random() * 30))]
      })
    }
    await batchSQL(msgOps)

    // ── Reviews ──
    console.log('[Reviews] 25...')
    const revOps = []
    for (let i = 0; i < 25; i++) {
      revOps.push({
        sql: `INSERT INTO reviews (product_id, user_id, rating, text, created_at) VALUES (?, ?, ?, ?, ?)`,
        args: [pick(prodIds), 'guest', Math.floor(Math.random() * 3) + 3, pick(reviewTexts), daysAgo(Math.floor(Math.random() * 60))]
      })
    }
    await batchSQL(revOps)

    // ── Notifications ──
    console.log('[Notifications] 50...')
    const notifOps = []
    for (let i = 0; i < 50; i++) {
      notifOps.push({
        sql: `INSERT INTO notifications (user_id, message, is_unread, type, target_id, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
        args: ['guest', pick(notifMsgs), Math.random() > 0.4 ? 1 : 0, pick(['order', 'message', 'negotiation', 'promo', null]), null, daysAgo(Math.floor(Math.random() * 30))]
      })
    }
    await batchSQL(notifOps)

    // ── Favorites ──
    console.log('[Favorites] 40...')
    const shuffled = [...prodIds].sort(() => Math.random() - 0.5)
    const favOps = []
    for (let i = 0; i < Math.min(40, shuffled.length); i++) {
      favOps.push({
        sql: 'INSERT OR IGNORE INTO favorites (user_id, product_id) VALUES (?, ?)',
        args: ['guest', shuffled[i]]
      })
    }
    await batchSQL(favOps)

    // ── Feedback ──
    console.log('[Feedback] 10...')
    const fbOps = feedbackMsgs.map(msg => ({
      sql: "INSERT INTO feedback (user_id, message, created_at) VALUES (?, ?, ?)",
      args: ['guest', msg, daysAgo(Math.floor(Math.random() * 90))]
    }))
    await batchSQL(fbOps)

    // ── Final ──
    const finalRes = await runSQL("SELECT (SELECT COUNT(*) FROM products) as p, (SELECT COUNT(*) FROM orders) as o, (SELECT COUNT(*) FROM messages) as m, (SELECT COUNT(*) FROM reviews) as r, (SELECT COUNT(*) FROM notifications) as n, (SELECT COUNT(*) FROM favorites) as f, (SELECT COUNT(*) FROM feedback) as fb")
    const f = finalRes.results?.[0]?.response?.result?.rows?.[0] || {}
    console.log('\n========================================')
    console.log('  SEED COMPLETE!')
    console.log('========================================')
    console.log(`  Products:     ${f[0]?.value || '?'}`)
    console.log(`  Orders:       ${f[1]?.value || '?'}`)
    console.log(`  Messages:     ${f[2]?.value || '?'}`)
    console.log(`  Reviews:      ${f[3]?.value || '?'}`)
    console.log(`  Notifications: ${f[4]?.value || '?'}`)
    console.log(`  Favorites:    ${f[5]?.value || '?'}`)
    console.log(`  Feedback:     ${f[6]?.value || '?'}`)
    console.log('========================================')

  } catch (e) {
    console.error('\nFatal:', e.message)
    process.exit(1)
  }
}

seed()
