import { createClient } from "@libsql/client"

const url = import.meta.env.VITE_TURSO_URL
const authToken = import.meta.env.VITE_TURSO_AUTH_TOKEN

const isConfigured = url && authToken

if (!isConfigured) {
  console.warn("Turso URL or Auth Token is missing in .env. App will run in offline/demo mode with limited functionality.")
}

const createDbProxy = () => {
  if (isConfigured) {
    try {
      return createClient({
        url: url,
        authToken: authToken,
      })
    } catch (e) {
      console.error("Failed to initialize Turso client:", e)
    }
  }

  // Fallback mock client to prevent crashes
  return {
    execute: async () => {
      console.warn("Database is not connected. This is a mock response.")
      return { rows: [] }
    },
    batch: async () => {
      console.warn("Database is not connected. This is a mock response.")
      return []
    },
    close: () => {}
  }
}

export const db = createDbProxy()
export const isDbConnected = isConfigured

