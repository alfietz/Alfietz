import { createClient } from "@libsql/client"
import * as dotenv from 'dotenv'
dotenv.config()

const url = process.env.VITE_TURSO_URL
const authToken = process.env.VITE_TURSO_AUTH_TOKEN

const client = createClient({
  url: url,
  authToken: authToken,
})

async function migrate() {
  console.log("Migrating database: Adding messages table...")

  try {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender_id TEXT,
        receiver_id TEXT,
        content TEXT,
        is_read BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log("Messages table created successfully.")
  } catch (e) {
    console.error("Migration error:", e)
  }
}

migrate()
