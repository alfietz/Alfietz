<!-------- (PrivacyPolicy.vue) ./src/components/legal/PrivacyPolicy.vue ------------>
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
      <h1 class="title">{{ t('privacyPolicyTitle') }}</h1>
    </div>

    <div class="content-scroll">
      <p class="last-updated">Last Updated: May 2026</p>

      <h2>{{ t('privacySec1Title') }}</h2>
      <p>{{ t('privacyP1') }}</p>

      <h2>{{ t('privacySec2Title') }}</h2>
      <p>{{ t('privacySec2P1') }}</p>
      <ul>
        <li>{{ t('privacySec2L1') }}</li>
        <li>{{ t('privacySec2L2') }}</li>
        <li>{{ t('privacySec2L3') }}</li>
        <li>{{ t('privacySec2L4') }}</li>
      </ul>

      <h2>{{ t('privacySec3Title') }}</h2>
      <p>{{ t('privacySec3P1') }}</p>
      <ul>
        <li>{{ t('privacySec3L1') }}</li>
        <li>{{ t('privacySec3L2') }}</li>
        <li>{{ t('privacySec3L3') }}</li>
        <li>{{ t('privacySec3L4') }}</li>
      </ul>

      <h2>{{ t('privacySec4Title') }}</h2>
      <p>{{ t('privacySec4P1') }}</p>
      <ul>
        <li>{{ t('privacySec4L1') }}</li>
        <li>{{ t('privacySec4L2') }}</li>
        <li>{{ t('privacySec4L3') }}</li>
      </ul>

      <h2>{{ t('privacySec5Title') }}</h2>
      <p>{{ t('privacySec5P1') }}</p>

      <h2>{{ t('privacySec6Title') }}</h2>
      <p>{{ t('privacySec6P1') }}</p>

      <h2>{{ t('privacySec7Title') }}</h2>
      <p>{{ t('privacySec7P1') }}</p>

      <h2>{{ t('privacySec8Title') }}</h2>
      <p>{{ t('privacySec8P1') }}</p>
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

code {
  background: rgba(0,0,0,0.3);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-family: 'JetBrains Mono', monospace;
  font-size: var(--text-body);
  color: var(--accent-amber);
}
</style>
