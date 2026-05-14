<script setup>
defineEmits(['go-back'])
</script>

<template>
  <div class="document-page">
    <div class="header-row">
      <button class="back-btn" @click="$emit('go-back')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
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