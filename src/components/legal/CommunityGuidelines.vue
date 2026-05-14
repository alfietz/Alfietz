<script setup>
defineEmits(['go-back'])
</script>

<template>
  <div class="document-page">
    <div class="header-row">
      <button class="back-btn" @click="$emit('go-back')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <h1 class="title">Community Guidelines</h1>
    </div>

    <div class="content-scroll">
      <p class="last-updated">Last Updated: May 2026</p>
      
      <p>Alfietz is built on respect, heritage, and genuine craftsmanship. To maintain the integrity of "The Tribe," all users must adhere to these Community Guidelines.</p>

      <h2>1. Authenticity & Heritage</h2>
      <p>Alfietz is dedicated to authentic African heritage crafts and clothing. Suppliers are strictly prohibited from listing mass-produced, counterfeit, or drop-shipped items disguised as handmade goods. We celebrate authentic artisanship.</p>

      <h2>2. Respectful Communication</h2>
      <p>Whether communicating on the platform or via integrated WhatsApp links, all interactions must be professional and respectful. Harassment, hate speech, discrimination, or abusive language toward any Buyer, Supplier, or REBi Group staff will result in immediate account termination.</p>

      <h2>3. Honest Representation</h2>
      <p>Suppliers must accurately photograph and describe their items. Misleading buyers regarding the materials, origin, or production time of an item is a violation of our trust policies.</p>

      <h2>4. Prohibited Items</h2>
      <p>The following items may not be sold on Alfietz:</p>
      <ul>
        <li>Items that violate intellectual property rights (e.g., unauthorized use of trademarked logos).</li>
        <li>Offensive or culturally appropriative materials designed to mock heritage.</li>
        <li>Any illegal goods or services.</li>
      </ul>

      <h2>5. Reporting Violations</h2>
      <p>If you encounter a user or listing that violates these guidelines, please use the Feedback or Help section to report it to the REBi Group moderation team immediately.</p>
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