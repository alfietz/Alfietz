import { createClient } from "@libsql/client"
import * as dotenv from 'dotenv'
dotenv.config()

const url = process.env.TURSO_URL || process.env.VITE_TURSO_URL
const authToken = process.env.TURSO_AUTH_TOKEN || process.env.VITE_TURSO_AUTH_TOKEN

export const db = createClient({
  url: url,
  authToken: authToken,
})

async function migrate() {
  console.log("Migrating database: Adding orders and negotiations (NO FK version)...")

  try {
    // Drop them first to be sure they are recreated without FKs
    await db.execute(`DROP TABLE IF EXISTS orders`)
    await db.execute(`DROP TABLE IF EXISTS negotiations`)

    // 1. Create orders table without FKs
    await db.execute(`
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

    // 2. Create negotiations table without FKs
    await db.execute(`
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

    console.log("Tables created successfully.")

    // 3. Update guest user
    await db.execute({
      sql: "UPDATE users SET user_type = 'supplier' WHERE id = 'guest'",
      args: []
    })

    // Add customers
    const users = [
      ['u1', 'annav', 'Anna', 'V.', 'annav@example.com', '+255711111111', 'buyer'],
      ['u2', 'blueuser', 'Blue', 'User', 'blue@example.com', '+255722222222', 'buyer'],
      ['u3', 'sarahk', 'Sarah', 'K.', 'sarahk@example.com', '+255733333333', 'buyer']
    ]

    for (const u of users) {
      await db.execute({
        sql: "INSERT OR IGNORE INTO users (id, username, first_name, last_name, email, whatsapp, user_type) VALUES (?, ?, ?, ?, ?, ?, ?)",
        args: u
      })
    }

    // Seed Orders
    const orders = [
      ['ORD-882', 'Tribe designs CAF Jersey', 'u1', 'guest', 'TSh 50,000', 'Pending', 'M', 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'],
      ['ORD-881', 'Woven Heritage Denim', 'u2', 'guest', 'TSh 120,000', 'Stitching', 'Tailored', 'https://images.unsplash.com/photo-1542272604-780c8d52a5ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80']
    ]

    for (const o of orders) {
      await db.execute({
        sql: "INSERT OR REPLACE INTO orders (id, item_name, customer_id, tailor_id, price, status, size, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        args: o
      })
    }

    // Seed Negotiations
    const negs = [
      ['NEG-01', 'Ancestral Weave Blazer', 'u3', 'guest', 'TSh 45,000', 'Awaiting Reply']
    ]

    for (const n of negs) {
      await db.execute({
        sql: "INSERT OR REPLACE INTO negotiations (id, item_name, customer_id, tailor_id, proposed_price, status) VALUES (?, ?, ?, ?, ?, ?)",
        args: n
      })
    }

    console.log("Database migrated and seeded successfully.")
  } catch (e) {
    console.error("Migration error:", e)
  }
}

migrate()
