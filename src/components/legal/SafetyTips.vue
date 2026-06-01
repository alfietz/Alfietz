<!-------- (SafetyTips.vue) ./src/components/legal/SafetyTips.vue ------------>
<script setup>
defineEmits(['go-back'])
</script>

<template>
  <div class="document-page pattern-heritage animate-fade">
    <div class="header-row">
      <button class="back-btn" @click="$emit('go-back')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <h1 class="title">Safety & Security Tips</h1>
    </div>

    <div class="content-scroll">
      <p class="last-updated">Last Updated: May 2026</p>
      
      <p>Your safety is our priority. Since Alfietz connects you directly with artisans via WhatsApp, please follow these guidelines to ensure a secure and happy heritage experience.</p>

      <h2>1. Secure Payments</h2>
      <ul>
        <li><strong>Avoid Full Upfront Payments:</strong> For custom orders, it is standard to pay a deposit (e.g., 50%) and the balance upon completion/delivery. Avoid paying 100% upfront to sellers you haven't worked with before.</li>
        <li><strong>Use Traceable Methods:</strong> Use mobile money (M-Pesa, Airtel Money) or bank transfers that provide a digital receipt. Avoid sending cash via untraceable means.</li>
        <li><strong>Verify the Receiver:</strong> Ensure the name on the mobile money account matches the Supplier's name on Alfietz.</li>
      </ul>

      <h2>2. Safe Communication</h2>
      <ul>
        <li><strong>Keep it on WhatsApp:</strong> By using the "Order via WhatsApp" button, you ensure a chat history exists. Do not move the conversation to disappearing message apps.</li>
        <li><strong>Save Your History:</strong> Keep screenshots of your measurements, agreed prices, and delivery dates in case a dispute arises.</li>
      </ul>

      <h2>3. Meeting in Person</h2>
      <ul>
        <li><strong>Public Places:</strong> If you are meeting a Supplier for a fitting or delivery, always meet in a well-lit, busy public place.</li>
        <li><strong>Tell Someone:</strong> Let a friend or family member know where you are going and who you are meeting.</li>
      </ul>

      <h2>4. Reporting Suspicious Activity</h2>
      <p>If a user asks for personal financial details (like PIN codes or passwords) or behaves suspiciously, stop communication immediately and report them via the Alfietz Feedback section.</p>
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
