<!-------- (WebHeader.vue) ./src/components/layout/WebHeader.vue ------------>
<script setup>
defineProps({
  activeTab: {
    type: String,
    default: 'home'
  },
  t: {
    type: Function,
    required: true
  }
})

defineEmits(['navigate', 'go-notifications'])
</script>

<template>
  <header class="web-header">
    <div class="header-content">
      <!-- Logo -->
      <div class="logo" @click="$emit('navigate', 'home')">
        <div class="logo-container header-logo">
          <img src="../../assets/logo.png" alt="Tribe Design Logo" class="logo-img" />
        </div>
      </div>

      <!-- Navigation Links (Desktop Only) -->
      <nav class="desktop-nav">
        <button 
          class="nav-link" 
          :class="{ active: activeTab === 'home' }" 
          @click="$emit('navigate', 'home')"
        >
          {{ t('home') }}
        </button>
        <button 
          class="nav-link" 
          :class="{ active: activeTab === 'favorites' }" 
          @click="$emit('navigate', 'favorites')"
        >
          {{ t('favorites') }}
        </button>
        <button 
          class="nav-link" 
          :class="{ active: activeTab === 'profile' }" 
          @click="$emit('navigate', 'profile')"
        >
          {{ t('profile') }}
        </button>
      </nav>

      <!-- Actions (Visible on Mobile & Desktop) -->
      <div class="header-actions">
        <button class="action-btn">🛍️</button>
        <button class="action-btn" @click="$emit('go-notifications')">🔔</button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.web-header {
  background-color: var(--bg-white);
  border-bottom: 1px solid var(--border-light);
  position: sticky;
  top: 0;
  z-index: 1000;
  width: 100%;
}

.header-content {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 20px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

@media (min-width: 768px) {
  .header-content {
    padding: 0 24px;
    height: 72px;
  }
}

.logo {
  cursor: pointer;
  display: flex;
  align-items: center;
}

.logo-container.header-logo {
  width: 44px;
  height: 44px;
  padding: 6px;
  margin-bottom: 0;
  margin-left: 0;
  margin-right: 0;
}

@media (min-width: 768px) {
  .logo-container.header-logo {
    width: 48px;
    height: 48px;
  }
}

.logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.desktop-nav {
  display: none;
  gap: var(--spacing-xl);
}

@media (min-width: 768px) {
  .desktop-nav {
    display: flex;
  }
}

.nav-link {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-muted);
  padding: 8px 0;
  position: relative;
  transition: color 0.2s;
}

.nav-link:hover {
  color: var(--primary-green);
}

.nav-link.active {
  color: var(--primary-green);
  font-weight: 600;
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background-color: var(--primary-green);
  border-radius: 2px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  background-color: var(--primary-tan);
  border-radius: var(--radius-full);
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.2s;
}

@media (min-width: 768px) {
  .action-btn {
    width: 40px;
    height: 40px;
    font-size: 18px;
  }
}

.action-btn:hover {
  background-color: var(--primary-green);
  color: white;
}
</style>