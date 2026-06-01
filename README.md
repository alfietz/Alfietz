# Alfietz - African Heritage Crafts Marketplace

## 🚀 Overview
Alfietz is a modern Vue 3 + Vite marketplace app designed to connect the world with independent African artisans, tailors, and designers. 

**Core User Types:**
- **Buyers**: Discover bespoke fashion, add items to their smart cart, and connect directly with master tailors via WhatsApp.
- **Suppliers/Artisans**: Showcase their heritage crafts, gain "Physical Shop Verified" status, and manage their portfolio and reviews.

---

## 📖 Developer Documentation
If you are a new developer joining the project, please read our comprehensive **[Developer Guide & Handover Document](docs/DEVELOPER_GUIDE.md)** first. It contains everything you need to know about the architecture, state management, and the secure database proxy system.

## ✨ Latest Core Features
- **Smart Shopping Cart**: Buyers can add multiple items. The cart intelligently groups the order by artisan for seamless WhatsApp checkout.
- **Verified Trust**: "Physical Shop Verified" badges ensure buyers are dealing with authentic, established artisans.
- **Tribe Reviews**: A robust review system featuring customer photo uploads for real social proof.
- **High-Performance Search**: Advanced search capabilities spanning products, categories, and artisan profiles with quick-filter chips.
- **SEO Optimized**: Dynamic Open Graph tags, Twitter Cards, and injected JSON-LD schema ensure artisan portfolios rank highly and share beautifully.
- **Secure Architecture**: A robust Vercel Serverless Function (`api/db.js`) proxies all database connections to Turso, ensuring API keys are never exposed to the client.

## 🛠️ Setup & Run

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Environment Variables:**
    Create a `.env` file in the root directory:
    ```env
    VITE_API_URL=/api/db
    TURSO_URL=libsql://your-database-url.turso.io
    TURSO_AUTH_TOKEN=your-auth-token
    RESEND_API_KEY=your-resend-api-key
    ```

3.  **Initialize the Database:**
    *(Warning: This drops existing tables and seeds fresh data)*
    ```bash
    node scripts/init-db.js
    ```

4.  **Run the Development Server:**
    ```bash
    npm run dev
    ```
    *Note: To fully test serverless functions locally, it is recommended to use the Vercel CLI (`vercel dev`).*

## 📁 File Structure Highlights
```
alfietz/
├── src/
│   ├── App.vue                # Central hub: routing, state management
│   ├── db/client.js           # Secure proxy client for API calls
│   ├── components/
│   │   ├── auth/              # Complete Auth flows
│   │   ├── shop/              # Home/Cart/ProductCard/TailorDetails
│   │   ├── communication/     # Reviews/Chat/Help
│   │   └── legal/             # Terms/Privacy/Guidelines
├── api/
│   └── db.js                  # ⚠️ SECURE BACKEND: Vercel Serverless DB Proxy
├── docs/
│   └── DEVELOPER_GUIDE.md     # 📖 Start reading here!
└── scripts/                   # DB migrations and seeding
```

## 🔒 Security
- **API Protection**: The frontend **never** connects directly to Turso. All queries are securely handled by `/api/db`.
- **Authentication**: JWT/Session token validation is handled securely within the backend proxy before executing queries.
- **Passwords**: Hashed securely using `bcryptjs` before storage.

---
*Built with passion for African Heritage.*