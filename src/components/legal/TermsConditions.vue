<!-------- (TermsConditions.vue) ./src/components/legal/TermsConditions.vue ------------>
<script setup>
defineEmits(['go-back'])
</script>

<template>
  <div class="document-page pattern-heritage animate-fade">
    <div class="header-row">
      <button class="back-btn" @click="$emit('go-back')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <h1 class="title">Terms & Conditions</h1>
    </div>

    <div class="content-scroll">
      <p class="last-updated">Last Updated: May 2026</p>

      <h2>1. Acceptance of Terms</h2>
      <p>By accessing and using the Alfietz App (the "Platform"), operated by <strong>Alfietz</strong> ("we," "us," or "our"), you agree to be bound by these Terms and Conditions ("Terms"). If you do not agree to these Terms, you must not use the Platform.</p>

      <h2>2. Nature of the Platform</h2>
      <p>Alfietz is a digital marketplace connecting independent artisans, tailors, and designers ("Suppliers") with consumers ("Buyers") seeking African heritage crafts and clothing. <strong>Alfietz is not a party to the actual transaction between Buyers and Suppliers</strong>. We provide the technology to facilitate discovery and initial communication.</p>

      <h2>3. User Accounts</h2>
      <p>You must provide accurate information when creating an account. You are responsible for maintaining the confidentiality of your login credentials and for all activities under your account. Alfietz reserves the right to suspend or terminate accounts that violate these Terms or our Community Guidelines.</p>

      <h2>4. Supplier Obligations</h2>
      <p>Suppliers must provide accurate descriptions, clear images, and transparent pricing for their heritage items. Suppliers represent and warrant that they have the right to sell the items listed and that such items do not infringe on third-party intellectual property. Suppliers are solely responsible for fulfilling orders and arranging shipping directly with Buyers.</p>

      <h2>5. Buyer Obligations</h2>
      <p>Buyers agree to provide accurate physical measurements when requesting custom garments. Buyers understand that custom-made items are crafted to the specifications provided; therefore, Alfietz is not responsible for fit issues arising from inaccurate measurements provided by the Buyer.</p>

      <h2>6. Transactions, Fees, and Taxes</h2>
      <p>While Alfietz facilitates connections, payments may be negotiated and processed directly between Buyers and Suppliers (e.g., via WhatsApp). Any platform fees levied by Alfietz will be explicitly stated prior to transaction completion. Users are solely responsible for all taxes, duties, and customs fees associated with their purchases.</p>

      <h2>7. Intellectual Property</h2>
      <p>The Platform's code, design, and branding are the property of Alfietz. Suppliers retain ownership of the IP in their garment designs but grant Alfietz a worldwide, royalty-free license to display, promote, and distribute images of their listings for marketing purposes.</p>

      <h2>8. Limitation of Liability</h2>
      <p><strong>TO THE MAXIMUM EXTENT PERMITTED BY LAW, ALFIETZ SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY.</strong> Alfietz does not guarantee the quality, safety, or legality of items listed by Suppliers, the truth or accuracy of listings, or the ability of Sellers to sell items or Buyers to pay for items.</p>

      <h2>9. Indemnification</h2>
      <p>You agree to indemnify and hold harmless Alfietz, its affiliates, officers, and employees from any claims, damages, liabilities, costs, or expenses (including legal fees) arising from your use of the Platform, your violation of these Terms, or your infringement of any third-party rights.</p>

      <h2>10. Dispute Resolution</h2>
      <p>Disputes between Buyers and Suppliers must be resolved between the parties. Alfietz may, at its sole discretion, offer mediation services but is under no obligation to do so. Any dispute arising with Alfietz shall be governed by the laws of the jurisdiction in which Alfietz is registered, without regard to conflict of law principles.</p>

      <h2>11. Modifications</h2>
      <p>Alfietz reserves the right to modify these Terms at any time. Continued use of the Platform constitutes acceptance of the updated Terms.</p>
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

strong {
  color: var(--text-primary);
  font-weight: 700;
}
</style>
