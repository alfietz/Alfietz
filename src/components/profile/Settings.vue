<!-------- (Settings.vue) ./src/components/Settings.vue ------------>
<script setup>
const props = defineProps({
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

const emit = defineEmits(['go-back', 'go-help', 'go-privacy', 'go-terms', 'go-about', 'update:theme', 'update:language'])

const toggleTheme = () => {
  const newTheme = props.theme === 'light' ? 'dark' : 'light'
  emit('update:theme', newTheme)
}

const setLanguage = (lang) => {
  emit('update:language', lang)
}
</script>

<template>
  <div class="settings-page">
    <div class="header-row">
      <button class="back-btn" @click="$emit('go-back')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <h1 class="title">{{ t('settings') }}</h1>
    </div>

    <div class="settings-list">
      <!-- Appearance Group -->
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

      <div class="settings-group">
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
        
        <div class="setting-item" @click="$emit('go-help')">
          <span class="setting-text">{{ t('help') }}</span>
          <svg class="chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A0A0A0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </div>

        <div class="setting-item" @click="$emit('go-privacy')">
          <span class="setting-text">{{ t('privacyPolicy') }}</span>
          <svg class="chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A0A0A0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </div>

        <div class="setting-item" @click="$emit('go-terms')">
          <span class="setting-text">{{ t('termsConditions') }}</span>
          <svg class="chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A0A0A0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </div>

        <div class="setting-item" @click="$emit('go-about')">
          <span class="setting-text">{{ t('aboutUs') }}</span>
          <svg class="chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A0A0A0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-page { background-color: var(--bg-white); min-height: 100vh; padding: 24px 20px; }
.header-row { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; }
.title { font-size: 22px; font-weight: 600; color: var(--secondary-brown); margin: 0; }
.settings-list { display: flex; flex-direction: column; gap: 24px; }
.group-title { font-size: 14px; font-weight: 600; color: var(--text-muted); margin: 0 0 12px 12px; text-transform: uppercase; letter-spacing: 0.5px; }
.setting-item { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; background: var(--primary-tan); border-radius: 12px; margin-bottom: 8px; cursor: pointer; transition: background 0.2s; }
.setting-item:hover { opacity: 0.9; }
.setting-text { font-size: 15px; font-weight: 500; color: var(--text-main); }
.chevron { color: #A0A0A0; }

.lang-selector {
  display: flex;
  gap: 12px;
  margin: 0 12px 12px;
}

.lang-option {
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  border: 2px solid var(--primary-tan);
  background: transparent;
  color: var(--primary-green);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.lang-option.active {
  background-color: var(--primary-tan);
  color: white;
}

/* Toggle Switch Styles */
.toggle-switch {
  width: 44px;
  height: 24px;
  background-color: var(--border-light);
  border-radius: 12px;
  position: relative;
  transition: background-color 0.3s;
}

.toggle-switch.is-active {
  background-color: var(--primary-green);
}

.toggle-handle {
  width: 20px;
  height: 20px;
  background-color: white;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: transform 0.3s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.toggle-switch.is-active .toggle-handle {
  transform: translateX(20px);
}
</style>