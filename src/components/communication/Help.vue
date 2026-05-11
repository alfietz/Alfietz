<!-------- (Help.vue) ./src/components/Help.vue ------------>
<script setup>
import { ref } from 'vue'

defineEmits(['go-back'])

const faqs = ref([
  { 
    question: 'How do I connect with a clothes maker?', 
    answer: 'Simply browse our categories or use the search bar to find a style you like. Once you click on a product, you can use the "Connect with Designer" button to open a direct WhatsApp chat with the artisan.',
    isOpen: false 
  },
  { 
    question: 'How are designs priced?', 
    answer: 'Prices vary based on the artisan, the complexity of the design, and the materials used. Most items have a starting price listed, but custom commissions can be negotiated directly with the tailor.',
    isOpen: false 
  },
  { 
    question: 'How long does custom tailoring take?', 
    answer: 'Standard items usually take 1-2 weeks. For complex traditional wear like bridal gowns, it may take 4-6 weeks. Each artisan will provide a specific timeline during your initial consultation.',
    isOpen: false 
  },
  { 
    question: 'What is REBi Group\'s refund policy?', 
    answer: 'REBi Group acts as a platform connecting you to independent artisans. While we vet our artisans for quality, specific refund policies are handled by each individual tailor. We recommend clarifying this before payment.',
    isOpen: false 
  }
])

const toggleFaq = (index) => {
  faqs.value[index].isOpen = !faqs.value[index].isOpen
}
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
      <div v-for="(faq, index) in faqs" :key="index" class="faq-wrapper">
        <div class="faq-item" @click="toggleFaq(index)" :class="{ active: faq.isOpen }">
          <p class="faq-question">{{ faq.question }}</p>
          <svg 
            class="chevron" 
            :class="{ rotated: faq.isOpen }"
            width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A0A0A0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
          >
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </div>
        <div v-if="faq.isOpen" class="faq-answer">
          {{ faq.answer }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.help-page { background-color: var(--wood-deep); min-height: 100vh; padding: 24px 20px; }
.header-row { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; }
.title { font-size: 22px; font-weight: 600; color: var(--text-primary); margin: 0; }

.contact-card { display: flex; align-items: center; background: var(--wood-walnut); border: 1px solid var(--glass-border); border-radius: 16px; padding: 16px; margin-bottom: 32px; }
.contact-icon { width: 48px; height: 48px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 16px; flex-shrink: 0; }
.contact-info { flex: 1; }
.contact-info h3 { margin: 0 0 4px 0; font-size: 15px; color: var(--text-primary); }
.contact-info p { margin: 0; font-size: 12px; color: var(--text-muted); }
.chat-btn { background: var(--accent-amber); color: white; border: none; padding: 8px 16px; border-radius: 20px; font-weight: 600; font-size: 13px; cursor: pointer; }

.section-title { font-size: 18px; font-weight: 600; color: var(--text-primary); margin: 0 0 16px 0; }
.faq-list { display: flex; flex-direction: column; gap: 12px; }
.faq-item { display: flex; justify-content: space-between; align-items: center; background: var(--wood-walnut); padding: 16px 20px; border-radius: 12px; cursor: pointer; transition: background 0.2s; }
.faq-item:hover { background: var(--wood-polished); }
.faq-item.active { border-bottom-left-radius: 0; border-bottom-right-radius: 0; background: var(--wood-polished); }
.faq-question { margin: 0; font-size: 14px; font-weight: 500; color: var(--text-primary); }
.faq-answer { background: var(--wood-walnut); padding: 0 20px 16px 20px; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px; font-size: 13px; color: var(--text-muted); line-height: 1.5; border-top: none; }
.chevron { transition: transform 0.3s ease; }
.chevron.rotated { transform: rotate(180deg); }
</style>