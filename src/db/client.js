import { createClient } from "@libsql/client"

const url = import.meta.env.VITE_TURSO_URL
const authToken = import.meta.env.VITE_TURSO_AUTH_TOKEN

if (!url || !authToken) {
  console.error("Turso URL or Auth Token is missing in .env")
}

export const db = createClient({
  url: url,
  authToken: authToken,
})
