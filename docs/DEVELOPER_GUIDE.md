# Alfietz Developer Guide & Handover

**Last Updated:** July 08, 2026  
**Project:** Alfietz — African Heritage Crafts Marketplace  
**Stack:** Vue 3 + Vite + Turso (libSQL) + Vercel Serverless + Resend

---

## 1. Project Overview

Alfietz is a digital marketplace connecting buyers with independent African artisans, tailors, and fashion designers. The platform acts as a **discovery and connection engine** — transactions are finalized via WhatsApp (conversational commerce).

**Core User Types:**
- **Buyers:** Browse crafts, add to cart, connect via WhatsApp
- **Suppliers (Tailors/Artisans):** Showcase work, manage portfolio, receive orders

**Live URL:** https://alfietz.shop  
**Canonical Domain:** https://alfietz.shop

---

## 2. Quick Start

```bash
# Prerequisites: Node.js >= 18

# 1. Install dependencies
npm install

# 2. Set up environment variables (.env file)
TURSO_URL=libsql://your-database-url.turso.io
TURSO_AUTH_TOKEN=your-auth-token
RESEND_API_KEY=your-resend-api-key

# 3. Initialize the database (WARNING: drops all data)
node scripts/init-db.js

# 4. Start dev server (frontend only)
npm run dev

# 5. For full serverless function testing, use Vercel CLI
# npx vercel dev
```

---

## 3. Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| **Frontend** | Vue 3 (Composition API, `<script setup>`) | No TypeScript currently |
| **Build** | Vite 8.x | Fast HMR, ES modules |
| **Routing** | Vue Router 5 | `createWebHistory`, lazy-loaded components |
| **Styling** | Vanilla CSS + CSS Custom Properties | See `src/style.css` for the theme |
| **State** | Centralized refs in `App.vue` | No Pinia/Vuex (see §5) |
| **Database** | Turso (libSQL/SQLite edge) | Serverless, edge-distributed |
| **Backend** | Vercel Serverless Function (`api/db.js`) | Single function handles all DB ops |
| **Email** | Resend | Order confirmations, password resets |
| **Hosting** | Vercel | Edge Functions + Serverless Functions |
| **PWA** | Custom Service Worker | `public/sw.js`, cache-first strategy |

---

## 4. Architecture (The Big Picture)

```
Browser/PWA Client
    │
    ├─ POST /api/db (db.runAction) ──► Vercel Serverless (api/db.js) ──► Turso DB
    │                                       │
    │                                       └─► Resend (email)
    │
    ├─ wa.me (WhatsApp redirect) ──► External browser
    │
    └─ imgbb.com (image uploads) ──► External API
```

**Key Rule:** The frontend NEVER connects directly to Turso. All database access goes through `api/db.js`. This keeps the Turso credentials server-side.

### File Structure

```
alfietz/
├── api/
│   └── db.js              # ⚠ BACKEND: All DB logic (1061 lines)
├── public/
│   ├── sw.js              # PWA Service Worker
│   ├── manifest.json      # PWA install manifest
│   ├── robots.txt         # SEO
│   └── sitemap.xml        # SEO (3 URLs)
├── scripts/
│   ├── init-db.js         # Schema creation + seed data
│   ├── clear-db.js        # Drop all tables
│   └── migrate-*.js       # Migration scripts
├── src/
│   ├── main.js            # Entry point, SW registration
│   ├── App.vue            # ROOT: state, navigation, handlers (1081 lines)
│   ├── style.css          # Global theme (CSS variables)
│   ├── constants.js       # Category examples, colors
│   ├── translations.js    # i18n (en + sw)
│   ├── db/
│   │   └── client.js      # Secure DB proxy (db.runAction)
│   └── router/
│       └── index.js       # 46 routes, navigation guard
│   └── components/
│       ├── auth/          # Login, SignUp, password reset
│       ├── shop/          # Home, products, cart, search
│       ├── profile/       # User profile, orders, favorites
│       ├── communication/ # Chat, reviews, feedback
│       ├── layout/        # Nav bars, loaders, error pages
│       └── legal/         # Privacy, terms, guidelines
└── docs/                  # Project documentation
```

