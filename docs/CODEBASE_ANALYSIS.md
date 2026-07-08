# Codebase Analysis & Research Findings

**Last Updated:** July 08, 2026  
**Project:** Alfietz Heritage Marketplace  
**Total Files:** ~70 source files | **Total Lines:** ~12,000+ | **Tests:** None

---

## 1. Code Quality Assessment

### 1.1 Strengths

| Feature | Location | Why It's Good |
|---|---|---|
| **Proxy API pattern** | `src/db/client.js` | Frontend never exposes Turso credentials |
| **Rate limiting engine** | `api/db.js:28-65` | Atomic SQL upsert, configurable per-action |
| **Session tracking** | `api/db.js:193-253` | Logs IP, device, location; detects location changes |
| **Auto-migration** | `api/db.js:123-190` | Tables auto-created, columns auto-added on deploy |
| **Skeleton loading** | 10+ components | Shimmer placeholders prevent blank screens |
| **Optimistic UI** | `toggleLike()` in App.vue | Instant feedback, rollback on error |
| **Cache-before-network** | `fetchInitialData()` | localStorage cache shown first, API refreshes in background |
| **Chunk-fail recovery** | `main.js:33-38` | Auto-reloads on Vercel deployment hash mismatches |
| **Username validation** | `api/db.js:601-603` | Regex validation + uniqueness check on signup |
| **PWA support** | `main.js`, `sw.js`, `PWAInstallPrompt.vue` | Install prompt, offline caching, visibility resume |

### 1.2 Weaknesses

#### God Components (Single Responsibility Violation)

| File | Lines | Responsibilities |
|---|---|---|
| `App.vue` | 1,081 | State mgmt, auth, data fetching, cart, search, routing, PWA, i18n, toast, navigation, all event wiring |
| `api/db.js` | 1,061 | Auto-migration, rate limiting, session tracking, 28 action handlers, email sending |
| `ProductDetails.vue` | 1,764 | Product display, image gallery, color/size selection, reviews, order/negotiation dialogs, WhatsApp |
| `TailorDetails.vue` | 1,324 | Profile display, inline editing, case study, services CRUD, contact mgmt, product grid, reviews |

**Why It Matters:** These files are impossible to unit test, hard to reason about, and prone to merge conflicts. A change to any single feature requires touching the god component, risking regressions in unrelated features.

**Fix:** Decompose into composable functions or Pinia stores. Extract UI patterns into smaller components.

#### Code Duplication

| Duplicated Code | Files |
|---|---|
| **Phone number normalization** | `App.vue:821-828`, `ProductDetails.vue:279-285`, `TailorDetails.vue:397-403`, `Cart.vue` |
| **ImgBB upload logic** | `UploadWork.vue:119-140`, `EditProfile.vue:23-49` |
| **CREATE TABLE SQL** | `init-db.js`, `api/db.js:123-190` (with slight variations) |
| **CSS utility classes** | `TailorDetails.vue` has ~150 lines of hand-written `.flex`, `.text-sm`, `.w-full` |
| **Error handling boilerplate** | Every `handle*` function in App.vue wraps `db.runAction` in try/catch |

**Fix:** Extract phone formatting to a utility file (`src/utils.js`). Create a shared image upload composable. Move schema to a shared file.

#### Console Logging in Production

The codebase has 100+ `console.log`/`console.error` statements in production code:

```js
// router/index.js:58
console.log(`[Router] Navigating to: ${to.name}`, to.params);

// App.vue:158
console.log(`[NavigateTo] Target: ${screenName}`, extraState);

// api/db.js (countless places)
console.log(`[AUTH] Password reset OTP for ${params.email}: ${otp}`);

// api/db.js:920 (CRITICAL - OTP exposure)
```

**Fix:** Implement a proper logging utility that respects `NODE_ENV`. Strip console.log in production via a Vite plugin (`vite-plugin-remove-console`).

#### Magic Strings

Route names, action names, localStorage keys are hardcoded throughout:
- Route names: `'product-details'`, `'tailor-details'`, `'home'`
- Action names: `'get_initial_data'`, `'toggle_like'`, `'create_order'`
- localStorage keys: `'alfie_app_user_data'`, `'alfie_app_cart_items'`

**Fix:** Define all as constants/enums in dedicated files.

---

## 2. Performance Analysis

### 2.1 Bottlenecks

#### No Pagination
Products are fetched with `LIMIT 50` in a single query. As the database grows:
- Initial load time increases linearly
- Memory usage grows on the client
- localStorage may hit the ~5MB limit

**Fix:** Implement cursor-based pagination. Fetch only the first page, load more on scroll or "Load More" click.

#### JSON.stringify Deep Comparison
`fetchInitialData()` uses `JSON.stringify()` for change detection on every data set:

```js
if (JSON.stringify(newAllProducts) !== JSON.stringify(allProducts.value)) {
  allProducts.value = newAllProducts;
}
```

This serializes/deserializes the entire product list (50 items) 5+ times on every data refresh.

