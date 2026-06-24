<!-------- (WebHeader.vue) ./src/components/layout/WebHeader.vue ------------>
<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  activeTab: {
    type: String,
    default: 'home'
  },
  cartCount: {
    type: Number,
    default: 0
  },
  isGuest: {
    type: Boolean,
    default: true
  },
  canInstall: {
    type: Boolean,
    default: false
  },
  t: {
    type: Function,
    required: true
  }
})

const emit = defineEmits(['navigate', 'go-notifications', 'go-cart', 'install-app'])

const navItems = computed(() => {
  if (props.isGuest) {
    return ['home', 'login']
  }
  return ['home', 'favorites', 'chats', 'profile']
})

const isScrolled = ref(false)

const handleScroll = () => {
  isScrolled.value = window.scrollY > 10
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <header class="web-header" :class="{ 'scrolled': isScrolled }">
    <div class="header-content">
      <!-- Logo area - Restored with Original Logo + Ancestral Glow -->
      <div class="logo" @click="$emit('navigate', 'home')">
        <div class="logo-wrapper group">
          <div class="logo-circle">
            <img src="../../assets/logo.png" alt="Alfie Logo" class="logo-img" />
            <div class="logo-glow"></div>
          </div>
          <span class="brand-name">Alfie</span>
        </div>
      </div>

      <!-- Navigation Links -->
      <nav class="desktop-nav">
        <button 
          v-for="item in navItems"
          :key="item"
          class="nav-link" 
          :class="{ 
            active: activeTab === item,
            'login-link': item === 'login'
          }" 
          @click="$emit('navigate', item)"
        >
          {{ t(item) }}
          <span v-if="activeTab === item" class="active-glow"></span>
        </button>
      </nav>

      <!-- Actions -->
      <div class="header-actions">
        <button 
          v-if="canInstall"
          class="action-btn group" 
          aria-label="Download Alfie"
          @click="$emit('install-app')"
        >
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        </button>
        <button class="action-btn group" aria-label="Cart" @click="$emit('go-cart')">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          <span v-if="cartCount > 0" class="badge flex items-center justify-center text-[10px] font-bold text-white w-4 h-4 -top-1 -right-1 absolute">{{ cartCount }}</span>
        </button>
        <button class="action-btn group" @click="$emit('go-notifications')" aria-label="Notifications">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
          </svg>
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.web-header {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  width: 100%;
  background-color: var(--glass-bg);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--glass-border);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.web-header.scrolled {
  margin: var(--space-3) auto;
  width: calc(100% - 24px);
  max-width: 1400px;
  border-radius: var(--radius-lg);
  background-color: var(--glass-bg);
  border: 1px solid var(--glass-border);
  box-shadow: 0 10px 30px rgba(0,0,0,0.4);
  top: 12px;
}

.header-content {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 var(--space-3); 
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: height 0.4s ease;
}

.web-header.scrolled .header-content {
  height: 64px;
}

@media (min-width: 768px) {
  .header-content {
    padding: 0 var(--space-6);
    height: 80px;
  }
  .web-header.scrolled .header-content {
    height: 72px;
  }
}

.logo-wrapper {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.logo-circle {
  position: relative;
  width: 34px; /* Slightly smaller */
  height: 34px;
  background: white; 
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px;
  overflow: hidden;
  box-shadow: 0 0 10px rgba(0,0,0,0.5);
}

@media (min-width: 768px) {
  .logo-circle {
    width: 44px;
    height: 44px;
  }
}

.logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  position: relative;
  z-index: 2;
}

.logo-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle, var(--accent-glow) 0%, transparent 70%);
  opacity: 0.5;
  z-index: 1;
}

.brand-name {
  font-size: var(--text-h2);
  font-weight: 800;
  letter-spacing: 0.5px;
  background: linear-gradient(to right, var(--text-primary), var(--accent-amber));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

@media (min-width: 768px) {
  .brand-name {
    font-size: var(--text-h1);
    letter-spacing: 1px;
  }
}

.desktop-nav {
  display: none;
  gap: var(--space-10);
}

@media (min-width: 1024px) { 
  .desktop-nav {
    display: flex;
  }
}

.nav-link {
  font-size: var(--text-body);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: var(--text-muted);
  position: relative;
  padding: var(--space-2) 0;
  transition: color 0.3s ease;
}

.nav-link.active {
  color: var(--text-amber);
}

.login-link {
  color: var(--text-amber) !important;
  background: rgba(217, 119, 6, 0.1);
  padding: var(--space-2) var(--space-4) !important;
  border-radius: var(--radius-sm);
  border: 1px solid var(--glass-border);
}

.login-link:hover {
  background: var(--accent-glow);
  border-color: var(--accent-amber);
}

.active-glow {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background-color: var(--accent-amber);
  box-shadow: 0 0 10px var(--accent-glow);
  border-radius: 2px;
}

.header-actions {
  display: flex;
  gap: var(--space-2);
}

.action-btn {
  position: relative;
  background-color: var(--wood-walnut);
  border: 1px solid var(--glass-border);
  width: 38px; /* Optimized touch target balance */
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  transition: all 0.3s ease;
  -webkit-tap-highlight-color: transparent;
}

.action-btn:active {
  transform: scale(0.9);
  background-color: var(--wood-polished);
}

@media (min-width: 768px) {
  .action-btn {
    width: 42px;
    height: 42px;
  }
}

.mobile-hide {
  display: none;
}

@media (min-width: 480px) {
  .mobile-hide {
    display: flex;
  }
}

.pc-only {
  display: none;
}

@media (min-width: 768px) {
  .pc-only {
    display: flex;
  }
}

.action-btn:hover {
  background-color: var(--wood-polished);
  border-color: var(--accent-amber);
  color: var(--text-amber);
}

.icon {
  width: 18px;
  height: 18px;
}

.badge {
  position: absolute;
  top: 0;
  right: 0;
  width: 8px;
  height: 8px;
  background-color: var(--accent-amber);
  border-radius: 50%;
  border: 1.5px solid var(--wood-deep);
}
</style>