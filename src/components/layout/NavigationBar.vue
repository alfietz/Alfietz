<!-------- (NavigationBar.vue) ./src/components/NavigationBar.vue ------------>
<script setup>
import { computed } from 'vue'

const props = defineProps({
  activeTab: {
    type: String,
    default: 'home'
  },
  t: {
    type: Function,
    required: true
  }
})

const emit = defineEmits(['navigate'])

const STORAGE_KEY_PREFIX = 'alfie_app_'
const isGuest = computed(() => {
  const storedUser = localStorage.getItem(STORAGE_KEY_PREFIX + 'user_data')
  if (!storedUser) return true
  try {
    const user = JSON.parse(storedUser)
    return user.id === 'guest'
  } catch (e) {
    return true
  }
})

const navItems = computed(() => {
  const items = ['home', 'favorites']
  if (!isGuest.value) {
    items.push('chats', 'profile')
  }
  return items
})
</script>

<template>
  <nav class="bottom-nav">
    <button 
      v-for="item in navItems"
      :key="item"
      class="nav-item" 
      :class="{ active: activeTab === item }" 
      @click="$emit('navigate', item)"
      :aria-label="t(item)"
      :aria-current="activeTab === item ? 'page' : undefined"
    >
      <div class="icon-container">
        <svg v-if="item === 'home'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        <svg v-else-if="item === 'favorites'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
        <svg v-else-if="item === 'chats'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-13.4 8.38 8.38 0 0 1 3.8.9L21 3z"/></svg>
        <svg v-else-if="item === 'profile'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        <div v-if="activeTab === item" class="active-dot"></div>
      </div>
      <span class="nav-label">{{ t(item) }}</span>
    </button>

    <button v-if="isGuest" class="nav-item join-tribe-btn" @click="$emit('navigate', 'login')">
      <div class="tribe-icon-box">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
      </div>
      <span class="nav-label">Join Us</span>
    </button>
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
  background-color: var(--glass-bg);
  backdrop-filter: blur(25px);
  display: flex;
  justify-content: space-around;
  padding: 12px 10px 32px 10px; /* Extra bottom padding for modern mobile home indicators */
  border-top: 1px solid var(--glass-border);
  z-index: 1000;
  box-shadow: 0 -10px 25px rgba(0,0,0,0.5);
}

@media (min-width: 768px) {
  .bottom-nav {
    display: none;
  }
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  -webkit-tap-highlight-color: transparent;
  background: none;
  border: none;
  padding: 0;
  font: inherit;
}

.icon-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  margin-bottom: 4px;
}

.nav-item.active {
  color: var(--text-amber);
  transform: translateY(-4px);
}

.nav-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.8;
}

.nav-item.active .nav-label {
  opacity: 1;
}

.join-tribe-btn {
  color: var(--text-amber) !important;
}

.tribe-icon-box {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, var(--wood-walnut), var(--wood-deep));
  border: 1px solid var(--accent-amber);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.3);
}

.active-dot {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 6px;
  height: 6px;
  background-color: var(--accent-amber);
  border-radius: 50%;
  box-shadow: 0 0 8px var(--accent-glow);
}
</style>