---

## 5. State Management

The project intentionally avoids Pinia/Vuex. All global state lives in `App.vue` as `ref()` declarations and is passed down via props through `<router-view>`.

### What Goes Where

| Category | In App.vue as ref? | Example |
|---|---|---|
| **Global data** | Yes | `userData`, `allProducts`, `categories` |
| **UI state** | Yes | `isGlobalLoading`, `toast`, `currentLanguage` |
| **Persistent data** | Yes | `cartItems`, `favoriteItems`, `searchHistory` |
| **Component-local state** | No (keep in component) | `showPassword`, `isEditing`, form inputs |

### Adding New Global State

If a piece of data needs to be shared across multiple routed components:

1. Add a `ref()` in `App.vue` with `getStored()` initializer (if persistent)
2. Add it to the `<router-view>` props binding
3. Add it to the component's `defineProps`
4. If children need to update it, add an emit handler in App.vue

**Better alternative (recommended for new code):** Use Vue 3's `provide/inject` or extract related state into a composable file.

### The t() Translation Function

```js
// App.vue
const t = (key) => translations[currentLanguage.value][key] || key
```
This is passed as a prop to all components that need translations. Keys are defined in `src/translations.js`.

---

## 6. How to Add Common Things

### Add a New Route

1. Add the route to `src/router/index.js`:
   ```js
   { path: '/new-path', name: 'new-page', component: () => import('../components/SomeFile.vue') }
   ```
2. Create the component
3. Add props from App.vue if needed
4. Add the route to the auth guard list if protected

### Add a New API Action

1. Add the case to the switch statement in `api/db.js`:
   ```js
   case 'my_new_action':
     sql = 'INSERT INTO my_table (...) VALUES (?, ?)';
     args = [params.field1, params.field2];
     break;
   ```
2. If protected, add it AFTER the auth check (line 282). If public, add the action name to the `publicActions` array (line 282).
3. Call it from the frontend: `db.runAction('my_new_action', { field1: 'value1' })`

### Add a New Database Table/Column

1. Add a `CREATE TABLE IF NOT EXISTS` statement at the top of `api/db.js` (line 123)
2. Add `ALTER TABLE ADD COLUMN` with `.catch(() => {})` for new columns
3. Update `scripts/init-db.js` with the same schema (for local dev/seeding)
4. The auto-migration runs on every function call, so it auto-deploys

### Add a New Component

1. Place it in the appropriate subdirectory under `src/components/`
2. Use `<script setup>` (Composition API)
3. Accept global data via `defineProps`
4. Emit events upward for any data mutations
5. Lazy-load it in the router: `() => import('../components/...')`

---

## 7. Code Conventions

| Convention | Standard |
|---|---|
| **Language** | JavaScript (ES Modules) |
| **Vue API** | Composition API with `<script setup>` |
| **Naming (frontend)** | `camelCase` for variables/functions, `PascalCase` for components |
| **Naming (backend)** | `snake_case` for SQL columns/table names |
| **File names** | `PascalCase.vue` for components, `camelCase.js` for utilities |
| **CSS** | Scoped `<style scoped>` + CSS Custom Properties from `style.css` |
| **Styling approach** | No CSS framework — hand-written utility classes + CSS variables |
| **Error handling** | try/catch in all handlers, `showToast()` for user feedback |
| **Console logging** | Currently used everywhere — new code should avoid `console.log` in production paths |

---

## 8. Database Schema (Turso/libSQL)

**Auto-migrated** in `api/db.js` — tables are created if they don't exist on every function call.

Tables: `users`, `categories`, `products`, `favorites`, `reviews`, `app_reviews`, `feedback`, `notifications`, `messages`, `orders`, `negotiations`, `tailor_profiles`, `rate_limits`, `verification_codes`, `session_tokens`, `login_history`

See `docs/ARCHITECTURE.md` for the full schema with column types and relationships.

### Migration Strategy

