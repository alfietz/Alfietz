/**
 * SECURE DATABASE CLIENT
 * This client proxies all database requests to /api/db to hide
 * the Turso URL and Auth Token from the frontend.
 */

import { Capacitor, CapacitorHttp } from '@capacitor/core';

export const db = {
  /**
   * Auto-discovers the correct API URL based on the environment.
   */
  getApiUrl: () => {
    // 1. Check if a manual URL is provided in .env
    if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;

    // 2. If running as a Native App (Android/APK), use the production URL
    if (Capacitor.isNativePlatform()) {
      const url = 'https://alfie.vercel.app/api/db'; 
      // alert(`Native API URL: ${url}`); // Temporary debug alert
      return url;
    }

    // 3. Fallback to relative path for Web/Development
    return '/api/db';
  },

  /**
   * Runs a secure predefined action on the server.
   */
  runAction: async (action, params = {}) => {
    try {
      const isNative = Capacitor.isNativePlatform();
      const headers = {
        'Content-Type': 'application/json',
        'X-Heritage-Platform': isNative ? 'android' : 'web',
        'X-Heritage-App-Key': isNative 
          ? (import.meta.env.VITE_ANDROID_APP_KEY || 'heritage_android_secure_v1')
          : 'heritage_web_public_v1'
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

      let data;
      let status;

      // Use CapacitorHttp for Native to bypass CORS and improve reliability
      if (isNative) {
        console.log(`[NativeRequest] Calling: ${apiUrl} for action: ${action}`);
        const response = await CapacitorHttp.post({
          url: apiUrl, // CapacitorHttp uses lowercase 'url'
          headers,
          data: JSON.parse(body)
        });
        data = response.data;
        status = response.status;
        console.log(`[NativeRequest] Status: ${status}`);
      } else {
        // Use standard fetch for Web
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers,
          body
        });
        status = response.status;
        data = await response.json();
      }

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
