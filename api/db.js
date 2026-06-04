import { createClient } from "@libsql/client";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { Resend } from 'resend';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const envPath = path.resolve(process.cwd(), '.env');
const envLocalPath = path.resolve(process.cwd(), '.env.local');

dotenv.config({ path: envLocalPath });
dotenv.config({ path: envPath });

// Log for debugging (only names, not values)
if (process.env.NODE_ENV === 'development') {
  console.log('Environment loaded:', {
    hasTursoUrl: !!(process.env.TURSO_URL || process.env.VITE_TURSO_URL),
    hasResendKey: !!process.env.RESEND_API_KEY
  });
}

const sanitize = (val) => typeof val === 'bigint' ? val.toString() : val;

async function checkRateLimit(client, key, limit, windowSeconds) {
  const now = Math.floor(Date.now() / 1000);
  
  // Clean up expired entries for this key
  await client.execute({
    sql: "DELETE FROM rate_limits WHERE expires_at < ?",
    args: [now]
  });

  const res = await client.execute({
    sql: "SELECT count, expires_at FROM rate_limits WHERE key = ?",
    args: [key]
  });

  if (res.rows.length > 0) {
    const row = res.rows[0];
    const count = parseInt(sanitize(row[0]));
    const expiresAt = parseInt(sanitize(row[1]));

    if (count >= limit) {
      return { allowed: false, remaining: 0, reset: expiresAt - now };
    }

    await client.execute({
      sql: "UPDATE rate_limits SET count = count + 1 WHERE key = ?",
      args: [key]
    });
    return { allowed: true, remaining: limit - (count + 1) };
  } else {
    await client.execute({
      sql: "INSERT INTO rate_limits (key, count, expires_at) VALUES (?, 1, ?)",
      args: [key, now + windowSeconds]
    });
    return { allowed: true, remaining: limit - 1 };
  }
}

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, X-Heritage-Platform, X-Heritage-App-Key'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Platform Verification (Independence & Security)
  const platform = req.headers['x-heritage-platform'] || 'unknown';
  const appKey = req.headers['x-heritage-app-key'] || 'none';

  // In production, these should be set via process.env for maximum security
  const VALID_ANDROID_KEY = process.env.ANDROID_APP_KEY || 'heritage_android_secure_v1';
  const VALID_WEB_KEY = process.env.WEB_APP_KEY || 'heritage_web_public_v1';

  let isVerified = false;
  if (platform === 'android' && appKey === VALID_ANDROID_KEY) isVerified = true;
  if (platform === 'web' && appKey === VALID_WEB_KEY) isVerified = true;

  // Reject unauthorized platforms or keys
  if (!isVerified) {
    console.error(`[Security] Unauthorized access attempt: Platform=${platform}, Key=${appKey}`);
    return res.status(403).json({ error: 'Unauthorized Platform: Heritage access denied.' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const url = process.env.TURSO_URL || process.env.VITE_TURSO_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN || process.env.VITE_TURSO_AUTH_TOKEN;
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!url || !authToken) {
    return res.status(500).json({ error: 'Database configuration missing' });
  }

  const { action, params = {} } = req.body || {};

  if (!action) {
    return res.status(400).json({ error: 'Action is required. Raw SQL is disabled for security.' });
  }

  try {
    const startTime = Date.now();
    const client = createClient({ url, authToken });
    const resend = resendApiKey ? new Resend(resendApiKey) : null;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';

    // Auto-migrate: Ensure required tables exist
    await client.execute("CREATE TABLE IF NOT EXISTS rate_limits (key TEXT PRIMARY KEY, count INTEGER, expires_at INTEGER)");
    await client.execute("CREATE TABLE IF NOT EXISTS verification_codes (email TEXT PRIMARY KEY, code TEXT, expires_at INTEGER)");
    await client.execute("CREATE TABLE IF NOT EXISTS session_tokens (token TEXT PRIMARY KEY, user_id TEXT, expires_at INTEGER)");

    // Add missing columns if they don't exist
    await client.execute("ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT 0").catch(() => {});
    await client.execute("ALTER TABLE reviews ADD COLUMN image TEXT").catch(() => {});

    // Token Validation for Protected Actions
    const publicActions = ['login', 'signup', 'request_password_reset', 'verify_reset_code', 'reset_password', 'get_initial_data', 'search', 'get_product_details', 'get_tailor_details', 'get_reviews', 'get_similar_products'];
    let currentUserId = 'guest';

    if (!publicActions.includes(action)) {
      const authHeader = req.headers['authorization'];
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required for this action.' });
      }

      const token = authHeader.split(' ')[1];
      const sessionRes = await client.execute({
        sql: "SELECT user_id, expires_at FROM session_tokens WHERE token = ?",
        args: [token]
      });

      if (sessionRes.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid or expired session.' });
      }

      const session = sessionRes.rows[0];
      const now = Math.floor(Date.now() / 1000);
      if (parseInt(sanitize(session[1])) < now) {
        await client.execute({ sql: "DELETE FROM session_tokens WHERE token = ?", args: [token] });
        return res.status(401).json({ error: 'Session expired. Please log in again.' });
      }

      currentUserId = sanitize(session[0]);
      // Ensure the params.userId matches the token's user_id if provided
      if (params.userId && params.userId !== currentUserId) {
        return res.status(403).json({ error: 'Unauthorized access to this user data.' });
      }
    }

    // Global Rate Limit: 100 requests per minute per IP
    const globalLimit = await checkRateLimit(client, `global:${ip}`, 100, 60);
    if (!globalLimit.allowed) {
      return res.status(429).json({ error: `Too many requests. Please try again in ${globalLimit.reset} seconds.` });
    }

    const mapRows = (result) => {
      return result.rows.map(row => {
        const obj = {};
        result.columns.forEach((col, i) => { obj[col] = sanitize(row[i]); });
        return obj;
      });
    };

    const initializeTailorProfile = async (userId, userWhatsapp, userEmail) => {
      const defaultContacts = JSON.stringify([
        { id: 1, type: 'whatsapp', label: 'WhatsApp', value: userWhatsapp || '', isDefault: true },
        { id: 2, type: 'email', label: 'Email', value: userEmail || '', isDefault: true },
        { id: 3, type: 'phone', label: 'Phone', value: userWhatsapp || '', isDefault: true }
      ]);
      const defaultServices = JSON.stringify([
        { id: 1, name: "Bespoke Tailoring", price: "From $50", desc: "Custom made-to-measure garments designed specifically for your body and style." },
        { id: 2, name: "Heritage Restoration", price: "From $30", desc: "Specialized care and repair for traditional textiles like Kente, Ankara, and Maasai beadwork." },
        { id: 3, name: "Precision Fitting", price: "Hourly Rate", desc: "Hardware-level adjustments and tailoring to your existing wardrobe." }
      ]);

      await client.execute({
        sql: `
          INSERT OR IGNORE INTO tailor_profiles (
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
          defaultContacts
        ]
      });
    };

    let sql = '';
    let args = [];
    let customResponse = null;

    switch (action) {
      case 'get_initial_data':
        const userId = params.userId || 'guest';
        const [cats, trending, all, appReviews, suppliers] = await Promise.all([
          client.execute("SELECT * FROM categories"),
          client.execute("SELECT p.*, c.name as categoryName FROM products p LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.likes_count DESC LIMIT 4"),
          client.execute("SELECT p.*, c.name as categoryName FROM products p LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.id DESC LIMIT 50"),
          client.execute("SELECT r.*, u.first_name, u.last_name, u.avatar FROM app_reviews r JOIN users u ON r.user_id = u.id ORDER BY r.created_at DESC LIMIT 5"),
          client.execute(`
            SELECT u.id, u.username, u.first_name, u.last_name, u.avatar, u.user_type, u.gives, u.profile_views, u.is_verified,
                   (SELECT AVG(rating) FROM reviews WHERE product_id IN (SELECT id FROM products WHERE owner_id = u.id)) as avg_rating,
                   (SELECT SUM(likes_count) FROM products WHERE owner_id = u.id) as total_likes
            FROM users u 
            WHERE u.user_type = 'supplier' 
            ORDER BY profile_views DESC LIMIT 8
          `)
        ]);

        let favorites = [];
        let notifications = [];
        let productCount = 0;

        if (userId !== 'guest') {
          const [favsRes, notifsRes, countRes, userStatsRes] = await Promise.all([
            client.execute({ sql: "SELECT product_id FROM favorites WHERE user_id = ?", args: [userId] }),
            client.execute({ sql: "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC", args: [userId] }),
            client.execute({ sql: "SELECT COUNT(*) as total FROM products WHERE owner_id = ?", args: [userId] }),
            client.execute({ 
              sql: `
                SELECT 
                  (SELECT AVG(rating) FROM reviews WHERE product_id IN (SELECT id FROM products WHERE owner_id = u.id)) as avg_rating,
                  (SELECT SUM(likes_count) FROM products WHERE owner_id = u.id) as total_likes
                FROM users u WHERE u.id = ?
              `, 
              args: [userId] 
            })
          ]);
          favorites = favsRes.rows.map(r => sanitize(r.product_id));
          notifications = mapRows(notifsRes);
          productCount = sanitize(countRes.rows[0]?.total || 0);
          
          const uStats = userStatsRes.rows[0];
          customResponse = {
            ...customResponse,
            userRating: uStats ? sanitize(uStats.avg_rating || 0) : 0,
            userTotalLikes: uStats ? sanitize(uStats.total_likes || 0) : 0
          };
        }

        customResponse = {
          ...customResponse,
          categories: mapRows(cats),
          trendingProducts: mapRows(trending),
          allProducts: mapRows(all),
          appReviews: mapRows(appReviews),
          trendingSellers: mapRows(suppliers),
          favorites,
          notifications,
          productCount
        };
        break;

      case 'search':
        const q = `%${params.query.toLowerCase()}%`;
        const catFilter = params.category ? params.category : null;

        // Search Products
        const prodSql = `
          SELECT p.*, u.username as owner_username, u.is_verified as owner_verified, c.name as category_name
          FROM products p
          LEFT JOIN categories c ON p.category_id = c.id
          LEFT JOIN users u ON p.owner_id = u.id
          WHERE (p.name LIKE ? OR p.description LIKE ? OR c.name LIKE ? OR u.username LIKE ?)
          AND (? IS NULL OR c.name = ?)
          ORDER BY p.likes_count DESC
        `;
        
        // Search Tailors
        const tailorSql = `
          SELECT u.id, u.username, u.first_name, u.last_name, u.avatar, u.gives as bio, u.is_verified,
                 (SELECT AVG(rating) FROM reviews WHERE product_id IN (SELECT id FROM products WHERE owner_id = u.id)) as rating
          FROM users u
          WHERE u.user_type = 'supplier'
          AND (u.username LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ? OR u.gives LIKE ?)
          ORDER BY profile_views DESC
        `;

        const [sProds, sTailors] = await Promise.all([
          client.execute({ sql: prodSql, args: [q, q, q, q, catFilter, catFilter] }),
          client.execute({ sql: tailorSql, args: [q, q, q, q] })
        ]);

        customResponse = { 
          query: params.query,
          products: mapRows(sProds),
          tailors: mapRows(sTailors)
        };
        break;

      case 'get_product_details':
        const prodRes = await client.execute({
          sql: `
            SELECT p.*, u.username as owner_username, u.first_name, u.last_name, u.avatar as owner_avatar, u.whatsapp as sellerPhone, c.name as categoryName
            FROM products p
            LEFT JOIN users u ON p.owner_id = u.id
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.id = ?
          `,
          args: [params.productId]
        });
        const revsRes = await client.execute({
          sql: "SELECT r.*, u.first_name, u.last_name, u.avatar FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.product_id = ?",
          args: [params.productId]
        });
        customResponse = { product: mapRows(prodRes)[0], reviews: mapRows(revsRes) };
        break;

      case 'get_tailor_details':
        const tailorRes = await client.execute({ 
          sql: `
            SELECT u.id, u.username, u.first_name, u.last_name, u.avatar, u.gives, u.whatsapp, u.email, u.profile_views, u.is_verified,
                   tp.quirk, tp.case_study_title, tp.case_study_quote, tp.case_study_challenge, tp.case_study_execution, tp.case_study_result, tp.case_study_image, tp.services_json, tp.contacts_json
            FROM users u 
            LEFT JOIN tailor_profiles tp ON u.id = tp.user_id
            WHERE u.username = ?
          `, 
          args: [params.username] 
        });
        if (tailorRes.rows.length === 0) return res.status(404).json({ error: 'Tailor not found' });
        
        const tailorObj = mapRows(tailorRes)[0];
        const tailorId = tailorObj.id;
        const [tProds, tStats, tRevs] = await Promise.all([
          client.execute({ sql: "SELECT p.*, c.name as categoryName FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.owner_id = ? ORDER BY p.id DESC", args: [tailorId] }),
          client.execute({ sql: "SELECT (SELECT SUM(likes_count) FROM products WHERE owner_id = ?) as total_likes, (SELECT COUNT(*) FROM orders WHERE tailor_id = ?) as total_clients", args: [tailorId, tailorId] }),
          client.execute({ sql: "SELECT r.*, u.first_name, u.last_name, u.username, u.avatar as author_avatar FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.product_id IN (SELECT id FROM products WHERE owner_id = ?) ORDER BY r.created_at DESC LIMIT 3", args: [tailorId] })
        ]);
        customResponse = { tailor: tailorObj, products: mapRows(tProds), stats: mapRows(tStats)[0], reviews: mapRows(tRevs) };
        break;

      case 'update_tailor_details':
        // Updates the core profile fields.
        await client.execute({
          sql: 'UPDATE users SET first_name = ?, gives = ?, avatar = ? WHERE id = ?',
          args: [params.name, params.bio, params.avatar, params.id]
        });
        
        // Upsert into tailor_profiles
        sql = `
          INSERT INTO tailor_profiles (user_id, quirk, case_study_title, case_study_quote, case_study_challenge, case_study_execution, case_study_result, case_study_image, services_json, contacts_json)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(user_id) DO UPDATE SET
            quirk = excluded.quirk,
            case_study_title = excluded.case_study_title,
            case_study_quote = excluded.case_study_quote,
            case_study_challenge = excluded.case_study_challenge,
            case_study_execution = excluded.case_study_execution,
            case_study_result = excluded.case_study_result,
            case_study_image = excluded.case_study_image,
            services_json = excluded.services_json,
            contacts_json = excluded.contacts_json
        `;
        args = [
          params.id, 
          params.quirk, 
          params.featuredCaseStudy?.title, 
          params.featuredCaseStudy?.quote, 
          params.featuredCaseStudy?.challenge, 
          params.featuredCaseStudy?.execution, 
          params.featuredCaseStudy?.result, 
          params.featuredCaseStudy?.image, 
          JSON.stringify(params.services),
          JSON.stringify(params.contacts)
        ];
        break;

      case 'login':
        // Auth Rate Limit: 10 attempts per 15 minutes per IP
        const authLimit = await checkRateLimit(client, `login:${ip}`, 10, 900);
        if (!authLimit.allowed) {
          return res.status(429).json({ error: `Too many login attempts. Please try again in ${Math.ceil(authLimit.reset / 60)} minutes.` });
        }

        const loginRes = await client.execute({
          sql: 'SELECT * FROM users WHERE email = ?',
          args: [params.email]
        });

        if (loginRes.rows.length === 0) {
          return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = loginRes.rows[0];
        let passMatch = false;
        try {
          passMatch = await bcrypt.compare(params.password, sanitize(user.password));
        } catch (e) {
          passMatch = params.password === sanitize(user.password);
        }

        if (!passMatch) {
          return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Return user WITHOUT password
        const userObj = {};
        loginRes.columns.forEach((col, i) => { if (col !== 'password') userObj[col] = sanitize(user[i]); });
        
        // Generate Session Token
        const sessionToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
        const sessionExpires = Math.floor(Date.now() / 1000) + (86400 * 7); // 7 days
        await client.execute({
          sql: "INSERT INTO session_tokens (token, user_id, expires_at) VALUES (?, ?, ?)",
          args: [sessionToken, userObj.id, sessionExpires]
        });

        customResponse = { user: userObj, token: sessionToken };
        break;

      case 'signup':
        // Signup Rate Limit: 5 attempts per hour per IP
        const signupLimit = await checkRateLimit(client, `signup:${ip}`, 5, 3600);
        if (!signupLimit.allowed) {
          return res.status(429).json({ error: `Too many signup attempts. Please try again in ${Math.ceil(signupLimit.reset / 60)} minutes.` });
        }

        // Validate username (Alphanumeric, underscores, hyphens only. No @, /, \, or spaces)
        if (!/^[a-zA-Z0-9_-]+$/.test(params.username)) {
          return res.status(400).json({ error: 'Username can only contain letters, numbers, underscores, and hyphens. Special characters and spaces are not allowed.' });
        }

        // Check if exists
        const exists = await client.execute({ sql: 'SELECT id FROM users WHERE email = ? OR username = ?', args: [params.email, params.username] });
        if (exists.rows.length > 0) return res.status(400).json({ error: 'Email or username already taken' });

        const hashedPassword = await bcrypt.hash(params.password, 10);
        sql = 'INSERT INTO users (id, username, first_name, last_name, email, password, whatsapp, avatar, user_type, needs, gives, theme) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        args = [params.id, params.username, params.firstName, params.lastName, params.email, hashedPassword, params.whatsapp, params.avatar, params.userType, params.needs, params.gives, 'dark'];
        
        // Generate Token for Signup too
        const stoken = Math.random().toString(36).substring(2) + Date.now().toString(36);
        const sexpires = Math.floor(Date.now() / 1000) + (86400 * 7);
        await client.execute({
          sql: "INSERT INTO session_tokens (token, user_id, expires_at) VALUES (?, ?, ?)",
          args: [stoken, params.id, sexpires]
        });

        // Initialize tailor profile if they are a supplier
        if (params.userType === 'supplier') {
          await initializeTailorProfile(params.id, params.whatsapp, params.email);
        }

        // We need to return the token, so we override the standard execute flow
        await client.execute({ sql, args });
        customResponse = { success: true, token: stoken };
        break;

      case 'create_negotiation':
        const negId = 'n' + Date.now();
        sql = "INSERT INTO negotiations (id, item_name, customer_id, tailor_id, proposed_price, status, size, color, notes, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        args = [negId, params.itemName, params.customerId, params.tailorId, params.price, 'Awaiting Reply', params.size, params.color, params.notes, params.image];
        break;

      case 'toggle_like':
        if (params.isAdding) {
          await client.execute({ sql: 'INSERT OR IGNORE INTO favorites (user_id, product_id) VALUES (?, ?)', args: [params.userId, params.productId] });
          await client.execute({ sql: 'UPDATE products SET likes_count = likes_count + 1 WHERE id = ?', args: [params.productId] });
        } else {
          await client.execute({ sql: 'DELETE FROM favorites WHERE user_id = ? AND product_id = ?', args: [params.userId, params.productId] });
          await client.execute({ sql: 'UPDATE products SET likes_count = MAX(0, likes_count - 1) WHERE id = ?', args: [params.productId] });
        }
        customResponse = { success: true };
        break;

      case 'create_notification':
        sql = 'INSERT INTO notifications (user_id, message, is_unread) VALUES (?, ?, 1)';
        args = [params.userId, params.message];
        break;

      case 'get_chats':
        sql = `
          SELECT u.id, u.username, u.first_name, u.last_name, u.avatar,
                 (SELECT content FROM messages WHERE (sender_id = u.id AND receiver_id = ?) OR (sender_id = ? AND receiver_id = u.id) ORDER BY created_at DESC LIMIT 1) as last_message,
                 (SELECT created_at FROM messages WHERE (sender_id = u.id AND receiver_id = ?) OR (sender_id = ? AND receiver_id = u.id) ORDER BY created_at DESC LIMIT 1) as last_message_time,
                 (SELECT COUNT(*) FROM messages WHERE sender_id = u.id AND receiver_id = ? AND is_read = 0) as unread_count
          FROM users u
          WHERE u.id IN (
            SELECT DISTINCT sender_id FROM messages WHERE receiver_id = ? 
            UNION 
            SELECT DISTINCT receiver_id FROM messages WHERE sender_id = ?
            UNION
            SELECT DISTINCT customer_id FROM negotiations WHERE tailor_id = ?
            UNION
            SELECT DISTINCT tailor_id FROM negotiations WHERE customer_id = ?
          )
        `;
        args = [params.userId, params.userId, params.userId, params.userId, params.userId, params.userId, params.userId, params.userId, params.userId];
        break;

      case 'get_messages':
        sql = 'SELECT * FROM messages WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) ORDER BY created_at ASC';
        args = [params.userId, params.otherId, params.otherId, params.userId];
        break;

      case 'get_orders':
        sql = `
          SELECT o.*, 
                 u_tailor.first_name as tailor_first_name, u_tailor.last_name as tailor_last_name, u_tailor.username as tailor_username, u_tailor.whatsapp as tailor_phone,
                 u_customer.first_name as customer_first_name, u_customer.last_name as customer_last_name, u_customer.username as customer_username, u_customer.whatsapp as customer_phone
          FROM orders o
          JOIN users u_tailor ON o.tailor_id = u_tailor.id
          JOIN users u_customer ON o.customer_id = u_customer.id
          WHERE o.customer_id = ? OR o.tailor_id = ? 
          ORDER BY o.created_at DESC
        `;
        args = [params.userId, params.userId];
        break;

      case 'get_tailor_console_data':
        const [cOrders, cNegs, cProducts, cRevs] = await Promise.all([
          client.execute({ 
            sql: `
              SELECT o.*, u.first_name, u.last_name, u.username, u.whatsapp as customer_phone
              FROM orders o
              JOIN users u ON o.customer_id = u.id
              WHERE o.tailor_id = ? 
              ORDER BY o.created_at DESC
            `, 
            args: [params.userId] 
          }),
          client.execute({ 
            sql: `
              SELECT n.*, u.first_name, u.last_name, u.username, u.whatsapp as customer_phone
              FROM negotiations n
              JOIN users u ON n.customer_id = u.id
              WHERE n.tailor_id = ? 
              ORDER BY n.created_at DESC
            `, 
            args: [params.userId] 
          }),
          client.execute({ sql: "SELECT p.*, c.name as categoryName FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.owner_id = ? ORDER BY p.id DESC", args: [params.userId] }),
          client.execute({ sql: "SELECT r.*, u.first_name, u.last_name, u.username, u.avatar as author_avatar FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.product_id IN (SELECT id FROM products WHERE owner_id = ?) ORDER BY r.created_at DESC LIMIT 5", args: [params.userId] })
        ]);
        customResponse = { orders: mapRows(cOrders), negotiations: mapRows(cNegs), products: mapRows(cProducts), reviews: mapRows(cRevs) };
        break;

      case 'get_similar_products':
        const simRes = await client.execute({
          sql: "SELECT p.*, c.name as categoryName FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.category_id = ? AND p.id != ? LIMIT 4",
          args: [params.categoryId, params.productId]
        });
        customResponse = { rows: mapRows(simRes) };
        break;

      case 'get_user_by_id':
        sql = 'SELECT id, username, first_name, last_name, avatar, user_type FROM users WHERE id = ?';
        args = [params.userId];
        break;
      
      // Fallback for remaining simple actions
      case 'update_profile':
        // Validate username (Alphanumeric, underscores, hyphens only. No @, /, \, or spaces)
        if (!/^[a-zA-Z0-9_-]+$/.test(params.username)) {
          return res.status(400).json({ error: 'Username can only contain letters, numbers, underscores, and hyphens. Special characters and spaces are not allowed.' });
        }

        // Check if new username is already taken by ANOTHER user
        const usernameCheck = await client.execute({
          sql: "SELECT id FROM users WHERE username = ? AND id != ?",
          args: [params.username, params.id]
        });
        if (usernameCheck.rows.length > 0) {
          return res.status(400).json({ error: 'Username is already taken by another member of the tribe.' });
        }

        sql = 'UPDATE users SET username = ?, first_name = ?, last_name = ?, whatsapp = ?, avatar = ?, user_type = ?, needs = ?, gives = ? WHERE id = ?';
        args = [
          sanitize(params.username), 
          sanitize(params.firstName), 
          sanitize(params.lastName), 
          sanitize(params.whatsapp), 
          sanitize(params.avatar), 
          sanitize(params.userType), 
          sanitize(params.needs || ''), 
          sanitize(params.gives || ''), 
          sanitize(params.id)
        ];

        // If user becomes a supplier, ensure profile exists
        if (params.userType === 'supplier') {
          // We need email for initialization, let's fetch it if not provided (though params should have what's needed or we can fetch)
          // Actually, we can fetch the current user data to be sure
          const userData = await client.execute({ sql: "SELECT email FROM users WHERE id = ?", args: [params.id] });
          const email = userData.rows[0] ? sanitize(userData.rows[0][0]) : '';
          await initializeTailorProfile(params.id, params.whatsapp, email);
        }
        break;
      case 'delete_product':
        await client.execute({ sql: 'DELETE FROM favorites WHERE product_id = ?', args: [params.productId] });
        await client.execute({ sql: 'DELETE FROM reviews WHERE product_id = ?', args: [params.productId] });
        sql = 'DELETE FROM products WHERE id = ? AND owner_id = ?';
        args = [params.productId, params.userId];
        break;
      case 'write_review':
        sql = 'INSERT INTO reviews (product_id, user_id, rating, text, image) VALUES (?, ?, ?, ?, ?)';
        args = [params.productId, params.userId, params.rating, params.text, params.image];
        break;
      case 'submit_app_review':
        sql = 'INSERT INTO app_reviews (user_id, rating, text, image) VALUES (?, ?, ?, ?)';
        args = [params.userId, params.rating, params.text, params.image];
        break;
      case 'update_role':
        sql = 'UPDATE users SET user_type = ? WHERE id = ?';
        args = [params.role, params.id];

        // If user becomes a supplier, ensure profile exists
        if (params.role === 'supplier') {
          const userData = await client.execute({ sql: "SELECT email, whatsapp FROM users WHERE id = ?", args: [params.id] });
          const email = userData.rows[0] ? sanitize(userData.rows[0][0]) : '';
          const whatsapp = userData.rows[0] ? sanitize(userData.rows[0][1]) : '';
          await initializeTailorProfile(params.id, whatsapp, email);
        }
        break;
      case 'update_order_status':
        sql = 'UPDATE orders SET status = ? WHERE id = ?';
        args = [params.status, params.orderId];
        break;
      case 'toggle_stock':
        sql = 'UPDATE products SET status = ? WHERE id = ?';
        args = [params.status, params.productId];
        break;
      case 'send_message':
        sql = 'INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)';
        args = [params.senderId, params.receiverId, params.content];
        break;
      case 'mark_messages_read':
        sql = 'UPDATE messages SET is_read = 1 WHERE sender_id = ? AND receiver_id = ?';
        args = [params.senderId, params.receiverId];
        break;
      case 'increment_views':
        sql = "UPDATE users SET profile_views = profile_views + 1 WHERE id = ?";
        args = [params.userId];
        break;

      case 'reset_password':
        // Reset Rate Limit: 3 attempts per hour per IP
        const resetLimit = await checkRateLimit(client, `reset:${ip}`, 3, 3600);
        if (!resetLimit.allowed) {
          return res.status(429).json({ error: `Too many password reset attempts. Please try again later.` });
        }

        // Verify the code first
        const codeRes = await client.execute({
          sql: "SELECT code, expires_at FROM verification_codes WHERE email = ?",
          args: [params.email]
        });

        if (codeRes.rows.length === 0) {
          return res.status(400).json({ error: "No verification code found for this email." });
        }

        const storedCode = codeRes.rows[0];
        const now = Math.floor(Date.now() / 1000);

        if (parseInt(sanitize(storedCode[1])) < now) {
          return res.status(400).json({ error: "Verification code has expired." });
        }

        if (sanitize(storedCode[0]) !== params.code) {
          return res.status(400).json({ error: "Invalid verification code." });
        }

        const hashedPass = await bcrypt.hash(params.password, 10);
        await client.execute({
          sql: 'UPDATE users SET password = ? WHERE email = ?',
          args: [hashedPass, params.email]
        });

        // Delete the code after successful reset
        await client.execute({
          sql: "DELETE FROM verification_codes WHERE email = ?",
          args: [params.email]
        });

        customResponse = { success: true };
        break;

      case 'request_password_reset':
        // Rate limit reset requests: 3 per hour per IP
        const reqLimit = await checkRateLimit(client, `req_reset:${ip}`, 3, 3600);
        if (!reqLimit.allowed) {
          return res.status(429).json({ error: "Too many reset requests. Please try again in an hour." });
        }

        // Check if user exists
        const userExists = await client.execute({
          sql: "SELECT id FROM users WHERE email = ?",
          args: [params.email]
        });

        if (userExists.rows.length === 0) {
          return res.status(404).json({ error: "No user found with this email." });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = Math.floor(Date.now() / 1000) + 1800; // 30 minutes

        await client.execute({
          sql: "INSERT OR REPLACE INTO verification_codes (email, code, expires_at) VALUES (?, ?, ?)",
          args: [params.email, otp, expires]
        });

        // Send Email via Resend
        if (resend) {
          const { data, error } = await resend.emails.send({
            from: 'Alfietz <info@alfietz.shop>',
            to: params.email,
            subject: 'Your Heritage Verification Code',
            template: { 
              id: '374690a1-273f-4ed3-85ef-7608bc84acaf',
              variables: {
                VERIFICATION_CODE: otp
              }
            }
          });
          if (error) {
            console.error('Email Sending Error:', error);
          }
        }

        console.log(`[AUTH] Password reset OTP for ${params.email}: ${otp}`);
        
        customResponse = { 
          success: true, 
          message: "Verification code sent to your email.",
          code: process.env.NODE_ENV === 'development' ? otp : undefined 
        };
        break;

      case 'verify_reset_code':
        // Code verification Rate Limit: 5 attempts per 15 minutes per IP
        const vLimit = await checkRateLimit(client, `verify_code:${ip}`, 5, 900);
        if (!vLimit.allowed) {
          return res.status(429).json({ error: "Too many verification attempts. Please try again in 15 minutes." });
        }

        const vCodeRes = await client.execute({
          sql: "SELECT code, expires_at FROM verification_codes WHERE email = ?",
          args: [params.email]
        });

        if (vCodeRes.rows.length === 0) return res.status(400).json({ error: "No code found." });
        
        const vStored = vCodeRes.rows[0];
        const vNow = Math.floor(Date.now() / 1000);

        if (parseInt(sanitize(vStored[1])) < vNow) return res.status(400).json({ error: "Code expired." });
        if (sanitize(vStored[0]) !== params.code) return res.status(400).json({ error: "Invalid code." });

        customResponse = { success: true };
        break;

      case 'create_product':
        sql = 'INSERT INTO products (name, price, description, material, image, category_id, owner_id, status, variants_json, gallery_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        args = [params.name, params.price, params.description, params.material, params.image, params.category_id, params.owner_id, params.status, JSON.stringify(params.colors), JSON.stringify(params.gallery)];
        break;

      case 'update_product':
        sql = 'UPDATE products SET name = ?, price = ?, description = ?, material = ?, image = ?, category_id = ?, status = ?, variants_json = ?, gallery_json = ? WHERE id = ? AND owner_id = ?';
        args = [params.name, params.price, params.description, params.material, params.image, params.category_id, params.status, JSON.stringify(params.colors), JSON.stringify(params.gallery), params.id, params.owner_id];
        break;

      case 'create_order':
        await client.execute({
          sql: 'INSERT INTO orders (id, item_name, customer_id, tailor_id, price, status, size, color, notes, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          args: [params.id, params.itemName, params.customerId, params.tailorId, params.price, 'Pending', params.size, params.color, params.notes, params.image]
        });

        // Send Order Confirmation Email
        if (resend) {
          const customerRes = await client.execute({
            sql: "SELECT email, first_name FROM users WHERE id = ?",
            args: [params.customerId]
          });
          
          if (customerRes.rows.length > 0) {
            const customer = customerRes.rows[0];
            const { data, error } = await resend.emails.send({
              from: 'Alfietz <info@alfietz.shop>',
              to: sanitize(customer[0]),
              subject: 'Your Heritage Order is Confirmed!',
              template: { 
                id: 'order-confirmation',
                variables: {
                  NAME: sanitize(customer[1]),
                  PRODUCT: params.itemName,
                  PRICE: params.price,
                  SIZE: params.size,
                  COLOR: params.color
                }
              }
            });
            if (error) {
              console.error('Order Email Error:', error);
            }
          }
        }
        
        customResponse = { success: true };
        break;

      case 'submit_feedback':
        sql = 'INSERT INTO feedback (user_id, message) VALUES (?, ?)';
        args = [params.userId, params.message];
        break;

      case 'get_reviews':
        if (params.isApp) {
          sql = "SELECT r.*, u.first_name, u.last_name, u.username, u.avatar FROM app_reviews r JOIN users u ON r.user_id = u.id ORDER BY r.created_at DESC";
          args = [];
        } else if (params.productId) {
          sql = `
            SELECT r.*, u.first_name, u.last_name, u.username, u.avatar, p.name as product_name, p.image as product_image 
            FROM reviews r 
            JOIN users u ON r.user_id = u.id 
            JOIN products p ON r.product_id = p.id
            WHERE r.product_id = ? 
            ORDER BY r.created_at DESC
          `;
          args = [params.productId];
        } else if (params.tailorId) {
          sql = `
            SELECT r.*, u.first_name, u.last_name, u.username, u.avatar, 
                   p.name as product_name, p.image as product_image,
                   t.first_name as tailor_first, t.last_name as tailor_last, t.username as tailor_username
            FROM reviews r 
            JOIN users u ON r.user_id = u.id 
            JOIN products p ON r.product_id = p.id
            JOIN users t ON p.owner_id = t.id
            WHERE p.owner_id = ? 
            ORDER BY r.created_at DESC
          `;
          args = [params.tailorId];
        }
        break;

      case 'update_negotiation_status':
        sql = 'UPDATE negotiations SET status = ? WHERE id = ?';
        args = [params.status, params.negotiationId];
        break;

      default:
        return res.status(400).json({ error: `Unknown action: ${action}` });
    }

    const duration = Date.now() - startTime;
    const userTag = params.userId || 'guest';
    console.log(`[Metrics] Action: ${action} | User: ${userTag} | Duration: ${duration}ms`);

    if (customResponse) {
      return res.status(200).json(customResponse);
    }

    const result = await client.execute({ 
      sql, 
      args: args.map(arg => arg === undefined ? null : arg) 
    });
    const rows = mapRows(result);

    return res.status(200).json({
      ...result,
      rows,
      lastInsertRowid: result.lastInsertRowid ? sanitize(result.lastInsertRowid) : undefined
    });

  } catch (error) {
    console.error('Database Proxy Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
