import { createClient } from "@libsql/client"
import * as dotenv from 'dotenv'
dotenv.config()

const client = createClient({
  url: process.env.TURSO_URL || process.env.VITE_TURSO_URL,
  authToken: process.env.TURSO_AUTH_TOKEN || process.env.VITE_TURSO_AUTH_TOKEN,
})

async function migrate() {
  console.log("Migrating database...")
  try {
    await client.execute("ALTER TABLE products ADD COLUMN variants_json TEXT")
    console.log("Added variants_json column")
  } catch (e) {
    console.log("variants_json column might already exist")
  }
  try {
    await client.execute("ALTER TABLE products ADD COLUMN gallery_json TEXT")
    console.log("Added gallery_json column")
  } catch (e) {
    console.log("gallery_json column might already exist")
  }
  try {
    await client.execute("ALTER TABLE products ADD COLUMN status TEXT DEFAULT 'In Stock'")
    console.log("Added status column")
  } catch (e) {
    console.log("status column might already exist")
  }
  console.log("Migration complete.")
}

migrate()
