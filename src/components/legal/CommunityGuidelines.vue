<!-------- (CommunityGuidelines.vue) ./src/components/legal/CommunityGuidelines.vue ------------>
<script setup>
defineEmits(['go-back'])
</script>

<template>
  <div class="document-page pattern-heritage animate-fade">
    <div class="header-row">
      <button class="back-btn" @click="$emit('go-back')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <h1 class="title">Community Guidelines</h1>
    </div>

    <div class="content-scroll">
      <p class="last-updated">Last Updated: May 2026</p>
      
      <p>Alfietz is built on respect, heritage, and genuine craftsmanship. To maintain the integrity of "The Tribe," all users must adhere to these Community Guidelines.</p>

      <h2>1. Authenticity & Heritage</h2>
      <p>Alfietz is dedicated to authentic African heritage crafts and clothing. Suppliers are strictly prohibited from listing mass-produced, counterfeit, or drop-shipped items disguised as handmade goods. We celebrate authentic artisanship.</p>

      <h2>2. Respectful Communication</h2>
      <p>Whether communicating on the platform or via integrated WhatsApp links, all interactions must be professional and respectful. Harassment, hate speech, discrimination, or abusive language toward any Buyer, Supplier, or Alfietz staff will result in immediate account termination.</p>

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
      <p>If you encounter a user or listing that violates these guidelines, please use the Feedback or Help section to report it to the Alfietz moderation team immediately.</p>
    </div>
  </div>
</template>

<style scoped>
.document-page {
  background-color: var(--wood-deep);
  min-height: 100vh;
  padding: 40px 24px;
  max-width: 800px;
  margin: 0 auto;
}

.header-row {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 40px;
}

.back-btn {
  background-color: var(--wood-walnut) !important;
  border: 1px solid var(--glass-border) !important;
  color: var(--text-primary) !important;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease !important;
}

.back-btn:hover {
  background-color: var(--wood-polished) !important;
  border-color: var(--accent-amber) !important;
}

.title {
  font-size: 24px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
}

.content-scroll {
  padding-bottom: 40px;
}

.last-updated {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 32px;
  font-style: italic;
  display: block;
  border-left: 2px solid var(--accent-amber);
  padding-left: 12px;
}

h2 {
  font-size: 18px;
  font-weight: 800;
  color: var(--text-amber);
  margin: 32px 0 12px 0;
  text-transform: uppercase;
  letter-spacing: 1px;
}

p {
  font-size: 15px;
  color: var(--text-muted);
  line-height: 1.7;
  margin: 0 0 20px 0;
}

ul {
  padding-left: 20px;
  margin-bottom: 24px;
}

li {
  font-size: 15px;
  color: var(--text-muted);
  line-height: 1.7;
  margin-bottom: 12px;
}

strong {
  color: var(--text-primary);
  font-weight: 700;
}
</style>
