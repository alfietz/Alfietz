# Alfietz Developer Guide & Handover

Welcome to the Alfietz codebase! This document serves as a comprehensive guide for future developers, outlining the architecture, state management, and the core philosophies driving this heritage marketplace.

## 1. Project Overview & Philosophy
Alfietz is a digital marketplace designed to connect independent African artisans, tailors, and designers with consumers seeking heritage crafts and bespoke clothing. 
**Core Philosophy:** The platform acts as a discovery and connection engine. Transactions and negotiations are finalized via **WhatsApp**, bridging the gap between a modern digital storefront and traditional conversational commerce.

## 2. Architecture & Tech Stack
- **Frontend Framework:** Vue 3 (Composition API, `<script setup>`)
- **Routing:** Vue Router (`src/router/index.js`)
- **Styling:** Vanilla CSS (Scoped) + Tailwind CSS (Utility classes) + Custom CSS Variables (`src/style.css`).
- **Database:** Turso (LibSQL / SQLite edge database)
- **Backend/API:** Vercel Serverless Functions (`api/db.js`) acting as a secure proxy to Turso.
- **Emails:** Resend (`info@alfietz.shop`)
- **Hosting:** Vercel

## 3. The Database Proxy (`api/db.js`)
**SECURITY CRITICAL:** The frontend **must never** communicate directly with the Turso database to prevent exposing the `TURSO_AUTH_TOKEN`.
- All database interactions go through the Vercel serverless function located at `api/db.js`.
- The frontend uses `src/db/client.js` which exposes a `db.runAction(actionName, params)` method. This method sends a POST request to `/api/db`.
- **Authentication:** `api/db.js` validates JWT/Session tokens passed in the `Authorization` header for protected actions. Public actions (like `search`, `get_initial_data`) bypass token validation.

## 4. State Management (`src/App.vue`)
The project intentionally avoids Vuex/Pinia in favor of a centralized state managed at the root level (`App.vue`), which is passed down via props.
- `App.vue` holds the master state: `userData`, `allProducts`, `cartItems`, `favoriteItems`, etc.
- **Persistence:** We use custom `getStored` and `setStored` helpers to persist state in `localStorage` under the `alfie_app_` prefix.
- **Background Sync:** A `setInterval` in `App.vue` periodically fetches `get_initial_data` to keep the UI in sync with the database without requiring hard reloads.

## 5. Key Features & Recent Upgrades
If you are picking up this project, here are the most recent major systems implemented:

### A. The Cart System
- **Location:** `src/components/shop/Cart.vue`
- **Logic:** Users can add multiple items to their cart. The cart intelligently groups items by **Tailor/Artisan**. When the user checks out, a single WhatsApp message is formatted containing all items for that specific tailor, along with sizes, colors, and the estimated total.

### B. Artisan Verification & Trust
- The `users` table includes an `is_verified` boolean.
- Verified artisans display a golden checkmark badge on their `SellerCard` and `TailorDetails` pages, bridging the trust gap for cautious buyers.

### C. Advanced Search
- **Location:** `src/components/shop/SearchPage.vue` & `api/db.js` (search action).
- The search engine queries across product names, descriptions, categories, and artisan profiles simultaneously. It supports quick category filtering directly from the UI.

### D. SEO & Meta Tags
- The app is optimized for sharing. `middleware.js` (Vercel Edge Middleware) intercepts requests to inject dynamic Open Graph and Twitter card meta tags for products and tailor profiles before the Vue SPA loads.
- `TailorDetails.vue` injects `JSON-LD` (ProfessionalService schema) dynamically to enhance Google search results.

### E. Review System with Images
- Buyers can upload photos of their commissions when writing a review (`WriteReview.vue`). Images are stored and retrieved alongside text reviews to provide social proof.

## 6. Development Workflow
1. **Environment Setup:** Ensure you have `.env` configured with `TURSO_URL`, `TURSO_AUTH_TOKEN`, and `RESEND_API_KEY`.
2. **Local Dev:** Run `npm run dev`. Note that Serverless functions in the `api/` folder are automatically served by Vercel's CLI (`vercel dev`), but Vite handles the frontend.
3. **Database Migrations:** Check `scripts/init-db.js` for the schema. If you add new columns, you must add an `ALTER TABLE` auto-migration step at the top of `api/db.js` to ensure the production database updates smoothly without dropping tables.

## 7. Known Quirks / Future Roadmap
- **Image Hosting:** Currently, images might be stored as Base64 strings in the database or external URLs. A future migration to a dedicated blob storage (like AWS S3 or Vercel Blob) would improve database performance.
- **Escrow / Payments:** The app currently relies entirely on WhatsApp for financial transactions. Integrating a payment gateway (Stripe/Flutterwave) with an escrow system would be the next major trust milestone.
- **Capacitor:** Capacitor was removed to focus purely on a high-performing Web/PWA experience. If native apps (iOS/Android) are required in the future, it must be re-integrated carefully to avoid breaking the Web proxy logic.

---
*Document prepared for the Alfietz Team.*