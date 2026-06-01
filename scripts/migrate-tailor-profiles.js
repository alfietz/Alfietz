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
  console.log("Migrating database: Creating tailor_profiles table...")
  try {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS tailor_profiles (
        user_id TEXT PRIMARY KEY,
        quirk TEXT,
        case_study_title TEXT,
        case_study_quote TEXT,
        case_study_challenge TEXT,
        case_study_execution TEXT,
        case_study_result TEXT,
        case_study_image TEXT,
        services_json TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `)
    console.log("Created tailor_profiles table successfully.")
  } catch (e) {
    console.error("Failed to create tailor_profiles table:", e)
  }
  console.log("Migration complete.")
}

migrate()