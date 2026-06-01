import { createClient } from "@libsql/client";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const url = process.env.TURSO_URL || process.env.VITE_TURSO_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN || process.env.VITE_TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    return res.status(500).json({ error: 'Database configuration missing' });
  }

  // Security Check: Shared Secret
  const apiKey = req.headers['x-api-key'];
  const serverSecret = process.env.APP_API_KEY || process.env.VITE_APP_API_KEY;

  if (!apiKey || apiKey !== serverSecret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { action, params } = req.body;

  if (!action) {
    return res.status(400).json({ error: 'Action is required. Raw SQL is disabled for security.' });
  }

  const sanitize = (val) => typeof val === 'bigint' ? val.toString() : val;
  const mapRows = (result) => {
    return result.rows.map(row => {
      const obj = {};
      result.columns.forEach((col, i) => { obj[col] = sanitize(row[i]); });
      return obj;
    });
  };

  try {
    const startTime = Date.now();
    const client = createClient({ url, authToken });

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
            SELECT u.id, u.username, u.first_name, u.last_name, u.avatar, u.user_type, u.gives, u.profile_views,
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
          const [favsRes, notifsRes, countRes] = await Promise.all([
            client.execute({ sql: "SELECT product_id FROM favorites WHERE user_id = ?", args: [userId] }),
            client.execute({ sql: "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC", args: [userId] }),
            client.execute({ sql: "SELECT COUNT(*) as total FROM products WHERE owner_id = ?", args: [userId] })
          ]);
          favorites = favsRes.rows.map(r => sanitize(r.product_id));
          notifications = mapRows(notifsRes);
          productCount = sanitize(countRes.rows[0]?.total || 0);
        }

        customResponse = {
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
        sql = `
          SELECT p.*, u.username as owner_username, c.name as category_name
          FROM products p
          LEFT JOIN categories c ON p.category_id = c.id
          LEFT JOIN users u ON p.owner_id = u.id
          WHERE p.name LIKE ? OR p.description LIKE ? OR c.name LIKE ? OR u.username LIKE ?
          ORDER BY p.likes_count DESC
        `;
        args = [q, q, q, q];
        break;

      case 'get_product_details':
        const prodRes = await client.execute({
          sql: `
            SELECT p.*, u.username as owner_username, u.first_name, u.last_name, u.avatar as owner_avatar, c.name as categoryName
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
            SELECT u.id, u.username, u.first_name, u.last_name, u.avatar, u.gives, u.whatsapp, u.email, u.profile_views,
                   tp.quirk, tp.case_study_title, tp.case_study_quote, tp.case_study_challenge, tp.case_study_execution, tp.case_study_result, tp.case_study_image, tp.services_json, tp.contacts_json
            FROM users u 
            LEFT JOIN tailor_profiles tp ON u.id = tp.user_id
            WHERE u.username = ?
          `, 
          args: [params.username] 
        });
        if (tailorRes.rows.length === 0) return res.status(404).json({ error: 'Tailor not found' });
        
        const t = tailorRes.rows[0];
        const tailorId = sanitize(t.id);
        const [tProds, tStats, tRevs] = await Promise.all([
          client.execute({ sql: "SELECT p.*, c.name as categoryName FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.owner_id = ? ORDER BY p.id DESC", args: [tailorId] }),
          client.execute({ sql: "SELECT (SELECT SUM(likes_count) FROM products WHERE owner_id = ?) as total_likes, (SELECT COUNT(*) FROM orders WHERE tailor_id = ?) as total_clients", args: [tailorId, tailorId] }),
          client.execute({ sql: "SELECT r.*, u.first_name, u.last_name, u.username, u.avatar as author_avatar FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.product_id IN (SELECT id FROM products WHERE owner_id = ?) ORDER BY r.created_at DESC LIMIT 3", args: [tailorId] })
        ]);
        customResponse = { tailor: mapRows(tailorRes)[0], products: mapRows(tProds), stats: mapRows(tStats)[0], reviews: mapRows(tRevs) };
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
        customResponse = { user: userObj };
        break;

      case 'signup':
        // Check if exists
        const exists = await client.execute({ sql: 'SELECT id FROM users WHERE email = ? OR username = ?', args: [params.email, params.username] });
        if (exists.rows.length > 0) return res.status(400).json({ error: 'Email or username already taken' });

        const hashedPassword = await bcrypt.hash(params.password, 10);
        sql = 'INSERT INTO users (id, username, first_name, last_name, email, password, whatsapp, avatar, user_type, needs, gives, theme) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        args = [params.id, params.username, params.firstName, params.lastName, params.email, hashedPassword, params.whatsapp, params.avatar, params.userType, params.needs, params.gives, 'light'];
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
          WHERE u.id IN (SELECT DISTINCT sender_id FROM messages WHERE receiver_id = ? UNION SELECT DISTINCT receiver_id FROM messages WHERE sender_id = ?)
        `;
        args = [params.userId, params.userId, params.userId, params.userId, params.userId, params.userId, params.userId];
        break;

      case 'get_messages':
        sql = 'SELECT * FROM messages WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) ORDER BY created_at ASC';
        args = [params.userId, params.otherId, params.otherId, params.userId];
        break;

      case 'get_orders':
        sql = 'SELECT * FROM orders WHERE customer_id = ? OR tailor_id = ? ORDER BY created_at DESC';
        args = [params.userId, params.userId];
        break;

      case 'get_tailor_console_data':
        const [cOrders, cNegs, cProducts, cRevs] = await Promise.all([
          client.execute({ sql: "SELECT * FROM orders WHERE tailor_id = ? ORDER BY created_at DESC", args: [params.userId] }),
          client.execute({ sql: "SELECT * FROM negotiations WHERE tailor_id = ? ORDER BY created_at DESC", args: [params.userId] }),
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
        sql = 'UPDATE users SET username = ?, first_name = ?, last_name = ?, whatsapp = ?, avatar = ?, user_type = ?, needs = ?, gives = ? WHERE id = ?';
        args = [params.username, params.firstName, params.lastName, params.whatsapp, params.avatar, params.userType, params.needs, params.gives, params.id];
        break;
      case 'delete_product':
        await client.execute({ sql: 'DELETE FROM favorites WHERE product_id = ?', args: [params.productId] });
        await client.execute({ sql: 'DELETE FROM reviews WHERE product_id = ?', args: [params.productId] });
        sql = 'DELETE FROM products WHERE id = ? AND owner_id = ?';
        args = [params.productId, params.userId];
        break;
      case 'write_review':
        sql = 'INSERT INTO reviews (product_id, user_id, rating, text) VALUES (?, ?, ?, ?)';
        args = [params.productId, params.userId, params.rating, params.text];
        break;
      case 'submit_app_review':
        sql = 'INSERT INTO app_reviews (user_id, rating, text, image) VALUES (?, ?, ?, ?)';
        args = [params.userId, params.rating, params.text, params.image];
        break;
      case 'update_role':
        sql = 'UPDATE users SET user_type = ? WHERE id = ?';
        args = [params.role, params.id];
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
        const hashedPass = await bcrypt.hash(params.password, 10);
        sql = 'UPDATE users SET password = ? WHERE email = ?';
        args = [hashedPass, params.email];
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
        sql = 'INSERT INTO orders (id, item_name, customer_id, tailor_id, price, status, size, color, notes, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        args = [params.id, params.itemName, params.customerId, params.tailorId, params.price, 'Pending', params.size, params.color, params.notes, params.image];
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

    const result = await client.execute({ sql, args });
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
