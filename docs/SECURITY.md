# Security Analysis & Remediation Guide

**Last Updated:** July 08, 2026  
**Project:** Alfietz Heritage Marketplace  
**Classification:** INTERNAL — Do Not Share This Document Publicly

---

## CRITICAL VULNERABILITIES

### 1. SQL Injection in Vercel Edge Middleware

**File:** `middleware.js:31-36`  
**Severity:** CRITICAL  
**CVSS Score:** ~9.8 (AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H)

```js
// VULNERABLE: String interpolation of URL params directly into SQL
let sql = '';
if (type === 'product') {
  sql = `SELECT name, description, image FROM products WHERE id = '${id}'`;
}
```

**Impact:** An attacker can craft URLs like `/product/1' OR '1'='1` or `/product/1' UNION SELECT ...` to extract the entire database contents (users, passwords, orders, session tokens).

**Root Cause:** The `id` and `username` values come from `url.pathname.split('/')` — user-controlled path parameters. These are interpolated directly into SQL without sanitization or parameterization.

**Remediation (Immediate):** Replace string interpolation with parameterized queries using the fetch API Turso expects:

```js
const response = await fetch(`${tursoUrl}/v1/execute`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${tursoToken}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    statements: [{
      q: 'SELECT name, description, image FROM products WHERE id = ?',
      params: { args: [id] }
    }],
  }),
});
```

**Alternative (Safer):** Don't query Turso directly from Edge Middleware at all. Instead, use Vercel Edge Config or a KV store to cache OG tag data, or proxy through the serverless function.

---

### 2. Production Credentials Committed to Git

**File:** `.env` (tracked in git)  
**Severity:** CRITICAL

The `.env` file contains LIVE credentials:
- **Turso JWT Token:** Full read/write to the production database (`<REDACTED>`)
- **Resend API Key:** Can send emails as `info@alfietz.shop` (`<REDACTED>`)

**Impact:** Anyone with access to the repo (or the git history) can:
- Execute arbitrary SQL against the production Turso database
- Send phishing emails appearing to come from `info@alfietz.shop`
- Access/modify/delete all user data including password hashes, orders, and contact information

**Remediation:**
1. **IMMEDIATELY** rotate both credentials:
   - Create a new Turso auth token in the Turso dashboard
   - Create a new Resend API key in the Resend dashboard
2. Remove `.env` from git tracking:
   ```bash
   git rm --cached .env
   ```
   (Add `.env` to `.gitignore` — it should already be there)
3. Purge the token from git history:
   ```bash
   # For GitHub, use: gh secret set TURSO_AUTH_TOKEN < new-token
   # AND use BFG Repo-Cleaner or git-filter-repo to remove the historical file
   ```
4. Set credentials as Vercel Environment Variables (not a file in repo)

---

### 3. Hardcoded ImgBB API Key in Frontend Bundle

**Files:** `src/components/shop/UploadWork.vue:16`, `src/components/profile/EditProfile.vue:19`  
**Severity:** HIGH

```js
const IMGBB_API_KEY = '<REDACTED>'
```

**Impact:** This key is compiled into the production JavaScript bundle. Anyone who opens browser DevTools can extract it and:
- Upload images to your ImgBB account (potentially abusive content)
- Incur API usage costs
- The key could be revoked by ImgBB, breaking image upload functionality

**Remediation:**
1. Revoke this key in the ImgBB dashboard
2. Create a server-side proxy for image uploads in `api/db.js` or a new serverless function
3. The frontend sends the image to the server, which uses the key and returns the URL
4. Never embed API keys in frontend code

**Example server-side endpoint:**
```js
// In api/upload.js (new serverless function)
export default async function handler(req, res) {
  const formData = new FormData();
  formData.append('image', req.body.image);
  const imgbbRes = await fetch(`https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`, {
    method: 'POST', body: formData
  });
  const data = await imgbbRes.json();
  res.json({ url: data.data.url });
}
```

---

### 4. Plaintext Password Fallback

**File:** `api/db.js:556-560`  
**Severity:** HIGH

```js
try {
  passMatch = await bcrypt.compare(params.password, sanitize(user.password));
} catch (e) {
  passMatch = params.password === sanitize(user.password); // FALLBACK TO PLAINTEXT
}
```

**Impact:** If `bcrypt.compare()` throws an error (malformed hash, version mismatch, etc.), passwords are compared as plaintext. An attacker could:
- Log in with any password if they can trigger the bcrypt error
- Brute-force passwords more easily

**Remediation:**
```js
try {
  passMatch = await bcrypt.compare(params.password, sanitize(user.password));
} catch (e) {
  console.error('bcrypt comparison failed:', e);
  // NEVER fall back to plaintext comparison
  passMatch = false;
  // Option: trigger password reset flow
}
```

---

## HIGH SEVERITY VULNERABILITIES

### 5. Weak Session Token Generation

**File:** `api/db.js:571,614`  
**Severity:** HIGH

