<!-------- (ReturnPolicy.vue) ./src/components/legal/ReturnPolicy.vue ------------>
<script setup>
defineEmits(['go-back'])
</script>

<template>
  <div class="document-page pattern-heritage animate-fade">
    <div class="header-row">
      <button class="back-btn" @click="$emit('go-back')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <h1 class="title">Return & Refund Policy</h1>
    </div>

    <div class="content-scroll">
      <p class="last-updated">Last Updated: May 2026</p>
      
      <p>At Alfietz, we strive to ensure every heritage item meets your expectations. Because our marketplace features both ready-to-wear items and bespoke (custom-made) garments, our return policy varies by item type.</p>

      <h2>1. Custom & Bespoke Garments</h2>
      <p>Because custom garments are created specifically to your provided measurements, <strong>they are generally non-refundable and non-returnable</strong> unless there is a verifiable material defect or a significant deviation from the agreed-upon design.</p>
      <ul>
        <li>If a custom item does not fit due to inaccurate measurements provided by the Buyer, the Supplier is not obligated to offer a refund. Minor alterations may be negotiated directly with the Supplier.</li>
        <li>If the Supplier made an error in measurements or used the wrong materials, the Buyer must report the issue within <strong>7 days</strong> of receipt to arrange an alteration or refund directly with the Supplier.</li>
      </ul>

      <h2>2. Ready-to-Wear Items</h2>
      <p>For non-custom items (e.g., standard-sized jewelry, pre-made clothing, crafts), Buyers have the right to request a return within <strong>14 days</strong> of receiving the item, provided the item is:</p>
      <ul>
        <li>Unworn, unwashed, and in its original condition.</li>
        <li>Returned with all original tags and packaging intact.</li>
      </ul>

      <h2>3. Return Process & Shipping</h2>
      <p>As Alfietz connects Buyers and Suppliers, <strong>all return logistics must be coordinated directly between the Buyer and the Supplier</strong> (usually via WhatsApp). Unless the item is defective, the Buyer is typically responsible for return shipping costs.</p>

      <h2>4. Dispute Resolution</h2>
      <p>If a Buyer and Supplier cannot agree on a return or refund, Alfietz may, at its sole discretion, review the communication and listing details to mediate. However, Alfietz cannot mandate refunds for transactions processed outside our platform.</p>
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