- **New column:** Add `ALTER TABLE table_name ADD COLUMN column_name TYPE` with `.catch(() => {})` in `api/db.js`
- **New table:** Add `CREATE TABLE IF NOT EXISTS` in `api/db.js`
- **Breaking change:** Not currently supported. Requires a migration script in `scripts/`

---

## 9. Environment Variables

| Variable | Where Used | Required? | Notes |
|---|---|---|---|
| `TURSO_URL` | `api/db.js` | Yes | Turso database URL |
| `TURSO_AUTH_TOKEN` | `api/db.js` | Yes | Turso auth JWT |
| `RESEND_API_KEY` | `api/db.js` | No (email breaks) | Resend API key |
| `VITE_TURSO_URL` | `middleware.js` | No (SEO breaks) | Fallback for middleware |
| `VITE_TURSO_AUTH_TOKEN` | `middleware.js` | No (SEO breaks) | Fallback for middleware |
| `ANDROID_APP_KEY` | `api/db.js` | No | Android platform key |
| `WEB_APP_KEY` | `api/db.js` | No (falls back to default) | Web platform key |

---

## 10. Critical Security Notes

**⚠️ See `docs/SECURITY.md` for the full security audit. Critical issues include:**

1. **SQL Injection in `middleware.js:31-36`** — path parameters interpolated into SQL
2. **Hardcoded ImgBB API key** in `UploadWork.vue:16` and `EditProfile.vue:19` (exposed in bundle)
3. **`.env` with live credentials committed to git**
4. **`Math.random()` for session tokens** — not cryptographically secure
5. **Plaintext password fallback** in `api/db.js:559`
6. **OTP logged to console** in `api/db.js:920`
7. **CORS `Access-Control-Allow-Origin: *`**

**Do NOT deploy to production until these are addressed.**

---

## 11. Known Quirks & Technical Debt

### Quirks
- The project uses no CSS framework — utility classes are hand-written per-component
- State management in App.vue is becoming a bottleneck as the app grows
- `db.execute()` is deprecated but some old code may still reference it
- Image URLs from Unsplash are used as fallbacks/defaults
- The theme engine (light/dark) works but has inconsistent `!important` usage

### Technical Debt Priorities

| Priority | Task | Reason |
|---|---|---|
| **P0** | Fix SQL injection in middleware | Active exploit vector |
| **P0** | Remove credentials from git | Data breach risk |
| **P0** | Move API keys server-side | Frontend exposure |
| **P1** | Decompose App.vue | Currently 1081 lines, untestable |
| **P1** | Add pagination | Performance, scalability |
| **P1** | Add test framework | Currently zero tests |
| **P1** | Switch to Pinia | State management scalability |
| **P2** | Remove console.log | Currently 100+ in production |
| **P2** | Add TypeScript | Type safety, fewer bugs |
| **P2** | Extract magic strings | Maintainability |

---

## 12. Deployment

The project is deployed on **Vercel**.

```bash
# Production build
npm run build

# Deploy (via Vercel CLI or git push)
vercel --prod
```

**Important:** Serverless functions in `api/` are automatically deployed by Vercel. The frontend is served as static files from `dist/`. The Edge Middleware (`middleware.js`) runs on every request.

### Vercel Configuration (`vercel.json`)
- Rewrites: API routes (`/api/*`) to serverless functions
- Headers: Security headers for assets
- Middleware: Defined in `middleware.js` with matcher paths

---

## 13. Testing

**Current state:** The project has zero tests. No test framework is installed.

When adding tests:
1. Install Vitest: `npm install -D vitest @vue/test-utils`
2. Add test script to `package.json`: `"test": "vitest"`
3. Start with utility functions (phone formatting, i18n, cart logic)
4. Then add component tests
5. Eventually add API integration tests

---

## 14. Recommended Reading

- `docs/SECURITY.md` — Critical vulnerabilities and fixes
- `docs/ARCHITECTURE.md` — Full system architecture and data flow
- `docs/CODEBASE_ANALYSIS.md` — Code quality assessment and best practices
- `docs/ABOUTME.md` — Project overview and roadmap
