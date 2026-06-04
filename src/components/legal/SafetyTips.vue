<!-------- (SafetyTips.vue) ./src/components/legal/SafetyTips.vue ------------>
<script setup>
defineProps({
  t: {
    type: Function,
    required: true
  }
})
defineEmits(['go-back'])
</script>

<template>
  <div class="document-page pattern-heritage animate-fade">
    <div class="header-row">
      <button class="back-btn" @click="$emit('go-back')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <h1 class="title">{{ t('safetyTipsTitle') }}</h1>
    </div>

    <div class="content-scroll">
      <p class="last-updated">Last Updated: May 2026</p>
      
      <p>{{ t('safetyTipsP1') }}</p>

      <h2>{{ t('safetyTip1Title') }}</h2>
      <ul>
        <li>{{ t('safetyTip1L1') }}</li>
        <li>{{ t('safetyTip1L2') }}</li>
        <li>{{ t('safetyTip1L3') }}</li>
      </ul>

      <h2>{{ t('safetyTip2Title') }}</h2>
      <ul>
        <li>{{ t('safetyTip2L1') }}</li>
        <li>{{ t('safetyTip2L2') }}</li>
      </ul>

      <h2>{{ t('safetyTip3Title') }}</h2>
      <ul>
        <li>{{ t('safetyTip3L1') }}</li>
        <li>{{ t('safetyTip3L2') }}</li>
      </ul>

      <h2>{{ t('safetyTip4Title') }}</h2>
      <p>{{ t('safetyTip4P') }}</p>
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
