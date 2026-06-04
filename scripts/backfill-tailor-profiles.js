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

const defaultContacts = (whatsapp, email) => JSON.stringify([
  { id: 1, type: 'whatsapp', label: 'WhatsApp', value: whatsapp || '', isDefault: true },
  { id: 2, type: 'email', label: 'Email', value: email || '', isDefault: true },
  { id: 3, type: 'phone', label: 'Phone', value: whatsapp || '', isDefault: true }
]);

const defaultServices = JSON.stringify([
  { id: 1, name: "Bespoke Tailoring", price: "From $50", desc: "Custom made-to-measure garments designed specifically for your body and style." },
  { id: 2, name: "Heritage Restoration", price: "From $30", desc: "Specialized care and repair for traditional textiles like Kente, Ankara, and Maasai beadwork." },
  { id: 3, name: "Precision Fitting", price: "Hourly Rate", desc: "Hardware-level adjustments and tailoring to your existing wardrobe." }
]);

async function backfill() {
  console.log("Starting backfill for existing sellers...")
  try {
    // Get all suppliers
    const suppliers = await client.execute("SELECT id, whatsapp, email FROM users WHERE user_type = 'supplier'");
    console.log(`Found ${suppliers.rows.length} suppliers in total.`);

    for (const row of suppliers.rows) {
      const userId = row.id;
      const whatsapp = row.whatsapp;
      const email = row.email;

      // Check if profile exists
      const profile = await client.execute({
        sql: "SELECT user_id FROM tailor_profiles WHERE user_id = ?",
        args: [userId]
      });

      if (profile.rows.length === 0) {
        console.log(`Backfilling profile for user: ${userId}`);
        await client.execute({
          sql: `
            INSERT INTO tailor_profiles (
              user_id, quirk, case_study_title, case_study_quote, case_study_challenge, 
              case_study_execution, case_study_result, case_study_image, services_json, contacts_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          args: [
            userId,
            "I believe every stitch tells a story of where we've been and where we're going.",
            "The Urban Heritage Silhouette",
            "I needed a look that commands respect, but breathes with my heritage.",
            "Designing a formal piece that maintains structure while using traditional hand-loomed textiles.",
            "We sourced organic, high-thread-count materials and used deconstructed techniques.",
            "A perfectly tailored garment that won 'Best Heritage Piece'.",
            "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80",
            defaultServices,
            defaultContacts(whatsapp, email)
          ]
        });
      } else {
        console.log(`Profile already exists for user: ${userId}`);
      }
    }
    console.log("Backfill complete.");
  } catch (e) {
    console.error("Backfill failed:", e);
  }
  process.exit(0);
}

backfill();
