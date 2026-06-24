<script setup>
import { ref } from 'vue'

const props = defineProps({
  userData: {
    type: Object,
    required: true
  },
  language: {
    type: String,
    default: 'en'
  },
  t: {
    type: Function,
    required: true
  }
})

const emit = defineEmits(['go-back', 'go-help', 'go-privacy', 'go-terms', 'go-about', 'go-feedback', 'update:language', 'update:role', 'logout'])

const setLanguage = (lang) => {
  emit('update:language', lang)
}

const triggerHaptic = () => {
  if (window.navigator && window.navigator.vibrate) {
    window.navigator.vibrate(10) // Quick 10ms pulse
  }
}

const handleAction = (callback) => {
  triggerHaptic()
  callback()
}

const openWhatsAppSupport = () => {
  const userName = props.userData.firstName || props.userData.username
  const message = `Hello Alfietz Support! 👋\n\nMy name is ${userName}. I need assistance with the heritage platform. ✨\n\n[Describe issue here]\n\nUser ID: ${props.userData.id}`
  const supportNumber = "255700000000"
  const url = `https://wa.me/${supportNumber}?text=${encodeURIComponent(message)}`
  window.open(url, '_blank')
}
</script>

<template>
  <div class="settings-page safe-area-bottom">
    <div class="header-row">
      <button class="back-btn tap-active" @click="handleAction(() => $emit('go-back'))">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <h1 class="title">{{ t('settings') }}</h1>
    </div>

    <div class="settings-container">
      <!-- Left Column -->
      <div class="settings-column">
        <!-- Section: User Heritage Role -->
        <section class="settings-card">
          <h3 class="card-label">Your Heritage Role</h3>
          <div class="role-grid">
            <button 
              class="role-card tap-active" 
              :class="{ active: userData.userType === 'buyer' }"
              @click="handleAction(() => $emit('update:role', 'buyer'))"
            >
              <div class="role-circle">🛍️</div>
              <span class="role-title">Buyer</span>
            </button>
            <button 
              class="role-card tap-active" 
              :class="{ active: userData.userType === 'supplier' }"
              @click="handleAction(() => $emit('update:role', 'supplier'))"
            >
              <div class="role-circle">✂️</div>
              <span class="role-title">Tailor</span>
            </button>
          </div>
        </section>

        <!-- Section: Language & Localization -->
        <section class="settings-card">
          <h3 class="card-label">{{ t('language') }}</h3>
          <div class="pill-selector">
            <button 
              class="pill-btn tap-active" 
              :class="{ active: language === 'en' }"
              @click="handleAction(() => setLanguage('en'))"
            >
              English
            </button>
            <button 
              class="pill-btn tap-active" 
              :class="{ active: language === 'sw' }"
              @click="handleAction(() => setLanguage('sw'))"
            >
              Kiswahili
            </button>
          </div>
        </section>
      </div>

      <!-- Right Column -->
      <div class="settings-column">
        <!-- Section: Support & Legal -->
        <section class="settings-card">
          <h3 class="card-label">Support & Resources</h3>
          <div class="list-item tap-active" @click="handleAction(openWhatsAppSupport)">
            <div class="item-lead">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-amber)" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-13.4 8.38 8.38 0 0 1 3.8.9L21 3z"/></svg>
              <span>Contact Support</span>
            </div>
            <span class="action-hint">WhatsApp</span>
          </div>
          <div class="list-item tap-active" @click="handleAction(() => $emit('go-help'))">
            <span>{{ t('help') }}</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
          </div>
          <div class="list-item tap-active" @click="handleAction(() => $emit('go-privacy'))">
            <span>{{ t('privacyPolicy') }}</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
          </div>
          <div class="list-item tap-active" @click="handleAction(() => $emit('go-terms'))">
            <span>{{ t('termsConditions') }}</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
          </div>
        </section>
      </div>
    </div>

    <!-- Dangerous Area -->
    <button class="logout-btn tap-active" @click="handleAction(() => $emit('logout'))">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
      <span>{{ t('logoutHeritage') }}</span>
    </button>
  </div>
</template>

<style scoped>
.settings-page {
  background-color: var(--wood-deep);
  min-height: 100vh;
  padding: var(--space-8) var(--space-5);
  max-width: 1200px;
  margin: 0 auto;
}

.header-row {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-8);
}

.title {
  font-size: var(--text-h1);
  font-weight: 800;
  color: var(--text-primary);
  line-height: var(--leading-tight);
}

.settings-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

@media (min-width: 1024px) {
  .settings-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-12);
    align-items: start;
  }
}

.settings-column {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.settings-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.card-label {
  font-size: var(--text-caption);
  font-weight: 800;
  text-transform: uppercase;
  color: var(--text-muted);
  letter-spacing: 1.5px;
  margin-left: var(--space-1);
}

.role-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
}

.role-card {
  background: var(--wood-walnut);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  transition: all 0.3s ease;
}

.role-card.active {
  border-color: var(--accent-amber);
  background: var(--wood-polished);
  box-shadow: 0 0 15px var(--accent-glow);
}

.role-circle {
  width: 48px;
  height: 48px;
  background: var(--wood-deep);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-display);
}

.role-card.active .role-circle {
  background: var(--accent-amber);
}

.role-title {
  font-size: var(--text-body);
  font-weight: 700;
  color: var(--text-primary);
}

.pill-selector {
  display: flex;
  background: var(--wood-walnut);
  padding: var(--space-1);
  border-radius: var(--radius-md);
  border: 1px solid var(--glass-border);
}

.pill-btn {
  flex: 1;
  padding: var(--space-3);
  border-radius: var(--radius-sm);
  font-size: var(--text-body);
  font-weight: 700;
  color: var(--text-muted);
}

.pill-btn.active {
  background: var(--accent-amber);
  color: white;
}

.list-item {
  background: var(--wood-walnut);
  border: 1px solid var(--glass-border);
  padding: var(--space-4) var(--space-5);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--text-primary);
}

.item-lead {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  font-weight: 600;
  font-size: var(--text-body-lg);
}

.action-hint {
  font-size: var(--text-caption);
  color: var(--text-amber);
  font-weight: 700;
}

.custom-toggle {
  width: 48px;
  height: 24px;
  background: var(--wood-deep);
  border-radius: 12px;
  position: relative;
  transition: all 0.3s ease;
}

.custom-toggle.on {
  background: var(--accent-amber);
}

.handle {
  width: 18px;
  height: 18px;
  background: white;
  border-radius: 50%;
  position: absolute;
  top: 3px;
  left: 3px;
  transition: transform 0.3s ease;
}

.custom-toggle.on .handle {
  transform: translateX(24px);
}

.logout-btn {
  margin-top: var(--space-4);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  padding: var(--space-4);
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: var(--radius-md);
  color: #EF4444;
  font-weight: 700;
  font-size: var(--text-body-lg);
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