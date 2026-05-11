<!-------- (Settings.vue) ./src/components/Settings.vue ------------>
<script setup>
const props = defineProps({
  userData: {
    type: Object,
    required: true
  },
  theme: {
    type: String,
    default: 'light'
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

const emit = defineEmits(['go-back', 'go-help', 'go-privacy', 'go-terms', 'go-about', 'go-feedback', 'update:theme', 'update:language', 'update:role'])

const toggleTheme = () => {
  const newTheme = props.theme === 'light' ? 'dark' : 'light'
  emit('update:theme', newTheme)
}

const setLanguage = (lang) => {
  emit('update:language', lang)
}

const openWhatsAppSupport = () => {
  const userName = props.userData.firstName || props.userData.username
  const message = `Hello Alfie Support Team! 👋\n\nMy name is ${userName}. I'm currently using the Alfietz app and I'd like to reach out for some assistance. ✨\n\n[Please describe your issue or question here]\n\nThank you for your help!\n\nBest regards,\n${userName} ✍️`
  
  const url = `https://wa.me/255700000000?text=${encodeURIComponent(message)}`
  window.open(url, '_blank')
}
</script>

<template>
  <div class="settings-page animate-fade">
    <div class="header-row">
      <button class="back-btn" @click="$emit('go-back')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <h1 class="title">{{ t('settings') }}</h1>
    </div>

    <div class="settings-list">
      <!-- Role Management Group -->
      <div class="settings-group">
        <h3 class="group-title">{{ t('accountType') }}</h3>
        <div class="role-selector">
          <button 
            class="role-option" 
            :class="{ active: userData.userType === 'buyer' }"
            @click="$emit('update:role', 'buyer')"
          >
            <div class="role-icon">🛍️</div>
            <div class="role-info">
              <span class="role-name">Buyer</span>
              <span class="role-desc">I want to explore and buy heritage trends.</span>
            </div>
          </button>
          <button 
            class="role-option" 
            :class="{ active: userData.userType === 'supplier' }"
            @click="$emit('update:role', 'supplier')"
          >
            <div class="role-icon">✂️</div>
            <div class="role-info">
              <span class="role-name">Tailor / Designer</span>
              <span class="role-desc">I want to showcase and sell my work.</span>
            </div>
          </button>
        </div>
      </div>

      <!-- Language Group -->
      <div class="settings-group">
        <h3 class="group-title">{{ t('language') }}</h3>
        <div class="lang-selector">
          <button 
            class="lang-option" 
            :class="{ active: language === 'en' }"
            @click="setLanguage('en')"
          >
            English
          </button>
          <button 
            class="lang-option" 
            :class="{ active: language === 'sw' }"
            @click="setLanguage('sw')"
          >
            Kiswahili
          </button>
        </div>
      </div>

      <!-- Appearance Group (Mobile Only) -->
      <div class="settings-group mobile-only">
        <h3 class="group-title">{{ t('theme') || 'Appearance' }}</h3>

        <div class="setting-item" @click="toggleTheme">
          <span class="setting-text">Dark Mode</span>
          <div class="toggle-switch" :class="{ 'is-active': theme === 'dark' }">
            <div class="toggle-handle"></div>
          </div>
        </div>
      </div>

      <div class="settings-group">
        <h3 class="group-title">Support & Info</h3>

        <div class="setting-item" @click="openWhatsAppSupport">
          <div class="setting-info">
            <span class="setting-text">WhatsApp Support</span>
            <span class="setting-hint">Chat directly with our team</span>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-amber)" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-13.4 8.38 8.38 0 0 1 3.8.9L21 3z"/></svg>
        </div>

        <div class="setting-item" @click="$emit('go-help')">
          <span class="setting-text">{{ t('help') }}</span>
          <svg class="chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </div>

        <div class="setting-item" @click="$emit('go-privacy')">
          <span class="setting-text">{{ t('privacyPolicy') }}</span>
          <svg class="chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </div>

        <div class="setting-item" @click="$emit('go-terms')">
          <span class="setting-text">{{ t('termsConditions') }}</span>
          <svg class="chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </div>

        <div class="setting-item" @click="$emit('go-about')">
          <span class="setting-text">{{ t('aboutUs') }}</span>
          <svg class="chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-page { background-color: var(--bg-dark); min-height: 100vh; padding: 32px 24px; }
.header-row { display: flex; align-items: center; gap: 20px; margin-bottom: 40px; }
.title { font-size: 24px; font-weight: 800; color: var(--text-primary); margin: 0; letter-spacing: 1px; }
.settings-list { display: flex; flex-direction: column; gap: 32px; }
.group-title { font-size: 11px; font-weight: 700; color: var(--text-muted); margin: 0 0 12px 4px; text-transform: uppercase; letter-spacing: 1.5px; }
.setting-item { display: flex; align-items: center; justify-content: space-between; padding: 20px; background: var(--wood-walnut); border: 1px solid var(--glass-border); border-radius: 16px; margin-bottom: 12px; cursor: pointer; transition: all 0.3s; }
.setting-item:hover { border-color: var(--accent-amber); background: var(--wood-polished); }
.setting-text { font-size: 15px; font-weight: 600; color: var(--text-primary); }

.setting-info {
  display: flex;
  flex-direction: column;
}

.setting-hint {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 2px;
}

.chevron { color: var(--text-muted); }

.mobile-only {
  display: block;
}

@media (min-width: 768px) {
  .mobile-only {
    display: none;
  }
}

.lang-selector {
  display: flex;
  gap: 12px;
}

.role-selector {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.role-option {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 16px;
  border: 1px solid var(--glass-border);
  background: var(--wood-walnut);
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.3s;
  text-align: left;
}

.role-option.active {
  background: var(--wood-polished);
  border-color: var(--accent-amber);
  box-shadow: 0 0 15px var(--accent-glow);
}

.role-icon {
  font-size: 24px;
}

.role-info {
  display: flex;
  flex-direction: column;
}

.role-name {
  font-size: 16px;
  font-weight: 800;
  color: var(--text-primary);
}

.role-option.active .role-name {
  color: var(--accent-amber);
}

.role-desc {
  font-size: 12px;
  color: var(--text-muted);
}

.lang-option {
  flex: 1;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid var(--glass-border);
  background: var(--wood-walnut);
  color: var(--text-muted);
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
}

.lang-option.active {
  background: linear-gradient(135deg, var(--accent-amber), #B45309);
  color: white;
  border-color: var(--accent-amber);
  box-shadow: 0 0 15px var(--accent-glow);
}

/* Toggle Switch Styles */
.toggle-switch {
  width: 50px;
  height: 28px;
  background-color: var(--border-tech);
  border-radius: 14px;
  position: relative;
  transition: all 0.3s;
  border: 1px solid var(--glass-border);
}

.toggle-switch.is-active {
  background-color: var(--accent-amber);
  box-shadow: 0 0 10px var(--accent-glow);
}

.toggle-handle {
  width: 22px;
  height: 22px;
  background-color: white;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: transform 0.3s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.toggle-switch.is-active .toggle-handle {
  transform: translateX(22px);
}
</style>