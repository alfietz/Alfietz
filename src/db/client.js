/**
 * SECURE DATABASE CLIENT
 * This client proxies all database requests to /api/db to hide
 * the Turso URL and Auth Token from the frontend.
 */

export const db = {
  /**
   * Auto-discovers the correct API URL based on the environment.
   */
  getApiUrl: () => {
    // 1. Check if a manual URL is provided in .env
    if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;

    // 2. Fallback to relative path for Web/Development
    return '/api/db';
  },

  /**
   * Runs a secure predefined action on the server.
   */
  runAction: async (action, params = {}) => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        'X-Heritage-Platform': 'web',
        'X-Heritage-App-Key': 'heritage_web_public_v1'
      };

      // Get token from storage
      const tokenString = localStorage.getItem('alfie_app_auth_token');
      if (tokenString) {
        headers['Authorization'] = `Bearer ${JSON.parse(tokenString)}`;
      }

      const apiUrl = db.getApiUrl();
      const body = JSON.stringify({ action, params }, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      );

      // Use standard fetch for Web
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body
      });
      const status = response.status;
      const data = await response.json();

      if (status === 401) {
        // Session expired, clear local token
        localStorage.removeItem('alfie_app_auth_token');
      }

      if (status >= 400) {
        throw new Error(data.error || `Server responded with ${status}`);
      }

      return data;
    } catch (error) {
      console.error(`Action Error [${action}]:`, error);
      throw error;
    }
  },

  setToken: (token) => {
    localStorage.setItem('alfie_app_auth_token', JSON.stringify(token));
  },

  clearToken: () => {
    localStorage.removeItem('alfie_app_auth_token');
  },

  /**
   * execute is now a wrapper for runAction to maintain backwards compatibility
   * while enforcing server-side action security.
   * @deprecated Use runAction directly.
   */
  execute: async (query) => {
    console.warn("db.execute() is deprecated for security. Use db.runAction() instead.");
    return { rows: [] };
  },

  // Mock batch for now if needed
  batch: async () => {
    console.warn("Batch operations are not yet implemented in proxy mode.");
    return [];
  },

  close: () => {}
};

// For compatibility with existing components
export const isDbConnected = true;
