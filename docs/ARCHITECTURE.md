# Architecture Guide

**Last Updated:** July 08, 2026  
**Project:** Alfietz Heritage Marketplace

---

## 1. System Architecture (High Level)

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Client (Browser/PWA)                         │
│                                                                     │
│  ┌────────────┐  ┌──────────────┐  ┌───────────────┐               │
│  │ Vue 3 SPA  │  │ Service      │  │ localStorage  │               │
│  │ (56 comps) │  │ Worker (sw.js)│  │ (alfie_app_*) │               │
│  └──────┬─────┘  └──────────────┘  └───────────────┘               │
│         │                                                           │
│         │ POST /api/db  (db.runAction)                              │
└─────────┼───────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Vercel Edge (middleware.js)                     │
│  (Social bot detection → direct Turso query for OG tags)            │
│               ⚠ SQL Injection Risk (see SECURITY.md)                │
└─────────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────┐
│               Vercel Serverless Function (api/db.js)                │
│                                                                     │
│  ┌────────────┐  ┌──────────┐  ┌────────────┐  ┌───────────────┐  │
│  │ CORS Check │→│ Platform │→│ Token      │→│ Rate          │  │
│  │            │  │ Verify   │  │ Validation │  │ Limiting      │  │
│  └────────────┘  └──────────┘  └────────────┘  └───────────────┘  │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │              Auto-Migration (CREATE/ALTER tables)              │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │              Action Dispatcher (switch/case, ~28 actions)      │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  ┌────────────┐  ┌──────────┐                                      │
│  │ Turso (DB) │  │ Resend   │ (Email)                              │
│  └────────────┘  └──────────┘                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Data Flow

### 2.1 Request Lifecycle

```
User Action (tap button, submit form, navigate)
    │
    ▼
Vue Component emits event (e.g., @login, @search, @add-to-cart)
    │
    ▼
App.vue handler (handleLogin, handleSearch, handleAddToCart)
    │
    ▼
db.runAction('action_name', params)       ← src/db/client.js
    │
    ▼
POST /api/db with JSON body:
  { action: 'login', params: { email, password } }
  Headers: Authorization, X-Heritage-Platform, X-Heritage-App-Key
    │
    ▼
api/db.js handler:
  1. CORS check
  2. Platform verification (X-Heritage-App-Key)
  3. Token validation (session_tokens table)
  4. Rate limiting (per-action, per-IP)
  5. Auto-migration (CREATE TABLE IF NOT EXISTS, ALTER TABLE ADD COLUMN)
  6. Switch on action → execute SQL or custom logic
  7. Track metrics (action name, duration)
  8. Return JSON response
    │
    ▼
App.vue receives response → updates reactive refs → persists to localStorage
    │
    ▼
Vue reactivity propagates changes to child components via props
```

### 2.2 Initial Data Load (On Mount)

```
App.vue onMounted()
    │
    ▼
fetchInitialData()
    │
    ▼
Is user logged in?
  ├─ YES: db.runAction('get_initial_data', { userId })
  └─ NO:  db.runAction('get_initial_data', {})
    │
    ▼
Server returns:
  ├─ categories
  ├─ trendingProducts (limit 50)
  ├─ allProducts (limit 50)
  ├─ appReviews
  ├─ trendingSellers
  ├─ recentUpdates
  ├─ favorites (if logged in)
  ├─ notifications (if logged in)
  └─ productCount
    │
    ▼
For each dataset: JSON.stringify deep-compare with existing state
  ├─ If changed: update ref + setStored() to localStorage
  └─ If unchanged: skip (avoid unnecessary re-renders)
```

---

## 3. Component Architecture

### 3.1 Component Tree

