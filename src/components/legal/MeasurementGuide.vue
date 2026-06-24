<!-------- (MeasurementGuide.vue) ./src/components/legal/MeasurementGuide.vue ------------>
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
      <h1 class="title">{{ t('measurementsTitle') }}</h1>
    </div>

    <div class="content-scroll">
      <p class="last-updated">Last Updated: May 2026</p>
      
      <p>{{ t('measP1') }}</p>

      <h2>{{ t('measSec1Title') }}</h2>
      <ul>
        <li><strong>{{ t('measSec1L1').split(':')[0] }}:</strong>{{ t('measSec1L1').split(':')[1] }}</li>
        <li><strong>{{ t('measSec1L2').split(':')[0] }}:</strong>{{ t('measSec1L2').split(':')[1] }}</li>
        <li><strong>{{ t('measSec1L3').split(':')[0] }}:</strong>{{ t('measSec1L3').split(':')[1] }}</li>
        <li><strong>{{ t('measSec1L4').split(':')[0] }}:</strong>{{ t('measSec1L4').split(':')[1] }}</li>
      </ul>

      <h2>{{ t('measSec2Title') }}</h2>
      <ul>
        <li><strong>{{ t('measSec2L1').split(':')[0] }}:</strong>{{ t('measSec2L1').split(':')[1] }}</li>
        <li><strong>{{ t('measSec2L2').split(':')[0] }}:</strong>{{ t('measSec2L2').split(':')[1] }}</li>
        <li><strong>{{ t('measSec2L3').split(':')[0] }}:</strong>{{ t('measSec2L3').split(':')[1] }}</li>
      </ul>

      <h2>{{ t('measSec3Title') }}</h2>
      <ul>
        <li>{{ t('measSec3L1') }}</li>
        <li>{{ t('measSec3L2') }}</li>
        <li>{{ t('measSec3L3') }}</li>
      </ul>

      <div class="pro-tip">
        <h3>{{ t('measProTipTitle') }}</h3>
        <p>{{ t('measProTipP1') }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.document-page {
  background-color: var(--wood-deep);
  min-height: 100vh;
  padding: var(--space-10) var(--space-6);
  max-width: 800px;
  margin: 0 auto;
}

.header-row {
  display: flex;
  align-items: center;
  gap: var(--space-5);
  margin-bottom: var(--space-10);
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
  font-size: var(--text-h1);
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
  line-height: var(--leading-tight);
}

.content-scroll {
  padding-bottom: var(--space-10);
}

.last-updated {
  font-size: var(--text-caption);
  color: var(--text-muted);
  margin-bottom: var(--space-8);
  font-style: italic;
  display: block;
  border-left: 2px solid var(--accent-amber);
  padding-left: var(--space-3);
}

h2 {
  font-size: var(--text-h2);
  font-weight: 800;
  color: var(--text-amber);
  margin: var(--space-8) 0 var(--space-3) 0;
  text-transform: uppercase;
  letter-spacing: 1px;
  line-height: var(--leading-tight);
}

p {
  font-size: var(--text-body);
  color: var(--text-muted);
  line-height: var(--leading-relaxed);
  margin: 0 0 var(--space-5) 0;
}

ul {
  padding-left: var(--space-5);
  margin-bottom: var(--space-6);
}

li {
  font-size: var(--text-body);
  color: var(--text-muted);
  line-height: var(--leading-relaxed);
  margin-bottom: var(--space-3);
}

strong {
  color: var(--text-primary);
  font-weight: 700;
}

.pro-tip {
  background: var(--wood-walnut);
  padding: var(--space-6);
  border-radius: var(--radius-md);
  border: 1px solid var(--accent-amber);
  margin-top: var(--space-10);
}

.pro-tip h3 {
  font-size: var(--text-body-lg);
  font-weight: 800;
  color: var(--accent-amber);
  margin: 0 0 var(--space-2) 0;
  text-transform: uppercase;
}

.pro-tip p {
  margin-bottom: 0;
  font-style: italic;
}
</style>
