<!-------- (AboutUs.vue) ./src/components/legal/AboutUs.vue ------------>
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
  <div class="about-page pattern-heritage animate-fade">
    <div class="header-row">
      <button class="back-btn" @click="$emit('go-back')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <h1 class="title">{{ t('aboutUs') }}</h1>
    </div>

    <div class="about-content">
      <!-- App Identity -->
      <div class="brand-showcase">
        <div class="logo-container">
          <img src="../../assets/logo.png" alt="Alfie Logo" class="logo-img" />
        </div>
        <p class="company-name">{{ t('independentMarketplace') }}</p>
      </div>

      <!-- Mission Statement -->
      <div class="mission-card">
        <h3>{{ t('spiritOfAlfie') }}</h3>
        <p>
          {{ t('missionP1') }}
        </p>
        <p>
          {{ t('missionP2') }}
        </p>
      </div>

      <!-- App Version -->
      <div class="version-info">
        <p>{{ t('celebratingSince') }}</p>
        <p>© 2024 Alfietz - {{ t('heritageInitiative') }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.about-page {
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
}

.about-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.brand-showcase {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: var(--space-12);
  margin-top: var(--space-5);
}

.logo-img {
  width: 120px;
  height: auto;
  margin-bottom: var(--space-4);
  filter: drop-shadow(0 0 20px rgba(212, 175, 55, 0.2));
}

.company-name {
  font-size: var(--text-body);
  font-weight: 800;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 2px;
  margin: 0;
}

.mission-card {
  background: var(--wood-walnut);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: var(--space-8);
  width: 100%;
  margin-bottom: var(--space-12);
}

.mission-card h3 {
  font-size: var(--text-h2);
  font-weight: 800;
  color: var(--text-amber);
  margin: 0 0 var(--space-4) 0;
  text-transform: uppercase;
}

.mission-card p {
  font-size: var(--text-body-lg);
  color: var(--text-muted);
  line-height: var(--leading-relaxed);
  margin: 0 0 var(--space-5) 0;
}

.mission-card p:last-child {
  margin-bottom: 0;
}

.version-info {
  text-align: center;
  margin-top: auto;
  padding-bottom: var(--space-10);
}

.version-info p {
  font-size: var(--text-caption);
  color: var(--text-muted);
  margin: var(--space-1) 0;
  font-weight: 600;
}

strong {
  color: var(--text-primary);
  font-weight: 700;
}
</style>
