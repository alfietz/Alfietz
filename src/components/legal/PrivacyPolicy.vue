<script setup>
defineEmits(['go-back'])
</script>

<template>
  <div class="document-page">
    <div class="header-row">
      <button class="back-btn" @click="$emit('go-back')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <h1 class="title">Privacy Policy</h1>
    </div>

    <div class="content-scroll">
      <p class="last-updated">Last Updated: May 2026</p>

      <h2>1. Introduction</h2>
      <p>Welcome to the Alfietz App, operated by the <strong>REBi Group</strong>. We are committed to protecting the privacy and security of our users. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile and web applications.</p>

      <h2>2. Information We Collect</h2>
      <p>We may collect the following types of information:</p>
      <ul>
        <li><strong>Personal Identification Data:</strong> Name, email address, WhatsApp number, and account credentials.</li>
        <li><strong>Sensitive/Measurement Data:</strong> For custom clothing orders, we collect physical measurements. This data is treated with the highest level of confidentiality.</li>
        <li><strong>Transaction Data:</strong> Order history, favorite items, and communication records via the platform.</li>
        <li><strong>Device & Usage Data:</strong> IP addresses, browser types, device identifiers, and interactions with the App, collected via local storage and basic analytics.</li>
      </ul>

      <h2>3. How We Use Your Information</h2>
      <p>Your data is used to:</p>
      <ul>
        <li>Create and manage your account.</li>
        <li>Facilitate communication between Buyers and Suppliers (e.g., generating WhatsApp links).</li>
        <li>Provide customized tailoring services by sharing necessary measurements securely with selected tailors.</li>
        <li>Improve our Platform, resolve technical issues, and detect fraud.</li>
      </ul>

      <h2>4. Data Sharing & Disclosure</h2>
      <p>We do not sell your personal data to third parties. We may share your information only in the following circumstances:</p>
      <ul>
        <li><strong>With Suppliers:</strong> When a Buyer initiates an order, necessary contact and measurement data is shared with the specific Supplier.</li>
        <li><strong>Legal Compliance:</strong> If required by law, subpoena, or to protect the rights, property, or safety of REBi Group, our users, or others.</li>
        <li><strong>Service Providers:</strong> With trusted third-party vendors who assist in operating our platform (e.g., Turso database hosting), under strict confidentiality agreements.</li>
      </ul>

      <h2>5. Cookies & Local Storage</h2>
      <p>Alfietz relies on local storage (e.g., <code>localStorage</code>) to maintain your session, theme preferences, and localized settings. By using the app, you consent to the use of these essential local storage mechanisms. We may use cookies in the future for analytics, for which separate consent will be requested.</p>

      <h2>6. Data Security</h2>
      <p>We implement robust technical and organizational measures to secure your personal data against unauthorized access, loss, or alteration. However, no electronic transmission over the internet or information storage technology can be guaranteed to be 100% secure.</p>

      <h2>7. Your Privacy Rights</h2>
      <p>Depending on your jurisdiction, you may have the right to access, correct, update, or delete your personal data. You can manage your profile within the App or contact us to exercise these rights.</p>

      <h2>8. Contact Us</h2>
      <p>For any questions regarding this Privacy Policy or your data, please contact the REBi Group legal team via our Help and Support channels.</p>
    </div>
  </div>
</template>

<style scoped>
.document-page { background-color: var(--wood-deep); min-height: 100vh; padding: 24px 20px; display: flex; flex-direction: column; }
.header-row { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; flex-shrink: 0; }
.title { font-size: 22px; font-weight: 600; color: var(--text-primary); margin: 0; }
.content-scroll { flex: 1; overflow-y: auto; padding-bottom: 40px; }
.last-updated { font-size: 13px; color: var(--text-muted); margin-bottom: 24px; font-style: italic; }
h2 { font-size: 16px; font-weight: 600; color: var(--text-amber); margin: 24px 0 8px 0; }
p { font-size: 14px; color: var(--text-primary); line-height: 1.6; margin: 0 0 16px 0; }
ul { padding-left: 20px; margin-bottom: 16px; }
li { font-size: 14px; color: var(--text-primary); line-height: 1.6; margin-bottom: 8px; }
strong { color: var(--text-amber); font-weight: 600; }
code { background: rgba(0,0,0,0.2); padding: 2px 4px; border-radius: 4px; font-family: monospace; }

.back-btn {
  background-color: var(--wood-walnut) !important;
  border: 1px solid var(--glass-border) !important;
  color: var(--text-primary) !important;
  transition: all 0.2s ease !important;
}

.back-btn:hover {
  background-color: var(--wood-polished) !important;
  border-color: var(--accent-amber) !important;
}

.back-btn {
  background-color: var(--wood-walnut) !important;
  border: 1px solid var(--glass-border) !important;
  color: var(--text-primary) !important;
  transition: all 0.2s ease !important;
}

.back-btn:hover {
  background-color: var(--wood-polished) !important;
  border-color: var(--accent-amber) !important;
}
</style>