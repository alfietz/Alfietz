import { createClient } from "@libsql/client"
import * as dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')

// Load env vars from project root
const envPath = path.resolve(projectRoot, '.env')
const envLocalPath = path.resolve(projectRoot, '.env.local')
if (fs.existsSync(envLocalPath)) dotenv.config({ path: envLocalPath })
if (fs.existsSync(envPath)) dotenv.config({ path: envPath })

const url = process.env.TURSO_URL || process.env.VITE_TURSO_URL || 'file:local.db'
const authToken = process.env.TURSO_AUTH_TOKEN || process.env.VITE_TURSO_AUTH_TOKEN

const client = createClient({
  url,
  ...(url.startsWith('file:') ? {} : { authToken }),
})

const sanitize = (val) => typeof val === 'bigint' ? val.toString() : val

const mapRows = (result) => {
  return result.rows.map(row => {
    const obj = {}
    result.columns.forEach((col, i) => { obj[col] = sanitize(row[i]) })
    return obj
  })
}

async function seed() {
  console.log("Seeding Alfietz database...")
  console.log(`Database: ${url}`)

  try {
    // ── Clear existing data ──
    await client.execute("DELETE FROM app_reviews")
    await client.execute("DELETE FROM notifications")
    await client.execute("DELETE FROM feedback")
    await client.execute("DELETE FROM reviews")
    await client.execute("DELETE FROM favorites")
    await client.execute("DELETE FROM products")
    await client.execute("DELETE FROM categories")
    await client.execute("DELETE FROM tailor_profiles")
    await client.execute("DELETE FROM login_history")
    await client.execute("DELETE FROM messages")
    await client.execute("DELETE FROM orders")
    await client.execute("DELETE FROM negotiations")
    await client.execute("DELETE FROM verification_codes")
    await client.execute("DELETE FROM session_tokens")
    await client.execute("DELETE FROM rate_limits")
    await client.execute("DELETE FROM users")

    console.log("Cleared existing data.")

    // ── Users ──
    const hashedPass = await bcrypt.hash('password123', 10)

    const defaultAvatar = (name) => `https://i.pravatar.cc/300?u=${name}&bg=2A1810`

    await client.execute({
      sql: `INSERT INTO users (id, username, first_name, last_name, email, password, whatsapp, avatar, user_type, needs, gives, theme, is_verified, profile_views)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: ['guest', 'johnabram', 'John', 'Abram', 'johnabram@gmail.com', hashedPass,
             '+255700000000', defaultAvatar('johnabram'), 'buyer', '', '', 'dark', 0, 0]
    })

    const suppliers = [
      { id: 's_amina',  username: 'amina',    firstName: 'Amina',    lastName: 'Oladipo',    email: 'amina@alfietz.shop',  specialty: 'Ankara Specialist',    bio: 'Amina is a 3rd generation tailor from Lagos, specializing in modern Ankara silhouettes that honor traditional motifs.',            rating: 4.9, is_verified: 1, profile_views: 1200 },
      { id: 's_kofi',   username: 'kofi',     firstName: 'Kofi',     lastName: 'Asante',     email: 'kofi@alfietz.shop',   specialty: 'Kente Royal Wear',     bio: 'Master weaver Kofi brings the spirit of Ashanti royalty to every garment, using hand-loomed Kente from his home village.',              rating: 4.8, is_verified: 1, profile_views: 980 },
      { id: 's_zahara', username: 'zahara',   firstName: 'Zahara',   lastName: 'Nkosi',      email: 'zahara@alfietz.shop', specialty: 'Maasai Beadwork',     bio: 'A collective of Maasai women artisans led by Zahara, preserving the ancient art of beadwork through sustainable fashion.',            rating: 5.0, is_verified: 0, profile_views: 1500 },
      { id: 's_moussa', username: 'moussa',   firstName: 'Moussa',   lastName: 'Diallo',     email: 'moussa@alfietz.shop',  specialty: 'Agbada Master',       bio: 'Moussa is renowned for his grand Agbada robes, blending silk and cotton with intricate embroidery that tells a story.',               rating: 4.7, is_verified: 1, profile_views: 850 },
      { id: 's_elena',  username: 'elena',    firstName: 'Elena',    lastName: 'Okafor',     email: 'elena@alfietz.shop',   specialty: 'Modern Dashiki',      bio: 'Elena redefines the Dashiki for the urban youth, focusing on bold colors and contemporary fits.',                                      rating: 4.5, is_verified: 0, profile_views: 600 },
      { id: 's_juma',   username: 'juma',     firstName: 'Juma',     lastName: 'Mkamba',     email: 'juma@alfietz.shop',    specialty: 'Tribal Footwear',     bio: 'Juma crafts durable, stylish leather sandals inspired by nomadic footwear from the Sahel region.',                                    rating: 4.2, is_verified: 0, profile_views: 400 },
      { id: 's_sara',   username: 'sara',     firstName: 'Sara',     lastName: 'Mensah',     email: 'sara@alfietz.shop',    specialty: 'Casual Heritage Wear', bio: 'Sara provides high-quality everyday wear with a touch of African textile influence.',                                                rating: 3.8, is_verified: 0, profile_views: 150 },
      { id: 's_kwame',  username: 'kwame',    firstName: 'Kwame',    lastName: 'Boateng',    email: 'kwame@alfietz.shop',   specialty: 'Bespoke Tailoring',   bio: 'Kwame is an emerging designer exploring bold new silhouettes with recycled African wax prints.',                                      rating: 0.0, is_verified: 0, profile_views: 50 },
    ]

    for (const s of suppliers) {
      await client.execute({
        sql: `INSERT INTO users (id, username, first_name, last_name, email, password, whatsapp, avatar, user_type, needs, gives, theme, is_verified, profile_views)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [s.id, s.username, s.firstName, s.lastName, s.email, hashedPass,
               '+2557' + Math.floor(10000000 + Math.random() * 90000000),
               defaultAvatar(s.username), 'supplier', '', s.bio, 'dark', s.is_verified, s.profile_views]
      })

      // Tailor profile with case study and services
      const defaultServices = JSON.stringify([
        { id: 1, name: "Bespoke Tailoring", price: "From $50", desc: "Custom made-to-measure garments designed specifically for your body and style." },
        { id: 2, name: "Heritage Restoration", price: "From $30", desc: "Specialized care and repair for traditional textiles like Kente, Ankara, and Maasai beadwork." },
        { id: 3, name: "Precision Fitting", price: "Hourly Rate", desc: "Hardware-level adjustments and tailoring to your existing wardrobe." }
      ])
      const defaultContacts = JSON.stringify([
        { id: 1, type: 'whatsapp', label: 'WhatsApp', value: '+2557' + Math.floor(10000000 + Math.random() * 90000000), isDefault: true },
        { id: 2, type: 'email', label: 'Email', value: s.email, isDefault: true }
      ])

      await client.execute({
        sql: `INSERT INTO tailor_profiles (user_id, quirk, case_study_title, case_study_quote, case_study_challenge, case_study_execution, case_study_result, case_study_image, services_json, contacts_json)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          s.id,
          `"Every piece I create carries a piece of my ancestors' wisdom." — ${s.firstName}`,
          `The ${s.specialty} Collection`,
          `"A masterpiece that bridges tradition and modernity."`,
          `Sourcing authentic materials while keeping costs accessible for the modern buyer.`,
          `Partnered with local weaving cooperatives to ethically source hand-loomed textiles.`,
          `A critically acclaimed collection that sold out within 48 hours of launch.`,
          `https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80`,
          defaultServices,
          defaultContacts
        ]
      })
    }

    console.log(`Created ${suppliers.length + 1} users.`)

    // ── Categories ──
    const categoryNames = [
      'Ankara Essence', 'Kente Royal', 'Modern Dashiki', 'Maasai Beads',
      'Traditional Wedding', 'Heritage Headwear', 'Tribal Footwear', 'Agbada Collection',
      'Normal Clothes'
    ]
    for (const name of categoryNames) {
      await client.execute({
        sql: "INSERT INTO categories (name, count) VALUES (?, ?)",
        args: [name, Math.floor(Math.random() * 200)]
      })
    }
    console.log(`Created ${categoryNames.length} categories.`)

    // ── Products ──
    const productImages = [
      'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?q=80&w=800&auto=format',
      'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=800&auto=format',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800&auto=format',
      'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=800&auto=format',
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=800&auto=format',
      'https://images.unsplash.com/photo-1592078615290-033ee584e267?q=80&w=800&auto=format',
      'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?q=80&w=800&auto=format',
    ]

    const products = [
      { name: 'Royal Kente Blazer',         price: '$145.00', category: 'Kente Royal',         likes: 45,  owner: 's_kofi' },
      { name: 'Ankara Infinity Dress',      price: '$95.00',  category: 'Ankara Essence',      likes: 82,  owner: 's_amina' },
      { name: 'Tribal Print Kaftan',        price: '$110.00', category: 'Modern Dashiki',      likes: 31,  owner: 's_elena' },
      { name: 'Heritage Gold Headwrap',     price: '$45.00',  category: 'Heritage Headwear',    likes: 120, owner: 's_amina' },
      { name: 'Bogolan Mudcloth Vest',      price: '$75.00',  category: 'Ankara Essence',       likes: 64,  owner: 's_kofi' },
      { name: 'Zulu Beaded Sandals',        price: '$55.00',  category: 'Tribal Footwear',      likes: 28,  owner: 's_juma' },
      { name: 'Maasai Warrior Shuka',       price: '$60.00',  category: 'Maasai Beads',         likes: 95,  owner: 's_zahara' },
      { name: 'Agbada Grand Robe',          price: '$250.00', category: 'Agbada Collection',    likes: 15,  owner: 's_moussa' },
      { name: 'Adire Indigo Wrap Dress',    price: '$80.00',  category: 'Traditional Wedding',  likes: 53,  owner: 's_elena' },
      { name: 'Kente Graduation Stole',     price: '$35.00',  category: 'Kente Royal',          likes: 210, owner: 's_kofi' },
      { name: 'Heritage Cotton T-Shirt',    price: '$25.00',  category: 'Normal Clothes',       likes: 12,  owner: 's_sara' },
      { name: 'Classic Denim Jeans',        price: '$45.00',  category: 'Normal Clothes',       likes: 8,   owner: 's_sara' },
      { name: 'Ankara Summer Dress',        price: '$35.00',  category: 'Normal Clothes',       likes: 22,  owner: 's_elena' },
      { name: 'Lightweight Bomber Jacket',  price: '$65.00',  category: 'Normal Clothes',       likes: 14,  owner: 's_kwame' },
      { name: 'Kente Silk Tie',             price: '$29.00',  category: 'Kente Royal',          likes: 67,  owner: 's_kofi' },
      { name: 'Maasai Beaded Necklace',     price: '$38.00',  category: 'Maasai Beads',         likes: 44,  owner: 's_zahara' },
      { name: 'Ankara Flip Flops',          price: '$22.00',  category: 'Tribal Footwear',      likes: 19,  owner: 's_juma' },
      { name: 'Dashiki Hoodie',             price: '$89.00',  category: 'Modern Dashiki',       likes: 73,  owner: 's_elena' },
    ]

    for (let i = 0; i < products.length; i++) {
      const p = products[i]
      const catRes = await client.execute({
        sql: "SELECT id FROM categories WHERE name = ?",
        args: [p.category]
      })
      if (catRes.rows.length === 0) {
        console.warn(`  Skipping ${p.name}: category "${p.category}" not found`)
        continue
      }
      const categoryId = sanitize(catRes.rows[0].id)
      const image = productImages[i % productImages.length]

      await client.execute({
        sql: `INSERT INTO products (name, price, description, material, image, category_id, likes_count, owner_id, status)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          p.name, p.price,
          `Exquisite ${p.name} handcrafted with premium African textiles. Each piece tells a unique story of heritage and craftsmanship.`,
          'Premium African Textile', image, categoryId, p.likes, p.owner, 'In Stock'
        ]
      })
    }
    console.log(`Created ${products.length} products.`)

    // ── Reviews ──
    const reviewTexts = [
      "Absolutely love this piece! The quality is amazing and the craftsmanship is unparalleled.",
      "Beautiful craftsmanship. Worth every cent. The attention to detail is remarkable.",
      "Fits perfectly and the colors are so vibrant! Will definitely order again.",
      "Great service and fast delivery. Highly recommend this artisan.",
      "The material feels so premium. I'm impressed by the authenticity of the design.",
      "A true masterpiece of heritage fashion. I receive compliments everywhere I go.",
      "The tailor understood exactly what I wanted. The custom fit is perfect.",
    ]
    const allProds = await client.execute("SELECT id FROM products")
    for (let i = 0; i < Math.min(allProds.rows.length, 8); i++) {
      const productId = sanitize(allProds.rows[i].id)
      const rating = 4 + Math.floor(Math.random() * 2)
      const text = reviewTexts[Math.floor(Math.random() * reviewTexts.length)]
      await client.execute({
        sql: "INSERT INTO reviews (product_id, user_id, rating, text) VALUES (?, ?, ?, ?)",
        args: [productId, 'guest', rating, text]
      })
    }
    console.log("Created reviews.")

    // ── App Reviews ──
    const appReviewTexts = [
      "This app makes it so easy to find authentic heritage pieces! The connection with artisans is seamless.",
      "The interface is beautiful and intuitive. Love the wood theme and the heritage aesthetic.",
      "Great platform for connecting with skilled artisans directly without middlemen.",
      "Alfie is the future of African fashion digital marketplaces! So proud to be part of this community.",
      "The WhatsApp integration makes ordering so convenient. I've already placed three orders!"
    ]
    for (const text of appReviewTexts) {
      await client.execute({
        sql: "INSERT INTO app_reviews (user_id, rating, text) VALUES (?, ?, ?)",
        args: ['guest', 5, text]
      })
    }
    console.log("Created app reviews.")

    // ── Notifications ──
    const notifications = [
      'A master tailor is ready for your Maasai Beads order',
      'New Kente Royal collection just dropped!',
      'Your Ankara Infinity Dress has been shipped',
      '✨ New trend: Agbada Grand Robe is trending this week',
      'Kofi Designs has responded to your inquiry'
    ]
    for (const msg of notifications) {
      await client.execute({
        sql: "INSERT INTO notifications (user_id, message) VALUES (?, ?)",
        args: ['guest', msg]
      })
    }
    console.log("Created notifications.")

    // ── Favorites ──
    const favProds = await client.execute("SELECT id FROM products ORDER BY likes_count DESC LIMIT 3")
    for (const row of favProds.rows) {
      await client.execute({
        sql: "INSERT OR IGNORE INTO favorites (user_id, product_id) VALUES (?, ?)",
        args: ['guest', sanitize(row.id)]
      })
    }
    console.log("Created favorites.")

    console.log("\n✓ Database seeded successfully!")
    console.log("  Login: johnabram@gmail.com / password123")
    console.log("  Supplier logins (any): e.g. amina@alfietz.shop / password123")

  } catch (e) {
    console.error("Error seeding database:", e)
    process.exit(1)
  }
}

seed()
