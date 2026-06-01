import { createClient } from "@libsql/client"
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const client = createClient({
  url: process.env.TURSO_URL || process.env.VITE_TURSO_URL,
  authToken: process.env.TURSO_AUTH_TOKEN || process.env.VITE_TURSO_AUTH_TOKEN,
})

async function migrate() {
  console.log("Migrating database: Adding contacts_json to tailor_profiles...")
  try {
    await client.execute("ALTER TABLE tailor_profiles ADD COLUMN contacts_json TEXT")
    console.log("Added contacts_json column successfully.")
  } catch (e) {
    console.error("Failed to add contacts_json column (might already exist):", e.message)
  }
  process.exit(0)
}

migrate()