```
App.vue (Container - 1081 lines)
├── WebHeader.vue (desktop top nav)
├── <router-view> (receives ALL props)
│   │
│   ├── Layout/                    (shared UI)
│   │   ├── Splash.vue
│   │   ├── LoadingSpinner.vue
│   │   ├── SkeletonLoader.vue
│   │   ├── BaseDialog.vue
│   │   ├── BrandBanner.vue
│   │   ├── SectionHeader.vue
│   │   ├── EditableImage.vue
│   │   ├── EditableText.vue
│   │   ├── PWAInstallPrompt.vue
│   │   └── ErrorPage.vue          (403, 404, 500)
│   │
│   ├── Auth/                      (authentication)
│   │   ├── Login.vue
│   │   ├── SignUp.vue
│   │   ├── ForgotPassword.vue
│   │   ├── VerifyCode.vue
│   │   └── ResetPassword.vue
│   │
│   ├── Shop/                      (marketplace)
│   │   ├── Home.vue
│   │   ├── ProductCard.vue
│   │   ├── ProductDetails.vue     (1764 lines - largest component)
│   │   ├── TailorDetails.vue      (1324 lines)
│   │   ├── SellerCard.vue
│   │   ├── CategoryCard.vue
│   │   ├── CategoryList.vue
│   │   ├── ExploreMore.vue
│   │   ├── SearchPage.vue
│   │   ├── SearchResults.vue
│   │   ├── EmptySearch.vue
│   │   ├── Cart.vue
│   │   └── UploadWork.vue
│   │
│   ├── Profile/                   (user management)
│   │   ├── Profile.vue
│   │   ├── EditProfile.vue
│   │   ├── Settings.vue
│   │   ├── TailorConsole.vue
│   │   ├── Orders.vue
│   │   ├── FavoritesList.vue
│   │   ├── EmptyFavorites.vue
│   │   ├── Notifications.vue
│   │   ├── AppReview.vue
│   │   └── LogoutDialog.vue
│   │
│   ├── Communication/             (messaging & reviews)
│   │   ├── ChatList.vue
│   │   ├── ChatDetail.vue
│   │   ├── ReviewsList.vue
│   │   ├── WriteReview.vue
│   │   ├── Feedback.vue
│   │   ├── FeedbackSuccessDialog.vue
│   │   ├── Help.vue
│   │   └── HeritageStories.vue
│   │
│   └── Legal/                     (static pages)
│       ├── AboutUs.vue
│       ├── PrivacyPolicy.vue
│       ├── TermsConditions.vue
│       ├── ReturnPolicy.vue
│       ├── CommunityGuidelines.vue
│       ├── SafetyTips.vue
│       ├── MeasurementGuide.vue
│       └── IPPolicy.vue
│
├── NavigationBar.vue (mobile bottom nav)
├── Cart.vue (slide-out cart)
├── PWAInstallPrompt.vue (install banner)
├── LoadingSpinner.vue (global loading overlay)
├── SkeletonLoader.vue (content placeholder)
└── <toast> (notification popup, rendered inline)
```

### 3.2 Component Communication

```
       ┌─────────────────────────────────────────────┐
       │                 App.vue                      │
       │  (holds ALL state as refs)                   │
       │                                              │
       │  userData, allProducts, cartItems,           │
       │  categories, favorites, searchResults,       │
       │  trendingProducts, trendingSellers,          │
       │  notifications, appReviews, portfolioUpdates │
       │                                              │
       │  +i18n: t() function                         │
       └──────────┬─────────────────────────┬─────────┘
                  │ PROPS (down)            │ EVENTS (up)
                  ▼                         │
       ┌────────────────────┐               │
       │  <router-view />   │               │
       │  :user-data        │◄──────────────┘
       │  :categories       │   @login, @signup, @logout
       │  :trending-products│   @search, @toggle-favorite
       │  :cart-items        │   @add-to-cart, @remove-item
       │  ... (20+ props)   │   @checkout, @upload, @order
       └────────────────────┘   @negotiate, @go-back
                                @navigate, @delete, @submit
                                @update:user-data, @update:language
                                @update:role, @submit-app-experience
                                @update-status, go-* (10+ events)
                                TOTAL: ~50 distinct event types
```

### 3.3 State Management Pattern

The project uses a **Centralized Root Component Pattern** (no Pinia/Vuex):

| Category | Refs | Persisted? | Key |
|---|---|---|---|
| **User** | `userData`, `currentLanguage` | Yes | `alfie_app_user_data`, `alfie_app_language` |
| **Auth** | `resetEmail`, `resetVerificationCode` | No | Memory only |
| **UI** | `isGlobalLoading`, `isInitialLoading`, `loadingMessage`, `toast`, `isDeepLoading` | No | Memory only |
| **Navigation** | `selectedSeller`, `selectedCategory`, `selectedProduct`, `selectedReviewsTailorId`, `isAppReview`, `selectedEditProduct`, `searchHistory` | Yes | `alfie_app_selected_*`, `alfie_app_search_history` |
| **Data** | `allProducts`, `trendingProducts`, `trendingSellers`, `categories`, `favoriteItems`, `userNotifications`, `userProductCount`, `searchResults`, `appReviews`, `portfolioUpdates` | Yes | `alfie_app_*_cache`, `alfie_app_favorites` |
| **Cart** | `cartItems` | Yes | `alfie_app_cart_items` |
| **PWA** | `deferredPrompt`, `isInstallable`, `isStandalone` | No | Memory only |

**Persistence Mechanic:**
```js
const getStored = (key, def) => {
  const val = localStorage.getItem('alfie_app_' + key)
  if (!val) return def
  try { return JSON.parse(val) } catch { return def }
}
const setStored = (key, val) => {
  localStorage.setItem('alfie_app_' + key, JSON.stringify(val))
}
```

---

## 4. Routing

**File:** `src/router/index.js`  
**Engine:** Vue Router 5 (createWebHistory)

