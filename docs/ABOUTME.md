# ABOUTME - Alfietz (African Heritage Crafts Marketplace)

**Last Updated:** July 08, 2026

---

## Abstract

Alfietz is a modern, responsive marketplace PWA built with **Vue 3** and **Vite**, dedicated to promoting African heritage crafts and bespoke fashion. It bridges the gap between skilled artisans (Suppliers/Tailors) and enthusiasts (Buyers), providing a platform for discovery, interaction, and WhatsApp-based commerce.

**Stack:** Vue 3 (Composition API) + Vite 8 + Turso (libSQL) + Vercel Serverless + Resend
**Live URL:** https://alfietz.shop
**Deployment:** Vercel (Edge + Serverless Functions)

---

## Achievements

- **Complete Navigation Flow:** 46 routes covering the full user journey (auth, marketplace, profiles, chat, legal)
- **Multi-Role Architecture:** Dynamic interface switching for Buyers and Tailors/Suppliers
- **Turso Database Integration:** Real-time edge database with auto-migration (16 tables)
- **Modern Routing:** Vue Router 5 with lazy-loading, smooth scroll, and pre-fetching
- **i18n:** English (en) and Swahili (sw) with localStorage-persisted language choice
- **WhatsApp Commerce:** Direct-to-artisan communication with smart number normalization
- **PWA Support:** Service worker caching, install prompt, standalone mode detection
- **SEO Optimization:** Vercel Edge Middleware for social media OG tags, JSON-LD schema injection
- **Session Tracking:** IP, device, location logging with geo-change detection
- **Rate Limiting:** Per-IP and per-action rate limiting on auth endpoints
- **Optimistic UI:** Instant like/favorite feedback with server rollback

---

## Architecture Overview

```
Client (Vue 3 SPA) <-> Vercel Edge (SEO Middleware)
        |
        +-- POST /api/db -> Vercel Serverless (api/db.js) -> Turso DB
                              |
                              +-- Resend (Email)
```

**State Management:** Centralized refs in App.vue (1081 lines), passed via props to 56 child components. No Pinia/Vuex.

**Backend:** Single serverless function (1061 lines) with Command pattern action dispatcher (~28 actions), auto-migration, session management, and rate limiting.

See `docs/ARCHITECTURE.md` for detailed diagrams.

---

## Strengths

- **Proxy API Pattern:** Frontend never exposes Turso credentials (src/db/client.js -> api/db.js)
- **Auto-Migration:** Tables and columns auto-created on deploy -- zero manual migration steps
- **Skeleton Loading:** Every data-driven component has shimmer/placeholder states
- **Chunk-Fail Recovery:** Auto-reloads on Vercel deployment hash mismatches (main.js:33-38)
- **Username Validation:** Strict regex + uniqueness check on signup
- **Cache-Before-Network:** localStorage cache shown first, API refreshes in background
- **Responsive Design:** Mobile-first with bottom nav, desktop WebHeader
- **Brand Consistency:** "Heritage" and "Tribe" motif throughout UI
- **Dark/Light Theme:** CSS Custom Properties with localStorage persistence

---

## Weaknesses & Critical Issues

### CRITICAL Security

| Issue | Location | Severity |
|---|---|---|
| SQL injection in Edge Middleware | middleware.js:31-36 | CRITICAL |
| Live credentials committed to git | .env | CRITICAL |
| Hardcoded API key in frontend bundle | UploadWork.vue:16, EditProfile.vue:19 | HIGH |
| Plaintext password fallback | api/db.js:559 | HIGH |
| Weak session token (Math.random) | api/db.js:571,614 | HIGH |
| OTP logged to console | api/db.js:920 | HIGH |
| CORS Allow-Origin wildcard | api/db.js:70 | MEDIUM |

**See `docs/SECURITY.md` for full details and remediation steps.**

### Code Quality

- **God Components:** App.vue (1081 lines), api/db.js (1061 lines), ProductDetails.vue (1764 lines), TailorDetails.vue (1324 lines)
- **Code Duplication:** Phone normalization in 4+ files, ImgBB upload in 2 files, CREATE TABLE SQL in 2+ files
- **Magic Strings:** Route names, action names, and localStorage keys hardcoded everywhere
- **Console.log:** 100+ statements in production code
- **No TypeScript:** Plain JavaScript with no type safety
- **Zero Tests:** No test framework, no CI pipeline

