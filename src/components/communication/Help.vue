<!-------- (Help.vue) ./src/components/Help.vue ------------>
<script setup>
defineEmits(['go-back'])
</script>

<template>
  <div class="help-page">
    <div class="header-row">
      <button class="back-btn" @click="$emit('go-back')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <h1 class="title">Help Center</h1>
    </div>

    <!-- Contact Support CTA -->
    <div class="contact-card">
      <div class="contact-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5D8374" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
      </div>
      <div class="contact-info">
        <h3>Need custom support?</h3>
        <p>Chat directly with REBi Group support.</p>
      </div>
      <button class="chat-btn">Chat</button>
    </div>

    <!-- FAQ Section -->
    <h3 class="section-title">Frequently Asked Questions</h3>
    
    <div class="faq-list">
      <div class="faq-item">
        <p class="faq-question">How do I connect with a clothes maker?</p>
        <svg class="chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A0A0A0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
      </div>
      <div class="faq-item">
        <p class="faq-question">How are designs priced?</p>
        <svg class="chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A0A0A0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
      </div>
      <div class="faq-item">
        <p class="faq-question">How long does custom tailoring take?</p>
        <svg class="chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A0A0A0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
      </div>
      <div class="faq-item">
        <p class="faq-question">What is REBi Group's refund policy?</p>
        <svg class="chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A0A0A0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
      </div>
    </div>
  </div>
</template>

<style scoped>
.help-page { background-color: var(--bg-white); min-height: 100vh; padding: 24px 20px; }
.header-row { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; }
.title { font-size: 22px; font-weight: 600; color: var(--secondary-brown); margin: 0; }

.contact-card { display: flex; align-items: center; background: #F4F8F6; border: 1px solid #E1EBE6; border-radius: 16px; padding: 16px; margin-bottom: 32px; }
.contact-icon { width: 48px; height: 48px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 16px; flex-shrink: 0; }
.contact-info { flex: 1; }
.contact-info h3 { margin: 0 0 4px 0; font-size: 15px; color: #1A1A1A; }
.contact-info p { margin: 0; font-size: 12px; color: #666; }
.chat-btn { background: #5D8374; color: white; border: none; padding: 8px 16px; border-radius: 20px; font-weight: 600; font-size: 13px; cursor: pointer; }

.section-title { font-size: 18px; font-weight: 600; color: #1A1A1A; margin: 0 0 16px 0; }
.faq-list { display: flex; flex-direction: column; gap: 12px; }
.faq-item { display: flex; justify-content: space-between; align-items: center; background: #F8F8F8; padding: 16px 20px; border-radius: 12px; cursor: pointer; transition: background 0.2s; }
.faq-item:hover { background: #F0F0F0; }
.faq-question { margin: 0; font-size: 14px; font-weight: 500; color: #333; }
</style>