### Route Map

| Route | Name | Auth | Component |
|---|---|---|---|
| `/` | redirect → `/home` | No | — |
| `/splash` | splash | No | `Splash.vue` |
| `/login` | login | No* | `Login.vue` |
| `/signup` | signup | No* | `SignUp.vue` |
| `/forgot-password` | forgot-password | No | `ForgotPassword.vue` |
| `/verify-code` | verify-code | No | `VerifyCode.vue` |
| `/reset-password` | reset-password | No | `ResetPassword.vue` |
| `/home` | home | No | `Home.vue` |
| `/product/:id` | product-details | No | `ProductDetails.vue` |
| `/@:username` | tailor-details | No | `TailorDetails.vue` |
| `/explore/:category?` | explore | No | `ExploreMore.vue` |
| `/search` | search | No | `SearchPage.vue` |
| `/search-results` | search-results | No | `SearchResults.vue` |
| `/cart` | cart | No | `Cart.vue` |
| `/category-list` | category-list | No | `CategoryList.vue` |
| `/favorites` | favorites | No | `FavoritesList.vue` |
| `/profile` | profile | **Yes** | `Profile.vue` |
| `/edit-profile` | edit-profile | **Yes** | `EditProfile.vue` |
| `/settings` | settings | **Yes** | `Settings.vue` |
| `/tailor-console` | tailor-console | **Yes** | `TailorConsole.vue` |
| `/orders` | orders | **Yes** | `Orders.vue` |
| `/upload-work` | upload-work | **Yes** | `UploadWork.vue` |
| `/chats` | chats | **Yes** | `ChatList.vue` |
| `/chat/:userId` | chat-detail | **Yes** | `ChatDetail.vue` |
| `/notifications` | notifications | **Yes** | `Notifications.vue` |
| `/write-review` | write-review | **Yes** | `WriteReview.vue` |
| `/app-review` | app-review | **Yes** | `AppReview.vue` |
| `/reviews` | reviews | No | `ReviewsList.vue` |
| `/help` | help | No | `Help.vue` |
| `/feedback` | feedback | No | `Feedback.vue` |
| `/stories` | stories | No | `HeritageStories.vue` |
| `/legal/privacy` | privacy | No | `PrivacyPolicy.vue` |
| `/legal/terms` | terms | No | `TermsConditions.vue` |
| `/legal/about` | about | No | `AboutUs.vue` |
| `/legal/returns` | returns | No | `ReturnPolicy.vue` |
| `/legal/guidelines` | guidelines | No | `CommunityGuidelines.vue` |
| `/legal/safety` | safety | No | `SafetyTips.vue` |
| `/legal/measurements` | measurements | No | `MeasurementGuide.vue` |
| `/legal/ip-policy` | ip-policy | No | `IPPolicy.vue` |
| `/403` | forbidden | No | `ErrorPage.vue` |
| `/500` | server-error | No | `ErrorPage.vue` |
| `/:pathMatch(.*)*` | not-found | No | `ErrorPage.vue` |

*`*` = Redirected away if already logged in

### Navigation Guard

```js
router.beforeEach((to, from) => {
  const isGuest = userData.id === 'guest'
  const authRoutes = ['profile', 'chats', 'chat-detail', 'edit-profile',
    'settings', 'tailor-console', 'orders', 'upload-work',
    'notifications', 'write-review', 'app-review']
  if (authRoutes.includes(to.name) && isGuest) {
    return { name: 'login' }
  } else if (['login', 'signup', 'splash'].includes(to.name) && !isGuest) {
    return { name: 'home' }
  }
})
```

---

## 5. Database Schema

### Tables (16 total)

```sql
-- Core entities
users (id PK, username UNIQUE, first_name, last_name, email UNIQUE,
       password, whatsapp, avatar, user_type, needs, gives, theme,
       profile_views, is_verified, last_city, last_country, last_lat, last_long)

categories (id PK, name UNIQUE)

products (id PK, name, price, description, material, image, category_id FK,
          owner_id FK, status, variants_json, gallery_json, likes_count, created_at)

-- Relationships
favorites (user_id FK, product_id FK, PRIMARY KEY(user_id, product_id))

reviews (id PK, product_id FK, user_id FK, rating, text, image, created_at)
app_reviews (user_id FK, rating, text, image, created_at)

-- Commerce
orders (id PK, item_name, customer_id FK, tailor_id FK, price, status,
        size, color, notes, image, created_at)

negotiations (id PK, item_name, customer_id FK, tailor_id FK, proposed_price,
              status, size, color, notes, image, created_at)

-- Communication
messages (id PK, sender_id FK, receiver_id FK, content, is_read, created_at)
notifications (id PK, user_id FK, message, is_unread, created_at)
feedback (id PK, user_id FK, message, created_at)

-- Artisan profiles
tailor_profiles (user_id PK FK, quirk, case_study_title, case_study_quote,
                 case_study_challenge, case_study_execution, case_study_result,
                 case_study_image, services_json, contacts_json)

-- Auth & Security
session_tokens (token PK, user_id FK, expires_at)
verification_codes (email PK, code, expires_at)
login_history (id PK AUTOINCREMENT, user_id FK, ip_address, user_agent,
               device_name, city, region, country, latitude, longitude, created_at)

-- Rate limiting
rate_limits (key PK, count, expires_at)
```

