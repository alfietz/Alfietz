<script setup>
defineEmits(['go-back'])
</script>

<template>
  <div class="document-page">
    <div class="header-row">
      <button class="back-btn" @click="$emit('go-back')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <h1 class="title">Return & Refund Policy</h1>
    </div>

    <div class="content-scroll">
      <p class="last-updated">Last Updated: May 2026</p>
      
      <p>At Alfietz, operated by REBi Group, we strive to ensure every heritage item meets your expectations. Because our marketplace features both ready-to-wear items and bespoke (custom-made) garments, our return policy varies by item type.</p>

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
      <p>As REBi Group connects Buyers and Suppliers, <strong>all return logistics must be coordinated directly between the Buyer and the Supplier</strong> (usually via WhatsApp). Unless the item is defective, the Buyer is typically responsible for return shipping costs.</p>

      <h2>4. Dispute Resolution</h2>
      <p>If a Buyer and Supplier cannot agree on a return or refund, REBi Group may, at its sole discretion, review the communication and listing details to mediate. However, REBi Group cannot mandate refunds for transactions processed outside our platform.</p>
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