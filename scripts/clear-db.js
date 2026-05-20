import { createClient } from "@libsql/client"
import * as dotenv from 'dotenv'
dotenv.config()

const client = createClient({
  url: process.env.TURSO_URL || process.env.VITE_TURSO_URL,
  authToken: process.env.TURSO_AUTH_TOKEN || process.env.VITE_TURSO_AUTH_TOKEN,
})

async function clear() {
  console.log("Clearing all data from African Trends Database...")

  try {
    // Drop all tables
    await client.execute("DROP TABLE IF EXISTS notifications")
    await client.execute("DROP TABLE IF EXISTS feedback")
    await client.execute("DROP TABLE IF EXISTS reviews")
    await client.execute("DROP TABLE IF EXISTS favorites")
    await client.execute("DROP TABLE IF EXISTS products")
    await client.execute("DROP TABLE IF EXISTS sellers")
    await client.execute("DROP TABLE IF EXISTS categories")
    await client.execute("DROP TABLE IF EXISTS users")

    console.log("All tables dropped.")

    // Recreate tables
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
        theme TEXT DEFAULT 'light'
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
        image TEXT,
        category_id INTEGER,
        likes_count INTEGER DEFAULT 0,
        owner_id TEXT,
        FOREIGN KEY(category_id) REFERENCES categories(id),
        FOREIGN KEY(owner_id) REFERENCES users(id)
      )
    `)

    await client.execute(`
      CREATE TABLE sellers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        specialty TEXT,
        bio TEXT,
        rating REAL,
        likes_count INTEGER DEFAULT 0,
        clients_count INTEGER DEFAULT 0,
        avatar TEXT,
        is_verified BOOLEAN DEFAULT 0
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
      CREATE TABLE reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER,
        user_id TEXT,
        rating INTEGER,
        text TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
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

    // Seed categories as they are essential for the upload work page functionality
    const categories = [
      'Ankara Essence', 'Kente Royal', 'Modern Dashiki', 'Maasai Beads',
      'Traditional Wedding', 'Heritage Headwear', 'Tribal Footwear', 'Agbada Collection',
      'Normal Clothes'
    ]
    for (const name of categories) {
      await client.execute({
        sql: "INSERT INTO categories (name, count) VALUES (?, ?)",
        args: [name, 0]
      })
    }

    console.log("Database tables recreated and categories initialized.")
    console.log("The database is now fresh and ready for new users.")

  } catch (e) {
    console.error("Error clearing database:", e)
  }
}

clear()
