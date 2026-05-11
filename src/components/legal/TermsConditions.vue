<!-------- (TermsConditions.vue) ./src/components/TermsConditions.vue ------------>
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
      <p class="last-updated">Last Updated: October 2024</p>

      <h2>1. Agreement to Terms</h2>
      <p>By accessing the Alfie App, a product of the <strong>REBi Group</strong>, you agree to be bound by these Terms and Conditions. This platform serves as a bridge connecting clothes makers, tailors, and clients.</p>

      <h2>2. User Roles & Responsibilities</h2>
      <p><strong>Clients:</strong> Agree to provide accurate measurements and prompt payment for services rendered.<br>
      <strong>Clothes Makers:</strong> Agree to deliver high-quality, competitive designs within the agreed-upon timeframe.</p>

      <h2>3. Transactions & Fees</h2>
      <p>All payments are processed securely through the platform. REBi Group retains a standard service fee to maintain platform stability and competitive matchmaking.</p>

      <h2>4. Dispute Resolution</h2>
      <p>If a dispute arises regarding a garment's quality or fit, REBi Group acts as an impartial mediator to ensure fair resolution for both the maker and the client.</p>
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