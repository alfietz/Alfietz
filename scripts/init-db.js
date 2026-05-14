import { createClient } from "@libsql/client"
import * as dotenv from 'dotenv'
dotenv.config()

const client = createClient({
  url: process.env.VITE_TURSO_URL,
  authToken: process.env.VITE_TURSO_AUTH_TOKEN,
})

async function init() {
  console.log("Initializing Turso Database for African Trends...")

  try {
    // 1. Drop existing tables in correct order
    await client.execute("DROP TABLE IF EXISTS notifications")
    await client.execute("DROP TABLE IF EXISTS feedback")
    await client.execute("DROP TABLE IF EXISTS reviews")
    await client.execute("DROP TABLE IF EXISTS favorites")
    await client.execute("DROP TABLE IF EXISTS products")
    await client.execute("DROP TABLE IF EXISTS sellers")
    await client.execute("DROP TABLE IF EXISTS categories")
    await client.execute("DROP TABLE IF EXISTS users")

    // 2. Create tables
    await client.execute(`
      CREATE TABLE users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE,
        first_name TEXT,
        last_name TEXT,
        email TEXT UNIQUE,
        password TEXT,
        whatsapp TEXT,
        avatar TEXT,
        user_type TEXT DEFAULT 'buyer',
        needs TEXT,
        gives TEXT,
        theme TEXT DEFAULT 'light'
      )
    `)

    await client.execute(`
      CREATE TABLE categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE,
        count INTEGER DEFAULT 0
      )
    `)

    await client.execute(`
      CREATE TABLE products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        price TEXT,
        description TEXT,
        image TEXT,
        category_id INTEGER,
        likes_count INTEGER DEFAULT 0,
        owner_id TEXT,
        FOREIGN KEY(category_id) REFERENCES categories(id),
        FOREIGN KEY(owner_id) REFERENCES users(id)
      )
    `)

    await client.execute(`
      CREATE TABLE sellers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        specialty TEXT,
        bio TEXT,
        rating REAL,
        likes_count INTEGER DEFAULT 0,
        clients_count INTEGER DEFAULT 0,
        avatar TEXT,
        is_verified BOOLEAN DEFAULT 0
      )
    `)

    await client.execute(`
      CREATE TABLE favorites (
        user_id TEXT,
        product_id INTEGER,
        PRIMARY KEY (user_id, product_id),
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(product_id) REFERENCES products(id)
      )
    `)

    await client.execute(`
      CREATE TABLE feedback (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        message TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )
    `)

    await client.execute(`
      CREATE TABLE reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER,
        user_id TEXT,
        rating INTEGER,
        text TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(product_id) REFERENCES products(id),
        FOREIGN KEY(user_id) REFERENCES users(id)
      )
    `)

    await client.execute(`
      CREATE TABLE notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        message TEXT,
        is_unread BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )
    `)

    console.log("Tables created successfully.")

    // 2.5 Insert Default Guest User
    await client.execute({
      sql: "INSERT INTO users (id, username, first_name, last_name, email, password, whatsapp, avatar, user_type, theme) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      args: ['guest', 'johnabram', 'John', 'Abram', 'johnabram@gmail.com', 'password123', '+255700000000', 'https://i.pravatar.cc/150?u=johnabram', 'buyer', 'light']
    })

    // 2.6 Seed Initial Notifications
    const initialNotifications = [
      'A master tailor is ready for your Maasai Beads order',
      'New Kente Royal collection just dropped!',
      'Your Ankara Infinity Dress has been shipped'
    ]
    for (const msg of initialNotifications) {
      await client.execute({
        sql: "INSERT INTO notifications (user_id, message) VALUES (?, ?)",
        args: ['guest', msg]
      })
    }

    // 3. Seed initial data
    const categories = [
      'Ankara Essence', 'Kente Royal', 'Modern Dashiki', 'Maasai Beads',
      'Traditional Wedding', 'Heritage Headwear', 'Tribal Footwear', 'Agbada Collection',
      'Normal Clothes'
    ]
    for (const name of categories) {
      await client.execute({
        sql: "INSERT INTO categories (name, count) VALUES (?, ?)",
        args: [name, Math.floor(Math.random() * 200)]
      })
    }

    const products = [
      { name: 'Royal Kente Blazer', price: '$145.00', category: 'Kente Royal', likes: 45 },
      { name: 'Ankara Infinity Dress', price: '$95.00', category: 'Ankara Essence', likes: 82 },
      { name: 'Tribal Print Kaftan', price: '$110.00', category: 'Modern Dashiki', likes: 31 },
      { name: 'Heritage Gold Headwrap', price: '$45.00', category: 'Heritage Headwear', likes: 120 },
      { name: 'Bogolan Mudcloth Vest', price: '$75.00', category: 'Ankara Essence', likes: 64 },
      { name: 'Zulu Beaded Sandals', price: '$55.00', category: 'Tribal Footwear', likes: 28 },
      { name: 'Maasai Warrior Shuka', price: '$60.00', category: 'Maasai Beads', likes: 95 },
      { name: 'Agbada Grand Robe', price: '$250.00', category: 'Agbada Collection', likes: 15 },
      { name: 'Adire Indigo Wrap', price: '$80.00', category: 'Traditional Wedding', likes: 53 },
      { name: 'Kente Graduation Stole', price: '$35.00', category: 'Kente Royal', likes: 210 },
      { name: 'Heritage Cotton T-Shirt', price: '$25.00', category: 'Normal Clothes', likes: 12 },
      { name: 'Classic Denim Jeans', price: '$45.00', category: 'Normal Clothes', likes: 8 },
      { name: 'Casual Summer Dress', price: '$35.00', category: 'Normal Clothes', likes: 22 },
      { name: 'Lightweight Bomber Jacket', price: '$65.00', category: 'Normal Clothes', likes: 14 }
    ]

    for (const p of products) {
      const cat = await client.execute({
        sql: "SELECT id FROM categories WHERE name = ?",
        args: [p.category]
      })
      await client.execute({
        sql: "INSERT INTO products (name, price, description, image, category_id, likes_count, owner_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
        args: [
          p.name, 
          p.price, 
          `Exquisite ${p.name} handcrafted with premium African textiles.`, 
          'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?q=80&w=800',
          cat.rows[0].id,
          p.likes,
          'guest'
        ]
      })
    }

    const sellers = [
      { name: 'Amina Tailors', specialty: 'Ankara Specialist', bio: 'Amina is a 3rd generation tailor from Lagos, specializing in modern Ankara silhouettes that honor traditional motifs.', rating: 4.9, likes: 1200, clients: 450, avatar: 'https://i.pravatar.cc/150?u=amina', is_verified: 1 },
      { name: 'Kofi Designs', specialty: 'Kente Royal Wear', bio: 'Master weaver Kofi brings the spirit of Ashanti royalty to every garment, using hand-loomed Kente from his home village.', rating: 4.8, likes: 980, clients: 320, avatar: 'https://i.pravatar.cc/150?u=kofi', is_verified: 1 },
      { name: 'Zahara Crafts', specialty: 'Maasai Beadwork', bio: 'A collective of Maasai women artisans led by Zahara, preserving the ancient art of beadwork through sustainable fashion.', rating: 5.0, likes: 1500, clients: 600, avatar: 'https://i.pravatar.cc/150?u=zahara', is_verified: 0 },
      { name: 'Moussa Robes', specialty: 'Agbada Master', bio: 'Moussa is renowned for his grand Agbada robes, blending silk and cotton with intricate embroidery that tells a story.', rating: 4.7, likes: 850, clients: 210, avatar: 'https://i.pravatar.cc/150?u=moussa', is_verified: 1 },
      { name: 'Elena Prints', specialty: 'Modern Dashiki', bio: 'Elena redefines the Dashiki for the urban youth, focusing on bold colors and contemporary fits.', rating: 4.5, likes: 600, clients: 150, avatar: 'https://i.pravatar.cc/150?u=elena', is_verified: 0 },
      { name: 'Juma Leather', specialty: 'Tribal Footwear', bio: 'Juma crafts durable, stylish leather sandals inspired by nomadic footwear from the Sahel region.', rating: 4.2, likes: 400, clients: 90, avatar: 'https://i.pravatar.cc/150?u=juma', is_verified: 0 },
      { name: 'Sara Sews', specialty: 'Normal Clothes', bio: 'Sara provides high-quality everyday wear with a touch of African textile influence.', rating: 3.8, likes: 150, clients: 40, avatar: 'https://i.pravatar.cc/150?u=sara', is_verified: 0 },
      { name: 'Newbie Stitches', specialty: 'Casual Wear', bio: 'A fresh talent in the heritage scene, exploring simple yet elegant designs.', rating: 0.0, likes: 0, clients: 0, avatar: 'https://i.pravatar.cc/150?u=newbie', is_verified: 0 }
    ]

    for (const s of sellers) {
      await client.execute({
        sql: "INSERT INTO sellers (name, specialty, bio, rating, likes_count, clients_count, avatar, is_verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        args: [s.name, s.specialty, s.bio, s.rating, s.likes, s.clients, s.avatar, s.is_verified]
      })
    }

    // 4. Seed initial reviews
    const allProductsRes = await client.execute("SELECT id FROM products LIMIT 5")
    const reviewTexts = [
      "Absolutely love this piece! The quality is amazing.",
      "Beautiful craftsmanship. Worth every cent.",
      "Fits perfectly and the colors are so vibrant!",
      "Great service and fast delivery. Highly recommend.",
      "The material feels so premium. I'm impressed."
    ]
    for (const p of allProductsRes.rows) {
      await client.execute({
        sql: "INSERT INTO reviews (product_id, user_id, rating, text) VALUES (?, ?, ?, ?)",
        args: [p.id, 'guest', 4 + Math.floor(Math.random() * 2), reviewTexts[Math.floor(Math.random() * reviewTexts.length)]]
      })
    }

    console.log("Database seeded successfully.")

  } catch (e) {
    console.error("Error initializing database:", e)
  }
}

init()
