<script setup>
defineEmits(['go-back'])
</script>

<template>
  <div class="document-page">
    <div class="header-row">
      <button class="back-btn" @click="$emit('go-back')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <h1 class="title">Intellectual Property</h1>
    </div>

    <div class="content-scroll">
      <p class="last-updated">Last Updated: May 2026</p>
      
      <h2>1. Artisan Ownership</h2>
      <p>At Alfietz, we believe the creator is the soul of the craft. All designs, patterns, and craftsmanship uploaded by Suppliers remain the **exclusive intellectual property** of the respective artisan or brand. REBi Group does not claim ownership of your unique heritage designs.</p>

      <h2>2. Platform License</h2>
      <p>By uploading content (images, descriptions) to Alfietz, you grant REBi Group a non-exclusive, worldwide, royalty-free license to use, display, and share that content for the sole purpose of promoting your work and the Alfietz platform on social media, marketing materials, and within the app.</p>

      <h2>3. Protection of Designs</h2>
      <p>Users are strictly prohibited from copying, reproducing, or commercially exploiting the designs found on Alfietz without the express written consent of the original creator. We take design "scraping" seriously and will ban users found to be stealing artisan IP.</p>

      <h2>4. Reporting Infringement</h2>
      <p>If you believe your intellectual property has been infringed upon by another user on our platform, please send a detailed "Notice of Infringement" to support@rebigroup.com including:</p>
      <ul>
        <li>A description of the copyrighted work you claim has been infringed.</li>
        <li>The link to the infringing listing on Alfietz.</li>
        <li>Your contact information and proof of ownership.</li>
      </ul>
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
p, li { font-size: 14px; color: var(--text-primary); line-height: 1.6; margin: 0 0 12px 0; }
ul { padding-left: 20px; margin-bottom: 16px; }
strong { color: var(--text-amber); font-weight: 600; }

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