---

## 6. API Actions

**File:** `api/db.js` (1061 lines, single serverless function)

### Action Categories

| Category | Actions | Auth |
|---|---|---|
| **Data** | `get_initial_data`, `search` | No |
| **Products** | `get_product_details`, `get_similar_products`, `create_product`, `update_product`, `delete_product` | Write=Yes |
| **Users** | `get_tailor_details`, `update_profile`, `update_role`, `update_tailor_details`, `increment_views`, `confirm_location_update` | Write=Yes |
| **Auth** | `login`, `signup`, `request_password_reset`, `verify_reset_code`, `reset_password` | No (rate-limited) |
| **Commerce** | `create_order`, `update_order_status`, `create_negotiation`, `update_negotiation_status` | Yes |
| **Social** | `toggle_like`, `write_review`, `submit_app_review`, `submit_feedback` | Yes |
| **Messaging** | `send_message`, `mark_messages_read`, `get_chats`, `get_messages` | Yes |
| **Reviews** | `get_reviews` | No |
| **Admin** | `create_notification`, `get_orders`, `get_tailor_console_data`, `toggle_stock` | Yes |

---

## 7. Key Design Patterns

| Pattern | Location | Description |
|---|---|---|
| **Command** | `api/db.js` switch statement | Each action encapsulates SQL + logic + response |
| **Proxy** | `src/db/client.js` | Frontend never touches Turso directly |
| **Observer** | Vue 3 `ref()` / `watch()` | Reactivity drives automatic re-renders |
| **Container-Component** | App.vue ↔ child comps | Container holds state, components render |
| **Singleton** | `db`, `router` | Single instances shared app-wide |
| **Strategy** | `t()` i18n function | Switch between en/sw translations |
| **Optimistic UI** | `toggleLike()` | Update UI first, roll back on error |
| **Cache-Before-Network** | `fetchInitialData()` | Load from localStorage, refresh from API |

---

## 8. External Integrations

| Integration | Method | Purpose |
|---|---|---|
| **Turso (libSQL)** | `@libsql/client` | Edge database, all data persistence |
| **Resend** | REST API via SDK | Transactional emails (order confirmations, password resets) |
| **WhatsApp** | `wa.me` URL redirect | Commerce checkout & negotiation (no API) |
| **ImgBB** | REST API via fetch | Image hosting (⚠ key exposed in frontend) |
| **Vercel Analytics** | `@vercel/analytics` | Page views, user interactions |
| **Vercel Speed Insights** | `@vercel/speed-insights` | Core Web Vitals monitoring |

---

## 9. PWA Architecture

```
main.js
  ├── registerServiceWorker('/sw.js')
  ├── visibilitychange → sw.update()
  └── error listener → chunk-load recovery (page reload)

sw.js
  ├── install → cache ASSETS_TO_CACHE (/, /index.html, /favicon.png, /manifest.json)
  ├── activate → delete old caches, clients.claim()
  └── fetch → navigate: network-first, fallback to /index.html
             → other: cache-first, fallback to network
```

---

## 10. Auth Flow

```
Login:
  handleLogin(email, password)
    → db.runAction('login', { email, password })
    → Server: SELECT user → bcrypt.compare → INSERT session_token → return { user, token }
    → localStorage.setItem('alfie_app_auth_token', token)
    → userData ref updated → localStorage persisted
    → fetchInitialData() called

Signup:
  handleSignUp(data)
    → db.runAction('signup', { ... })
    → Server: validate username, bcrypt.hash, INSERT user, INSERT session_token
    → If supplier: initializeTailorProfile()
    → localStorage.setItem('alfie_app_auth_token', token)
    → Same post-login flow

Password Reset:
  request_password_reset(email)
    → Generate 6-digit OTP
    → INSERT OR REPLACE INTO verification_codes
    → Send via Resend email
    → verify_reset_code(email, code)
    → reset_password(email, code, newPassword)
      → Verify code
      → UPDATE password (bcrypt.hash)
      → DELETE verification_codes
      → DELETE all session_tokens for user (force re-login)

Logout:
  handleLogout()
    → localStorage.removeItem('alfie_app_auth_token')
    → userData reset to guest
    → Router push to /splash
```
