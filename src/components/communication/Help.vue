<!-------- (Help.vue) ./src/components/communication/Help.vue ------------>
<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
defineEmits(['go-back', 'navigate'])

const navigateTo = (routeName) => {
  console.log(`[Help] Navigating to: ${routeName}`);
  router.push({ name: routeName }).catch(err => {
    console.error(`[Help] Navigation failed for ${routeName}:`, err);
  });
}
</script>

<template>
  <div class="help-page pattern-heritage animate-fade">
    <div class="header-row">
      <button class="back-btn" @click="$emit('go-back')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <h1 class="title">Help & Legal Center</h1>
    </div>

    <div class="content-scroll">
      
      <div class="legal-section">
        <h3>Community & Feedback</h3>
        <p class="section-desc">See what the tribe is saying about Alfietz and share your own journey.</p>
        <div class="legal-links">
          <button class="legal-link-btn" @click="$emit('navigate', 'reviews', { isApp: true })">
            <span>Tribe Experiences</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
          </button>
          <button class="legal-link-btn" @click="$emit('navigate', 'app-review')">
            <span>Share Your Journey</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>
      </div>

      <div class="legal-section">
        <h3>Heritage & Safety</h3>
        <p class="section-desc">Resources to ensure a safe and accurate heritage experience.</p>
        <div class="legal-links">
          <button class="legal-link-btn" @click="navigateTo('safety')">
            <span>Safety & Security Tips</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
          </button>
          <button class="legal-link-btn" @click="navigateTo('measurements')">
            <span>Measurement Guide</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>
      </div>

      <div class="legal-section">
        <h3>Legal Documents</h3>
        <p class="section-desc">Review our policies to understand your rights and responsibilities on the Alfietz platform.</p>
        
        <div class="legal-links">
          <button class="legal-link-btn" @click="navigateTo('terms')">
            <span>Terms & Conditions</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
          </button>
          <button class="legal-link-btn" @click="navigateTo('privacy')">
            <span>Privacy Policy</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
          </button>
          <button class="legal-link-btn" @click="navigateTo('returns')">
            <span>Return & Refund Policy</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
          </button>
          <button class="legal-link-btn" @click="navigateTo('guidelines')">
            <span>Community Guidelines</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
          </button>
          <button class="legal-link-btn" @click="navigateTo('ip-policy')">
            <span>Intellectual Property</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
          </button>
          <button class="legal-link-btn" @click="navigateTo('about')">
            <span>About Alfietz</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>
      </div>

      <div class="faq-section">
        <h3>Frequently Asked Questions</h3>
        
        <div class="faq-item">
          <h4>How do I contact a Tailor?</h4>
          <p>You can contact tailors directly by clicking the "Connect via WhatsApp" button on any product detail page.</p>
        </div>
        
        <div class="faq-item">
          <h4>Are custom measurements private?</h4>
          <p>Yes. Measurements are securely stored and only shared with the specific tailor you select for an order.</p>
        </div>
        
        <div class="faq-item">
          <h4>How do I report a problem?</h4>
          <p>If you encounter issues with an order or a user, please use the Feedback section or email support@alfietz.shop.</p>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.help-page {
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

.legal-section {
  margin-bottom: 40px;
}

h3 {
  font-size: 18px;
  font-weight: 800;
  color: var(--text-amber);
  margin: 0 0 12px 0;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.section-desc {
  font-size: 14px;
  color: var(--text-muted);
  margin: 0 0 20px 0;
  line-height: 1.6;
}

.legal-links {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.legal-link-btn { 
  display: flex;
  justify-content: space-between;
  align-items: center; 
  background: var(--wood-walnut);
  border: 1px solid var(--glass-border); 
  padding: 16px;
  border-radius: 12px;
  color: var(--text-primary); 
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
}

.legal-link-btn:hover {
  background: var(--wood-polished);
  border-color: var(--accent-amber);
  transform: translateX(4px);
}

.legal-link-btn svg {
  color: var(--accent-amber);
}

.faq-section {
  margin-top: 20px;
}

.faq-item {
  background: var(--wood-walnut);
  padding: 20px;
  border-radius: 16px;
  margin-bottom: 16px;
  border: 1px solid var(--glass-border);
}

.faq-item h4 {
  font-size: 15px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.faq-item p {
  font-size: 14px;
  color: var(--text-muted);
  margin: 0;
  line-height: 1.6;
}
</style>