### Performance

- No pagination (limit 50 on all queries)
- JSON.stringify deep comparison for change detection
- No search debouncing
- localStorage used as primary cache (~5MB limit)
- Giant props on <router-view> cause unnecessary re-renders

### Edge Cases

- No offline detection or graceful degradation
- No XSS sanitization on user content
- Stale data persists after logout
- Race conditions on concurrent operations
- Phone normalization handles Tanzanian numbers but may break other formats

---

## Roadmap (Prioritized)

### P0 -- Critical (Address Immediately)
1. Fix SQL injection in middleware.js
2. Rotate all credentials (Turso, Resend, ImgBB)
3. Remove .env from git history
4. Move API keys to server-side only
5. Replace Math.random() with crypto.randomBytes()
6. Remove plaintext password fallback
7. Remove OTP logging
8. Restrict CORS to specific origins

### P1 -- High Priority (Next Sprint)
1. Add rate limiting to all protected API actions
2. Decompose App.vue into composables/Pinia stores
3. Add input sanitization for user content (XSS prevention)
4. Add search debouncing and request cancellation
5. Add pagination to product/seller queries
6. Add offline detection and graceful degradation
7. Remove .env from git history (BFG repo-cleaner)
8. Add first unit tests for utility functions

### P2 -- Medium Term
1. Migrate state to Pinia for modularity
2. Add TypeScript incrementally
3. Implement in-app messaging (Heritage Chat) to reduce WhatsApp dependency
4. Integrate payment gateway (Stripe/Flutterwave) with escrow
5. Replace Image hosting with dedicated blob storage (Vercel Blob/S3)
6. Add proper E2E testing with Playwright
7. Implement Content Security Policy headers
8. Regular dependency auditing and updates

---

## Component Inventory

| Directory | Count | Key Components |
|---|---|---|
| layout/ | 13 | AppBar, WebHeader, NavigationBar, Splash, ErrorPage, LoadingSpinner, SkeletonLoader, PWAInstallPrompt, BaseDialog, BrandBanner, EditableImage, EditableText, SectionHeader |
| auth/ | 5 | Login, SignUp, ForgotPassword, VerifyCode, ResetPassword |
| shop/ | 13 | Home, ProductCard, ProductDetails, TailorDetails, SellerCard, CategoryCard, CategoryList, ExploreMore, SearchPage, SearchResults, EmptySearch, Cart, UploadWork |
| profile/ | 10 | Profile, EditProfile, Settings, TailorConsole, Orders, FavoritesList, EmptyFavorites, Notifications, AppReview, LogoutDialog |
| communication/ | 8 | ChatList, ChatDetail, ReviewsList, WriteReview, Feedback, FeedbackSuccessDialog, Help, HeritageStories |
| legal/ | 8 | AboutUs, PrivacyPolicy, TermsConditions, ReturnPolicy, CommunityGuidelines, SafetyTips, MeasurementGuide, IPPolicy |

**Total Components:** 56 (including App.vue)

---

## Key Files at a Glance

| File | Lines | Role |
|---|---|---|
| api/db.js | 1,061 | Backend: all DB operations, auth, email |
| src/App.vue | 1,081 | Frontend: all state, handlers, navigation |
| src/components/shop/ProductDetails.vue | 1,764 | Product display, gallery, reviews, orders |
| src/components/shop/TailorDetails.vue | 1,324 | Profile display, services, portfolio |
| src/db/client.js | 94 | Secure DB proxy client |
| src/router/index.js | 88 | All routes + navigation guard |
| src/translations.js | 548 | i18n (en + sw) |
| middleware.js | 96 | Vercel Edge SEO middleware |
| public/sw.js | 49 | PWA Service Worker |
| src/style.css | ~500 | Global CSS theme |

---

## Documentation Index

| File | What It Covers |
|---|---|
| ARCHITECTURE.md | System diagrams, data flow, component tree, DB schema, design patterns |
| SECURITY.md | All vulnerabilities with line numbers, remediation steps, production checklist |
| CODEBASE_ANALYSIS.md | Deep code quality assessment, performance analysis, community best practices |
| DEVELOPER_GUIDE.md | Setup, conventions, how-tos, deployment, known quirks |
| ABOUTME.md | (This file) Overview, strengths, weaknesses, roadmap |
