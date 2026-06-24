import { createClient } from "@libsql/client"
import * as dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
dotenv.config()

const client = createClient({
  url: process.env.TURSO_URL || process.env.VITE_TURSO_URL,
  authToken: process.env.TURSO_AUTH_TOKEN || process.env.VITE_TURSO_AUTH_TOKEN,
})

async function init() {
  console.log("Initializing Turso Database for Alfietz...")

  try {
    // 1. Drop existing tables in correct order (respecting foreign keys)
    await client.execute("DROP TABLE IF EXISTS app_reviews")
    await client.execute("DROP TABLE IF EXISTS notifications")
    await client.execute("DROP TABLE IF EXISTS feedback")
    await client.execute("DROP TABLE IF EXISTS reviews")
    await client.execute("DROP TABLE IF EXISTS favorites")
    await client.execute("DROP TABLE IF EXISTS products")
    await client.execute("DROP TABLE IF EXISTS categories")
    await client.execute("DROP TABLE IF EXISTS users")
    await client.execute("DROP TABLE IF EXISTS messages")
    await client.execute("DROP TABLE IF EXISTS orders")
    await client.execute("DROP TABLE IF EXISTS negotiations")
    await client.execute("DROP TABLE IF EXISTS rate_limits")
    await client.execute("DROP TABLE IF EXISTS tailor_profiles")
    await client.execute("DROP TABLE IF EXISTS login_history")
    await client.execute("DROP TABLE IF EXISTS session_tokens")
    await client.execute("DROP TABLE IF EXISTS verification_codes")

    // 2. Create tables
    await client.execute(`
      CREATE TABLE users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE,
        first_name TEXT,
        last_name TEXT,
        email TEXT UNIQUE,
        password TEXT,
        whatsapp TEXT,
        avatar TEXT,
        user_type TEXT DEFAULT 'buyer',
        needs TEXT,
        gives TEXT,
        theme TEXT DEFAULT 'light',
        profile_views INTEGER DEFAULT 0,
        is_verified BOOLEAN DEFAULT 0,
        last_city TEXT,
        last_country TEXT,
        last_lat TEXT,
        last_long TEXT
      )
    `)

    await client.execute(`
      CREATE TABLE categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE,
        count INTEGER DEFAULT 0
      )
    `)

    await client.execute(`
      CREATE TABLE products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        price TEXT,
        description TEXT,
        material TEXT,
        image TEXT,
        category_id INTEGER,
        likes_count INTEGER DEFAULT 0,
        owner_id TEXT,
        status TEXT DEFAULT 'In Stock',
        variants_json TEXT,
        gallery_json TEXT,
        created_at DATETIME,
        FOREIGN KEY(category_id) REFERENCES categories(id),
        FOREIGN KEY(owner_id) REFERENCES users(id)
      )
    `)

    await client.execute(`
      CREATE TABLE favorites (
        user_id TEXT,
        product_id INTEGER,
        PRIMARY KEY (user_id, product_id),
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(product_id) REFERENCES products(id)
      )
    `)

    await client.execute(`
      CREATE TABLE feedback (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        message TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )
    `)

    await client.execute(`
      CREATE TABLE app_reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        rating INTEGER,
        text TEXT,
        image TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )
    `)

    await client.execute(`
      CREATE TABLE reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER,
        user_id TEXT,
        rating INTEGER,
        text TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        image TEXT,
        FOREIGN KEY(product_id) REFERENCES products(id),
        FOREIGN KEY(user_id) REFERENCES users(id)
      )
    `)

    await client.execute(`
      CREATE TABLE notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        message TEXT,
        is_unread BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )
    `)

    await client.execute(`
      CREATE TABLE messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender_id TEXT,
        receiver_id TEXT,
        content TEXT,
        is_read BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await client.execute(`
      CREATE TABLE orders (
        id TEXT PRIMARY KEY,
        item_name TEXT,
        customer_id TEXT,
        tailor_id TEXT,
        price TEXT,
        status TEXT DEFAULT 'Pending',
        size TEXT,
        color TEXT,
        notes TEXT,
        image TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await client.execute(`
      CREATE TABLE negotiations (
        id TEXT PRIMARY KEY,
        item_name TEXT,
        customer_id TEXT,
        tailor_id TEXT,
        proposed_price TEXT,
        status TEXT DEFAULT 'Awaiting Reply',
        size TEXT,
        color TEXT,
        notes TEXT,
        image TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await client.execute(`
      CREATE TABLE rate_limits (
        key TEXT PRIMARY KEY,
        count INTEGER DEFAULT 0,
        expires_at INTEGER
      )
    `)

    await client.execute(`
      CREATE TABLE tailor_profiles (
        user_id TEXT PRIMARY KEY,
        quirk TEXT,
        case_study_title TEXT,
        case_study_quote TEXT,
        case_study_challenge TEXT,
        case_study_execution TEXT,
        case_study_result TEXT,
        case_study_image TEXT,
        services_json TEXT,
        contacts_json TEXT
      )
    `)

    await client.execute(`
      CREATE TABLE login_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        ip_address TEXT,
        user_agent TEXT,
        device_name TEXT,
        city TEXT,
        region TEXT,
        country TEXT,
        latitude TEXT,
        longitude TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await client.execute(`
      CREATE TABLE session_tokens (
        token TEXT PRIMARY KEY,
        user_id TEXT,
        expires_at INTEGER
      )
    `)

    await client.execute(`
      CREATE TABLE verification_codes (
        email TEXT PRIMARY KEY,
        code TEXT,
        expires_at INTEGER
      )
    `)

    console.log("Tables created successfully.")

    // 3. Insert Default Guest User with Hashed Password
    const hashedPassword = await bcrypt.hash('password123', 10)
    await client.execute({
      sql: `INSERT INTO users (id, username, first_name, last_name, email, password, whatsapp, avatar, user_type, theme, is_verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: ['guest', 'johnabram', 'John', 'Abram', 'johnabram@gmail.com', hashedPassword, '+255700000000', 'https://i.pravatar.cc/150?u=johnabram', 'buyer', 'dark', 0]
    })

    // 4. Seed Initial Notifications
    const initialNotifications = [
      'A master tailor is ready for your Maasai Beads order',
      'New Kente Royal collection just dropped!',
      'Your Ankara Infinity Dress has been shipped'
    ]
    for (const msg of initialNotifications) {
      await client.execute({
        sql: "INSERT INTO notifications (user_id, message) VALUES (?, ?)",
        args: ['guest', msg]
      })
    }

    // 5. Seed initial categories
    const categories = [
      'Ankara Essence', 'Kente Royal', 'Modern Dashiki', 'Maasai Beads',
      'Traditional Wedding', 'Heritage Headwear', 'Tribal Footwear', 'Agbada Collection',
      'Normal Clothes'
    ]
    for (const name of categories) {
      await client.execute({
        sql: "INSERT INTO categories (name, count) VALUES (?, ?)",
        args: [name, Math.floor(Math.random() * 200)]
      })
    }

    // 6. Seed initial products
    const products = [
      { name: 'Royal Kente Blazer', price: '$145.00', category: 'Kente Royal', likes: 45 },
      { name: 'Ankara Infinity Dress', price: '$95.00', category: 'Ankara Essence', likes: 82 },
      { name: 'Tribal Print Kaftan', price: '$110.00', category: 'Modern Dashiki', likes: 31 },
      { name: 'Heritage Gold Headwrap', price: '$45.00', category: 'Heritage Headwear', likes: 120 },
      { name: 'Bogolan Mudcloth Vest', price: '$75.00', category: 'Ankara Essence', likes: 64 },
      { name: 'Zulu Beaded Sandals', price: '$55.00', category: 'Tribal Footwear', likes: 28 },
      { name: 'Maasai Warrior Shuka', price: '$60.00', category: 'Maasai Beads', likes: 95 },
      { name: 'Agbada Grand Robe', price: '$250.00', category: 'Agbada Collection', likes: 15 },
      { name: 'Adire Indigo Wrap', price: '$80.00', category: 'Traditional Wedding', likes: 53 },
      { name: 'Kente Graduation Stole', price: '$35.00', category: 'Kente Royal', likes: 210 },
      { name: 'Heritage Cotton T-Shirt', price: '$25.00', category: 'Normal Clothes', likes: 12 },
      { name: 'Classic Denim Jeans', price: '$45.00', category: 'Normal Clothes', likes: 8 },
      { name: 'Casual Summer Dress', price: '$35.00', category: 'Normal Clothes', likes: 22 },
      { name: 'Lightweight Bomber Jacket', price: '$65.00', category: 'Normal Clothes', likes: 14 }
    ]

    for (const p of products) {
      const cat = await client.execute({
        sql: "SELECT id FROM categories WHERE name = ?",
        args: [p.category]
      })
      await client.execute({
        sql: `INSERT INTO products (name, price, description, image, category_id, likes_count, owner_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
        args: [
          p.name,
          p.price,
          `Exquisite ${p.name} handcrafted with premium African textiles.`,
          'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?q=80&w=800',
          cat.rows[0].id,
          p.likes,
          'guest'
        ]
      })
    }

    // 7. Seed initial reviews
    const allProductsRes = await client.execute("SELECT id FROM products LIMIT 5")
    const reviewTexts = [
      "Absolutely love this piece! The quality is amazing.",
      "Beautiful craftsmanship. Worth every cent.",
      "Fits perfectly and the colors are so vibrant!",
      "Great service and fast delivery. Highly recommend.",
      "The material feels so premium. I'm impressed."
    ]
    for (const p of allProductsRes.rows) {
      await client.execute({
        sql: "INSERT INTO reviews (product_id, user_id, rating, text) VALUES (?, ?, ?, ?)",
        args: [p.id, 'guest', 4 + Math.floor(Math.random() * 2), reviewTexts[Math.floor(Math.random() * reviewTexts.length)]]
      })
    }

    // 8. Seed initial app reviews
    const appReviewTexts = [
      "This app makes it so easy to find authentic heritage pieces!",
      "The interface is beautiful and intuitive. Love the wood theme.",
      "Great platform for connecting with skilled artisans directly.",
      "Alfie is the future of African fashion digital marketplaces!"
    ]
    for (const text of appReviewTexts) {
      await client.execute({
        sql: "INSERT INTO app_reviews (user_id, rating, text) VALUES (?, ?, ?)",
        args: ['guest', 5, text]
      })
    }

    console.log("Database seeded successfully.")

  } catch (e) {
    console.error("Error initializing database:", e)
  }
}

init()