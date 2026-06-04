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
  margin-bottom: 60px;
  margin-top: 20px;
}

.logo-img {
  width: 120px;
  height: auto;
  margin-bottom: 16px;
  filter: drop-shadow(0 0 20px rgba(212, 175, 55, 0.2));
}

.company-name {
  font-size: 14px;
  font-weight: 800;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 2px;
  margin: 0;
}

.mission-card {
  background: var(--wood-walnut);
  border: 1px solid var(--glass-border);
  border-radius: 24px;
  padding: 32px;
  width: 100%;
  margin-bottom: 60px;
}

.mission-card h3 {
  font-size: 20px;
  font-weight: 800;
  color: var(--text-amber);
  margin: 0 0 16px 0;
  text-transform: uppercase;
}

.mission-card p {
  font-size: 15px;
  color: var(--text-muted);
  line-height: 1.7;
  margin: 0 0 20px 0;
}

.mission-card p:last-child {
  margin-bottom: 0;
}

.version-info {
  text-align: center;
  margin-top: auto;
  padding-bottom: 40px;
}

.version-info p {
  font-size: 12px;
  color: var(--text-muted);
  margin: 4px 0;
  font-weight: 600;
}

strong {
  color: var(--text-primary);
  font-weight: 700;
}
</style>
