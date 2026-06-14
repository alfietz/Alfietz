<script setup>
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  isStandalone: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['install', 'close'])
</script>

<template>
  <Transition name="slide-in">
    <div v-if="show && !isStandalone" class="pwa-install-banner">
      <div class="banner-content">
        <div class="banner-icon">
          <img src="/favicon.png" alt="Alfie Logo" class="app-logo" />
        </div>
        <div class="banner-text">
          <h3>Tailor shop in your pocket</h3>
          <p>Tap to download Alfie for instant access to premium fits and direct artisan messaging.</p>
        </div>
        <div class="banner-actions">
          <button @click="$emit('install')" class="btn-install">Install Alfie</button>
          <button @click="$emit('close')" class="btn-close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.pwa-install-banner {
  position: fixed;
  bottom: var(--spacing-lg);
  right: var(--spacing-lg);
  z-index: 10000;
  max-width: 400px;
  width: calc(100% - (var(--spacing-lg) * 2));
  background: var(--wood-deep);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);
}

/* Fail-safe: Hide if display mode is standalone */
@media (display-mode: standalone) {
  .pwa-install-banner {
    display: none !important;
  }
}

.banner-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.app-logo {
  width: 3.25rem;
  height: 3.25rem;
  border-radius: var(--radius-sm);
  object-fit: cover;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

.banner-text {
  flex: 1;
}

.banner-text h3 {
  font-size: var(--font-base);
  font-weight: 700;
  color: var(--text-primary);
  font-family: 'Playfair Display', serif;
}

.banner-text p {
  margin-top: 0.25rem;
  font-size: var(--font-xs);
  color: var(--text-muted);
  line-height: 1.3;
}

.banner-actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  align-items: flex-end;
}

.btn-install {
  background: var(--accent-gold);
  color: #2A1810;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-full);
  font-size: var(--font-xs);
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: transform 0.2s;
  line-height: 1;
}

.btn-install:hover {
  transform: scale(1.05);
}

.btn-close {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Transitions */
.slide-in-enter-active,
.slide-in-leave-active {
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-in-enter-from,
.slide-in-leave-to {
  opacity: 0;
  transform: translateX(50px);
}

@media (max-width: 600px) {
  .pwa-install-banner {
    bottom: 5rem; /* Above the navigation bar */
    left: var(--spacing-sm);
    right: var(--spacing-sm);
    width: auto;
    max-width: none;
  }
}
</style>
