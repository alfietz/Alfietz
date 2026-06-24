<!-------- (TermsConditions.vue) ./src/components/legal/TermsConditions.vue ------------>
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
      <h1 class="title">{{ t('termsConditionsTitle') }}</h1>
    </div>

    <div class="content-scroll">
      <p class="last-updated">Last Updated: May 2026</p>

      <h2>{{ t('termsSec1Title') }}</h2>
      <p>{{ t('termsP1') }}</p>

      <h2>{{ t('termsSec2Title') }}</h2>
      <p>{{ t('termsSec2P1') }}</p>

      <h2>{{ t('termsSec3Title') }}</h2>
      <p>{{ t('termsSec3P1') }}</p>

      <h2>{{ t('termsSec4Title') }}</h2>
      <p>{{ t('termsSec4P1') }}</p>

      <h2>{{ t('termsSec5Title') }}</h2>
      <p>{{ t('termsSec5P1') }}</p>

      <h2>{{ t('termsSec6Title') }}</h2>
      <p>{{ t('termsSec6P1') }}</p>

      <h2>{{ t('termsSec7Title') }}</h2>
      <p>{{ t('termsSec7P1') }}</p>

      <h2>{{ t('termsSec8Title') }}</h2>
      <p>{{ t('termsSec8P1') }}</p>

      <h2>{{ t('termsSec9Title') }}</h2>
      <p>{{ t('termsSec9P1') }}</p>

      <h2>{{ t('termsSec10Title') }}</h2>
      <p>{{ t('termsSec10P1') }}</p>

      <h2>{{ t('termsSec11Title') }}</h2>
      <p>{{ t('termsSec11P1') }}</p>
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

strong {
  color: var(--text-primary);
  font-weight: 700;
}
</style>
