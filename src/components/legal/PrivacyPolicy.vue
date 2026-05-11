<!-------- (PrivacyPolicy.vue) ./src/components/PrivacyPolicy.vue ------------>
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
      <p class="last-updated">Last Updated: October 2024</p>

      <h2>1. Introduction</h2>
      <p>Welcome to the Alfie App, operated by the <strong>REBi Group</strong>. We respect your privacy and are committed to protecting the personal data of both our esteemed clothes makers and our valued clients.</p>

      <h2>2. Information We Collect</h2>
      <p>To seamlessly link designers with clients, we collect necessary profile information including names, contact details, physical measurements (for clients), and portfolio images (for clothes makers).</p>

      <h2>3. How We Use Your Data</h2>
      <p>Your data is used strictly to facilitate competitive and high-quality clothing design. Client measurements are shared securely only with selected tailors to ensure the perfect fit.</p>

      <h2>4. Data Security</h2>
      <p>REBi Group utilizes industry-standard security protocols to protect your personal and financial information during transactions and communication.</p>

      <h2>5. Contact Us</h2>
      <p>If you have any questions regarding your data privacy, please contact the REBi Group support team through the Help Center.</p>
    </div>
  </div>
</template>

<style scoped>
.document-page { background-color: var(--wood-deep); min-height: 100vh; padding: 24px 20px; display: flex; flex-direction: column; }
.header-row { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; flex-shrink: 0; }
.title { font-size: 22px; font-weight: 600; color: var(--text-primary); margin: 0; }

.content-scroll { flex: 1; overflow-y: auto; padding-bottom: 40px; }
.last-updated { font-size: 13px; color: var(--text-muted); margin-bottom: 24px; font-style: italic; }
h2 { font-size: 16px; font-weight: 600; color: var(--text-primary); margin: 24px 0 8px 0; }
p { font-size: 14px; color: var(--text-primary); line-height: 1.6; margin: 0 0 16px 0; }
strong { color: var(--text-amber); }
</style>