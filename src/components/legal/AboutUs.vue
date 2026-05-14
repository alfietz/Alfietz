<!-------- (AboutUs.vue) ./src/components/AboutUs.vue ------------>
<script setup>
defineEmits(['go-back'])
</script>

<template>
  <div class="about-page">
    <div class="header-row">
      <button class="back-btn" @click="$emit('go-back')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <h1 class="title">About Us</h1>
    </div>

    <div class="about-content">
      <!-- App Identity -->
      <div class="brand-showcase">
        <div class="logo-container">
          <img src="../../assets/logo.png" alt="Alfie Logo" class="logo-img" />
        </div>
        <p class="company-name">By REBi Group</p>
      </div>

      <!-- Mission Statement -->
      <div class="mission-card">
        <h3>The Spirit of AfriFashion</h3>
        <p>
          At <strong>African Trends</strong>, we believe that fashion is the ultimate storyteller of heritage. 
          Our platform serves as a vibrant bridge connecting the world with the soulful craftsmanship 
          of master tailors and visionary designers across the continent.
        </p>
        <p>
          From the intricate weaves of Kente to the bold expressions of Ankara, we are dedicated to 
          elevating traditional techniques through modern silhouettes. We empower local artisans 
          to showcase their heritage competitively, ensuring every garment tells a story of 
          authenticity, pride, and unparalleled skill.
        </p>
      </div>

      <!-- App Version -->
      <div class="version-info">
        <p>Celebrating Heritage Since 2024</p>
        <p>© 2024 REBi Group - African Trends Initiative</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.about-page { background-color: var(--wood-deep); min-height: 100vh; padding: 24px 20px; display: flex; flex-direction: column; }
.header-row { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; flex-shrink: 0; }
.title { font-size: 22px; font-weight: 600; color: var(--text-primary); margin: 0; }

.about-content { flex: 1; display: flex; flex-direction: column; align-items: center; }

.brand-showcase { display: flex; flex-direction: column; align-items: center; margin-bottom: 40px; margin-top: 20px; }
.company-name { font-size: 14px; font-weight: 500; color: var(--text-muted); margin: 0; }

.mission-card { background: var(--wood-walnut); border-radius: 16px; padding: 24px; width: 100%; margin-bottom: 40px; }
.mission-card h3 { font-size: 18px; font-weight: 600; color: var(--text-amber); margin: 0 0 12px 0; }
.mission-card p { font-size: 14px; color: var(--text-primary); line-height: 1.6; margin: 0 0 16px 0; }
.mission-card p:last-child { margin-bottom: 0; }

.version-info { text-align: center; margin-top: auto; padding-bottom: 24px; }
.version-info p { font-size: 12px; color: var(--text-light); margin: 4px 0; }

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