**Fix:** Use a simple checksum (e.g., `JSON.stringify` once into a hash) or compare lengths + first/last item IDs.

#### No Search Debouncing
Search fires on `@keyup.enter` but has no debounce. Rapid typing could:
- Fire multiple unnecessary API calls
- Display stale results from earlier (out-of-order) responses
- Waste rate limit budget

**Fix:** Implement debounce (300ms) and abort previous in-flight requests:

```js
const debouncedSearch = debounce(handleSearch, 300);
let abortController = new AbortController();
```

#### Giant Props on `<router-view>`
Every routed component receives 20+ props, most of which it doesn't use. This causes unnecessary reactive updates.

**Fix:** Use `provide/inject` for global data, or switch to Pinia which has built-in reactivity tracking.

#### localStorage as Primary Cache
Large JSON blobs are stored in localStorage:
- Synchronous reads/writes block the main thread
- 5MB limit per origin
- No TTL/expiry mechanism (stale data persists forever)

**Fix:** Consider IndexedDB for large datasets. Add TTL to cache entries.

### 2.2 Network Performance

| Issue | Impact | Fix |
|---|---|---|
| Single serverless function | Cold starts affect all operations | Split into per-domain functions (auth, products, orders) |
| No HTTP caching headers | API responses not cached by browser/CDN | Add `Cache-Control` headers to GET-like actions |
| No request batching | Multiple sequential API calls on load | Batch `get_initial_data` into a single query |
| No compression | Large JSON payloads | Enable Vercel compression or use Brotli |

---

## 3. Error Handling Analysis

### 3.1 Current Pattern

```js
// App.vue pattern (used ~30 times):
const handleSomeAction = async (data) => {
  try {
    const res = await db.runAction('action_name', data)
    // success handling
  } catch (e) {
    console.error('Action Error:', e)
    showToast(e.message || 'Something went wrong', 'error')
  }
}
```

### 3.2 Issues Found

| Issue | Example Location | Impact |
|---|---|---|
| **Silent failures** | `api/db.js:176-183` migration `.catch(() => {})` | Failing migrations go unnoticed |
| **Error message leaks** | `showToast(e.message || 'Login failed...')` | Internal errors shown to users |
| **Inconsistent patterns** | Some functions `return null`, some `throw`, some just `console.error` | Hard to predict behavior |
| **Missing input validation** | `api/db.js:111` `const { action, params } = req.body || {}` | Malformed requests crash with 500 |
| **Missing response validation** | `middleware.js:49` `data?.results?.[0]?.response?.result?.rows?.[0]` (uses `?.`) but other places don't check | Random `cannot read property of undefined` errors |

### 3.3 Best Practice References

