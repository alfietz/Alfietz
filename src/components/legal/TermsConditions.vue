<script setup>
defineEmits(['go-back'])
</script>

<template>
  <div class="document-page">
    <div class="header-row">
      <button class="back-btn" @click="$emit('go-back')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <h1 class="title">Terms & Conditions</h1>
    </div>

    <div class="content-scroll">
      <p class="last-updated">Last Updated: May 2026</p>

      <h2>1. Acceptance of Terms</h2>
      <p>By accessing and using the Alfietz App (the "Platform"), operated by the <strong>REBi Group</strong> ("we," "us," or "our"), you agree to be bound by these Terms and Conditions ("Terms"). If you do not agree to these Terms, you must not use the Platform.</p>

      <h2>2. Nature of the Platform</h2>
      <p>Alfietz is a digital marketplace connecting independent artisans, tailors, and designers ("Suppliers") with consumers ("Buyers") seeking African heritage crafts and clothing. <strong>REBi Group is not a party to the actual transaction between Buyers and Suppliers</strong>. We provide the technology to facilitate discovery and initial communication.</p>

      <h2>3. User Accounts</h2>
      <p>You must provide accurate information when creating an account. You are responsible for maintaining the confidentiality of your login credentials and for all activities under your account. REBi Group reserves the right to suspend or terminate accounts that violate these Terms or our Community Guidelines.</p>

      <h2>4. Supplier Obligations</h2>
      <p>Suppliers must provide accurate descriptions, clear images, and transparent pricing for their heritage items. Suppliers represent and warrant that they have the right to sell the items listed and that such items do not infringe on third-party intellectual property. Suppliers are solely responsible for fulfilling orders and arranging shipping directly with Buyers.</p>

      <h2>5. Buyer Obligations</h2>
      <p>Buyers agree to provide accurate physical measurements when requesting custom garments. Buyers understand that custom-made items are crafted to the specifications provided; therefore, REBi Group is not responsible for fit issues arising from inaccurate measurements provided by the Buyer.</p>

      <h2>6. Transactions, Fees, and Taxes</h2>
      <p>While REBi Group facilitates connections, payments may be negotiated and processed directly between Buyers and Suppliers (e.g., via WhatsApp). Any platform fees levied by REBi Group will be explicitly stated prior to transaction completion. Users are solely responsible for all taxes, duties, and customs fees associated with their purchases.</p>

      <h2>7. Intellectual Property</h2>
      <p>The Platform's code, design, and branding are the property of REBi Group. Suppliers retain ownership of the IP in their garment designs but grant REBi Group a worldwide, royalty-free license to display, promote, and distribute images of their listings for marketing purposes.</p>

      <h2>8. Limitation of Liability</h2>
      <p><strong>TO THE MAXIMUM EXTENT PERMITTED BY LAW, REBI GROUP SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY.</strong> REBi Group does not guarantee the quality, safety, or legality of items listed by Suppliers, the truth or accuracy of listings, or the ability of Sellers to sell items or Buyers to pay for items.</p>

      <h2>9. Indemnification</h2>
      <p>You agree to indemnify and hold harmless REBi Group, its affiliates, officers, and employees from any claims, damages, liabilities, costs, or expenses (including legal fees) arising from your use of the Platform, your violation of these Terms, or your infringement of any third-party rights.</p>

      <h2>10. Dispute Resolution</h2>
      <p>Disputes between Buyers and Suppliers must be resolved between the parties. REBi Group may, at its sole discretion, offer mediation services but is under no obligation to do so. Any dispute arising with REBi Group shall be governed by the laws of the jurisdiction in which REBi Group is registered, without regard to conflict of law principles.</p>

      <h2>11. Modifications</h2>
      <p>REBi Group reserves the right to modify these Terms at any time. Continued use of the Platform constitutes acceptance of the updated Terms.</p>
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