```js
const sessionToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
```

**Impact:** `Math.random()` is not cryptographically secure. Combined with known timestamp patterns, tokens are predictable. An attacker who observes a few tokens can:
- Predict future tokens
- Hijack user sessions
- Forge authentication

**Remediation:**
```js
import crypto from 'crypto';
const sessionToken = crypto.randomBytes(32).toString('hex');
```

---

### 6. Password Reset OTP Logged to Console

**File:** `api/db.js:920`  
**Severity:** HIGH

```js
console.log(`[AUTH] Password reset OTP for ${params.email}: ${otp}`);
```

**Impact:** In Vercel production, `console.log` output is captured in server logs. Anyone with Vercel dashboard access (or if logs are shipped to a third-party service) can see user OTP codes and reset any user's password.

**Remediation:** Remove this log statement entirely.

---

### 7. OTP Returned in Production

**File:** `api/db.js:922-926`  
**Severity:** HIGH

```js
customResponse = { 
  success: true, 
  message: "Verification code sent to your email.",
  code: process.env.NODE_ENV === 'development' ? otp : undefined 
};
```

**Issue:** In Vercel, `NODE_ENV` may not be set to `'development'` even in dev, so it *might* be safe. But if someone sets `NODE_ENV=development` in production (e.g., for debugging), OTPs leak in API responses.

**Remediation:** Never return the code in API responses. Use a different mechanism (like checking a `VERCEL_ENV` or `VERCEL_GIT_COMMIT_REF` header) if dev-mode debugging is needed.

---

## MEDIUM SEVERITY VULNERABILITIES

### 8. Overly Permissive CORS

**File:** `api/db.js:70`  
**Severity:** MEDIUM

```js
res.setHeader('Access-Control-Allow-Origin', '*');
```

**Impact:** Any website can make authenticated requests to the API if a user has a valid session. Combined with weak token generation, this expands the attack surface.

**Remediation:** Restrict to known origins:
```js
const allowedOrigins = ['https://alfietz.shop', 'http://localhost:5173'];
const origin = req.headers.origin;
if (allowedOrigins.includes(origin)) {
  res.setHeader('Access-Control-Allow-Origin', origin);
}
```

---

### 9. XSS Surface in User Content

**Files:** Multiple components (User names, descriptions, reviews, product names)  
**Severity:** MEDIUM

**Issue:** User-generated content (names, bios, product descriptions, review text) is rendered using `v-html` in some places or interpolated without sanitization.

**Remediation:**
- Default to `{{ }}` (text interpolation) which Vue auto-escapes
- Never use `v-html` with user content
- If HTML is needed, use a sanitization library like DOMPurify
- Validate and sanitize on the server side before storage

---

### 10. No Rate Limiting on Protected Actions

**File:** `api/db.js`  
**Severity:** MEDIUM

**Issue:** Rate limiting only applies to auth endpoints (login, signup, verify code). Protected actions like `create_product`, `update_profile`, `send_message` have no rate limits. An attacker with a valid session can:
- Mass-create spam products
- Send bulk messages
- Brute-force iterate through user IDs

**Remediation:** Add per-user and per-action rate limits for all protected endpoints.

---

## SECURITY CHECKLIST FOR PRODUCTION

### Pre-Deployment Checklist

- [ ] Rotate all credentials (Turso token, Resend key, ImgBB key)
- [ ] Remove `.env` from git tracking and history
- [ ] Set all credentials as Vercel Environment Variables
- [ ] Fix SQL injection in `middleware.js`
- [ ] Remove plaintext password fallback
- [ ] Replace `Math.random()` with `crypto.randomBytes()` for session tokens
- [ ] Remove OTP console.log
- [ ] Restrict CORS to specific origins
- [ ] Add rate limiting to all protected API actions
- [ ] Remove/disable `console.log` statements in production code (100+ occurrences)
- [ ] Replace `v-html` with text interpolation for user content
- [ ] Add input sanitization for all user-submitted text

### Ongoing Security Practices

- [ ] Dependency vulnerability scanning (`npm audit` weekly)
- [ ] Set up Vercel Security Headers (CSP, HSTS, X-Frame-Options)
- [ ] Implement Content Security Policy headers
- [ ] Add a `SECURITY.md` file to the repo root for vulnerability disclosure
- [ ] Regular credential rotation (every 90 days)
- [ ] Monitor Vercel Function logs for suspicious activity
- [ ] Add a webhook for failed login attempts and rate limit triggers

---

## References

- [OWASP Top 10 Web Application Security Risks](https://owasp.org/www-project-top-ten/)
- [OWASP SQL Injection Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)
- [Vercel Security Documentation](https://vercel.com/security)
- [Turso Security Best Practices](https://docs.turso.tech/reference/security)
- [Node.js Crypto Documentation](https://nodejs.org/api/crypto.html)
- [DOMPurify - XSS Sanitization](https://github.com/cure53/DOMPurify)
