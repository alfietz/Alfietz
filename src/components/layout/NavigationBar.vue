<!-------- (NavigationBar.vue) ./src/components/NavigationBar.vue ------------>
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

defineEmits(['navigate'])
</script>

<template>
  <nav class="bottom-nav">
    <div class="nav-item" :class="{ active: activeTab === 'home' }" @click="$emit('navigate', 'home')">
      <span class="nav-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" :stroke="activeTab === 'home' ? 'var(--primary-green)' : 'var(--text-muted)'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
      </span>
      <span>{{ t('home') }}</span>
    </div>
    <div class="nav-item" :class="{ active: activeTab === 'favorites' }" @click="$emit('navigate', 'favorites')">
      <span class="nav-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" :stroke="activeTab === 'favorites' ? 'var(--primary-green)' : 'var(--text-muted)'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
      </span>
      <span>{{ t('favorites') }}</span>
    </div>
    <div class="nav-item" :class="{ active: activeTab === 'profile' }" @click="$emit('navigate', 'profile')">
      <span class="nav-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" :stroke="activeTab === 'profile' ? 'var(--primary-green)' : 'var(--text-muted)'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      </span>
      <span>{{ t('profile') }}</span>
    </div>
  </nav>
</template>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 1440px;
  background: white;
  display: flex;
  justify-content: space-around;
  padding: 16px 20px 24px 20px;
  border-top: 1px solid var(--border-light);
  z-index: 100;
}

@media (min-width: 768px) {
  .bottom-nav {
    display: none;
  }
}
.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--text-muted);
  font-size: 12px;
  cursor: pointer;
  gap: 4px;
  transition: all 0.2s;
}
.nav-item.active {
  color: var(--primary-green);
  font-weight: 600;
}
.nav-icon { 
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>