- [Node.js Error Handling Best Practices](https://stackoverflow.com/questions/7310521/node-js-best-practice-exception-handling)
- [Vue 3 Error Handling Patterns](https://stackoverflow.com/questions/71092553/vue-3-global-error-handling)
- [OWASP Error Handling Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Error_Handling_Cheat_Sheet.html)

---

## 4. Edge Cases & Gaps

### 4.1 Network Offline
- No offline detection via `navigator.onLine` or `online`/`offline` events
- API calls fail with opaque errors when offline
- Service worker doesn't cache API responses

**Fix:** Add a global network status watcher. Show offline banner. Cache last-known-good data.

### 4.2 Concurrent Operations
- Two users liking the same product simultaneously can cause race conditions on `likes_count`
- No optimistic concurrency control for profile updates (last-write-wins)

**Fix:** Use `UPDATE ... SET likes_count = likes_count + 1` (atomic increment) instead of read-then-write.

### 4.3 XSS in User Content
- User names, descriptions, reviews rendered without sanitization
- Some places use `v-html` with user content
- Avatar URLs not validated — could be `javascript:` protocol

**Fix:** Use text interpolation `{{ }}` as default. For HTML content, use DOMPurify. Validate URLs with `new URL()`.

### 4.4 Stale Data After Logout
- localStorage retains `all_products_cache`, `trending_products_cache`, `categories_cache` etc. after logout
- Session tokens not invalidated on password reset (old tokens still valid until expiry)

**Fix:** Clear all `alfie_app_*` keys on logout. Delete all session_tokens for user on password reset.

### 4.5 Phone Number Normalization
The whatsapp URL construction handles a few formats:
```js
// App.vue:821-828
let phone = whatsapp.replace(/[^0-9]/g, '');
if (phone.startsWith('0')) phone = '255' + phone.slice(1);
if (!phone.startsWith('255')) phone = '255' + phone;
```

**Issues:**
- Numbers with `+` followed by non-255 prefixes (e.g., `+254...` for Kenya) would get `255` prepended, breaking the link
- No validation that the result is a valid phone number
- Space/dash handling inconsistent

**Fix:** Use a phone number parsing library (`libphonenumber-js`). Show a preview of the WhatsApp URL before redirecting.

---

## 5. Testing Analysis

**Current State:** Zero tests. No test framework. No CI pipeline.

### 5.1 Untestable Architecture

The monolithic App.vue and giant switch-statement API handler make unit testing practically impossible:

```js
// What would a test for handleLogin look like?
// It would need to mock:
// - db.runAction
// - localStorage
// - router.push
// - userData ref
// - showToast
// - fetchInitialData
// - 5+ other refs
```

### 5.2 Recommended Testing Strategy

| Layer | Framework | What to Test |
|---|---|---|
| **Unit (Composables)** | Vitest | Extracted business logic, data transformations |
| **Component** | Vitest + @vue/test-utils | Individual component rendering and interactions |
| **API (Integration)** | Vitest + fetch-mock | Each api/db.js action with mocked DB |
| **E2E** | Playwright | Critical user flows: signup → browse → add to cart → checkout |
| **Visual** | Storybook + Chromatic | UI component states (loading, empty, error, populated) |

### 5.3 First Testable Milestones

1. Extract `phoneNumber` formatting to `src/utils.js` → write tests for 5+ phone formats
2. Extract `cartItems` logic (group by tailor, calculate totals) → write tests
3. Extract `t()` translation function → write tests for en/sw key lookup
4. Write API tests for `search`, `login`, `signup` with mocked DB

---

## 6. Type Safety Analysis

### 6.1 Current State
- **No TypeScript** — plain JavaScript throughout
- **No JSDoc** — most functions lack any type documentation
- **No runtime validation** — API parameters not validated for type/correctness
- **Vue prop validation** — most use `type: Array` or `type: Object` with no deep validation
- **Inconsistent null handling** — some places use `?.` optional chaining, others don't

### 6.2 Examples of Type-Related Bugs

```js
// api/db.js:287-289 - params.userId could be string, number, or undefined
if (params.userId && currentUserId !== 'guest' && params.userId !== currentUserId) {
  // If params.userId is "undefined" (string), this passes incorrectly
}

// App.vue:166-168 - no check that selectedProduct has an id
if (!extraState.selectedProduct.id) {
  // Could crash if selectedProduct is null or a different shape
}
```

### 6.3 Migration Path

1. Add JSDoc to all functions and props (quick win, no build step)
2. Add `vue-ts` and start migrating components to TypeScript (`.vue` files with `<script lang="ts">`)
3. Add Zod or Joi for runtime API parameter validation
4. Enable strict null checks from the start

---

## 7. Community Best Practices References

### Security
- [OWASP Top 10 - 2021](https://owasp.org/www-project-top-ten/)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)
- [Vue.js Security Best Practices](https://vuejs.org/guide/best-practices/security.html)
- [Turso Security Docs](https://docs.turso.tech/reference/security)
- Common issue on StackOverflow: "How to securely store API keys in Vue.js" — answer: use a proxy server, never embed in frontend

### Performance
- [Vue.js Performance Best Practices](https://vuejs.org/guide/best-practices/performance.html)
- [Vite Performance Optimization](https://vite.dev/guide/performance)
- [Web Vitals Optimization Guide](https://web.dev/learn-core-web-vitals/)
- Common issue on StackOverflow: "localStorage vs IndexedDB for large datasets" — answer: IndexedDB for >1MB structured data

### Architecture
- [Vue 3 Composition API Style Guide](https://vuejs.org/style-guide/)
- [Pinia vs Vuex vs Provide/Inject](https://stackoverflow.com/questions/71479806/pinia-vs-provide-inject-vs-vuex-in-vue-3)
- [Clean Architecture for Vue Apps](https://github.com/sandwichnosh/vue-clean-architecture)
- Common issue on StackOverflow: "How to structure large Vue 3 apps without Pinia" — answer: extract business logic into composables, use provide/inject for true globals

### Testing
- [Vue Testing Handbook](https://vue-testing-handbook.com/)
- [Vitest Getting Started](https://vitest.dev/guide/)
- [Playwright for E2E Testing](https://playwright.dev/docs/intro)
- Common issue on StackOverflow: "Testing Vue 3 components with Composition API" — answer: export composables separately, test them in isolation

---

## 8. Technical Debt Summary

| Item | Effort | Impact | Priority |
|---|---|---|---|
| SQL injection in middleware.js | 2 hours | CRITICAL | **P0** |
| Credentials in git history | 4 hours | CRITICAL | **P0** |
| Hardcoded API keys in frontend | 3 hours | HIGH | **P0** |
| Plaintext password fallback | 30 min | HIGH | **P0** |
| Weak session token generation | 30 min | HIGH | **P0** |
| OTP logging | 5 min | HIGH | **P0** |
| God component decomposition | 2 weeks | MEDIUM | P1 |
| Switch to Pinia | 1 week | MEDIUM | P1 |
| Add pagination | 3 days | MEDIUM | P1 |
| Add TypeScript | 4 weeks | LOW | P2 |
| Add test framework + first tests | 2 weeks | MEDIUM | P1 |
| Remove 100+ console.log statements | 1 day | LOW | P2 |
| Add search debouncing | 2 hours | LOW | P2 |
| Extract constants from magic strings | 1 day | LOW | P2 |
| Implement proper CORS | 30 min | MEDIUM | P1 |
