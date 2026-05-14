/**
 * SECURE DATABASE CLIENT
 * This client proxies all database requests to /api/db to hide
 * the Turso URL and Auth Token from the frontend.
 */

export const db = {
  /**
   * Proxies the execute command to the serverless backend.
   * Supports both db.execute(string) and db.execute({ sql, args })
   */
  execute: async (query) => {
    let sql, args;

    if (typeof query === 'string') {
      sql = query;
      args = [];
    } else {
      sql = query.sql;
      args = query.args || [];
    }

    try {
      const response = await fetch('/api/db', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sql, args }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server responded with ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Database Proxy Client Error:', error);
      // Return empty structure to prevent app crashes if server is down
      return { rows: [] };
    }
  },

  // Mock batch for now if needed (though not used in current codebase)
  batch: async () => {
    console.warn("Batch operations are not yet implemented in proxy mode.");
    return [];
  },

  close: () => {}
};

// For compatibility with existing components
export const isDbConnected = true;
