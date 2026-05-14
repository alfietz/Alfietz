<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
defineEmits(['go-back'])

const navigateTo = (routeName) => {
  router.push({ name: routeName })
}
</script>

<template>
  <div class="help-page">
    <div class="header-row">
      <button class="back-btn" @click="$emit('go-back')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <h1 class="title">Help & Legal Center</h1>
    </div>

    <div class="content-scroll">
      
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
        <p class="section-desc">Review our policies to understand your rights and responsibilities on the Alfietz platform, protected by REBi Group.</p>
        
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
            <span>About REBi Group</span>
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
          <p>If you encounter issues with an order or a user, please use the Feedback section or email support@rebigroup.com.</p>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.help-page { background-color: var(--wood-deep); min-height: 100vh; padding: 24px 20px; display: flex; flex-direction: column; }
.header-row { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; flex-shrink: 0; }
.title { font-size: 22px; font-weight: 600; color: var(--text-primary); margin: 0; }

.content-scroll { flex: 1; overflow-y: auto; padding-bottom: 40px; }

.legal-section { margin-bottom: 40px; }
h3 { font-size: 18px; font-weight: 600; color: var(--text-amber); margin: 0 0 8px 0; }
.section-desc { font-size: 14px; color: var(--text-muted); margin: 0 0 16px 0; line-height: 1.5; }

.legal-links { display: flex; flex-direction: column; gap: 12px; }
.legal-link-btn { 
  display: flex; justify-content: space-between; align-items: center; 
  background: var(--wood-walnut); border: 1px solid var(--border-color); 
  padding: 16px; border-radius: 12px; color: var(--text-primary); 
  font-size: 15px; font-weight: 500; cursor: pointer; transition: all 0.2s;
}
.legal-link-btn:hover { background: var(--wood-medium); border-color: var(--text-amber); }
.legal-link-btn svg { color: var(--text-amber); }

.faq-section { margin-bottom: 24px; }
.faq-item { background: var(--wood-walnut); padding: 16px; border-radius: 12px; margin-bottom: 12px; border: 1px solid var(--border-color); }
.faq-item h4 { font-size: 15px; font-weight: 600; color: var(--text-primary); margin: 0 0 8px 0; }
.faq-item p { font-size: 14px; color: var(--text-secondary); margin: 0; line-height: 1.5; }

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