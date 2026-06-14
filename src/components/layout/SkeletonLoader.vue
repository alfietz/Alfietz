<script setup>
defineProps({
  t: {
    type: Function,
    required: true
  }
})
</script>

<template>
  <div class="skeleton-shell">
    <!-- Header Skeleton -->
    <div class="skeleton-header">
      <div class="skeleton-logo pulse"></div>
      <div class="skeleton-nav">
        <div class="skeleton-nav-item pulse" v-for="i in 3" :key="i"></div>
      </div>
      <div class="skeleton-actions">
        <div class="skeleton-circle pulse" v-for="i in 2" :key="i"></div>
      </div>
    </div>

    <div class="skeleton-content">
      <!-- Hero/Banner Skeleton -->
      <div class="skeleton-hero pulse"></div>

      <!-- Categories Skeleton -->
      <div class="skeleton-section">
        <div class="skeleton-title pulse"></div>
        <div class="skeleton-scroll">
          <div class="skeleton-category pulse" v-for="i in 5" :key="i"></div>
        </div>
      </div>

      <!-- Product Grid Skeleton -->
      <div class="skeleton-section">
        <div class="skeleton-title pulse"></div>
        <div class="skeleton-grid">
          <div class="skeleton-card" v-for="i in 4" :key="i">
            <div class="skeleton-img pulse"></div>
            <div class="skeleton-info">
              <div class="skeleton-line pulse w-3/4"></div>
              <div class="skeleton-line pulse w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.skeleton-shell {
  width: 100%;
  min-height: 100vh;
  background-color: var(--wood-deep);
  padding-bottom: 100px;
}

.pulse {
  background: linear-gradient(90deg, var(--wood-walnut) 25%, var(--wood-polished) 50%, var(--wood-walnut) 75%);
  background-size: 200% 100%;
  animation: pulse 1.5s infinite linear;
}

@keyframes pulse {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.skeleton-header {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--spacing-md);
  border-bottom: 1px solid var(--glass-border);
}

.skeleton-logo {
  width: 100px;
  height: 24px;
  border-radius: var(--radius-sm);
}

.skeleton-nav {
  display: none;
  gap: var(--spacing-lg);
}

@media (min-width: 1024px) {
  .skeleton-header { height: 80px; }
  .skeleton-nav { display: flex; }
}

.skeleton-nav-item {
  width: 60px;
  height: 14px;
  border-radius: var(--radius-sm);
}

.skeleton-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.skeleton-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.skeleton-content {
  padding: var(--spacing-md);
}

.skeleton-hero {
  width: 100%;
  aspect-ratio: 16/9;
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-lg);
}

.skeleton-section {
  margin-bottom: var(--spacing-xl);
}

.skeleton-title {
  width: 150px;
  height: 20px;
  border-radius: var(--radius-sm);
  margin-bottom: var(--spacing-md);
}

.skeleton-scroll {
  display: flex;
  gap: var(--spacing-md);
  overflow: hidden;
}

.skeleton-category {
  min-width: 80px;
  height: 100px;
  border-radius: var(--radius-md);
}

.skeleton-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
}

.skeleton-card {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.skeleton-img {
  width: 100%;
  aspect-ratio: 1;
  border-radius: var(--radius-md);
}

.skeleton-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-line {
  height: 12px;
  border-radius: var(--radius-sm);
}

.w-3\/4 { width: 75%; }
.w-1\/2 { width: 50%; }
</style>
