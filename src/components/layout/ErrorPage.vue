<script setup>
import { computed } from 'vue'

const props = defineProps({
  code: {
    type: [Number, String],
    default: 404
  },
  t: {
    type: Function,
    required: true
  }
})

const emit = defineEmits(['navigate'])

const errorData = computed(() => {
  switch (Number(props.code)) {
    case 403:
      return {
        title: props.t('error403Title'),
        message: props.t('error403Msg'),
        icon: '🔒'
      }
    case 500:
      return {
        title: props.t('error500Title'),
        message: props.t('error500Msg'),
        icon: '⚙️'
      }
    case 404:
    default:
      return {
        title: props.t('error404Title'),
        message: props.t('error404Msg'),
        icon: '🧭'
      }
  }
})
</script>

<template>
  <div class="error-page pattern-heritage">
    <div class="error-content">
      <div class="error-badge">{{ code }}</div>
      
      <div class="vibe-icon-container">
        <div class="vibe-icon-glow"></div>
        <div class="vibe-icon">{{ errorData.icon }}</div>
      </div>

      <h1 class="error-title">{{ errorData.title }}</h1>
      <p class="error-message">{{ errorData.message }}</p>

      <button @click="$emit('navigate', 'home')" class="primary-btn back-home-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="btn-icon">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        {{ t('backToHome') }}
      </button>
    </div>

    <!-- Decorative Elements -->
    <div class="decoration decoration-1"></div>
    <div class="decoration decoration-2"></div>
  </div>
</template>

<style scoped>
.error-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  position: relative;
  overflow: hidden;
  text-align: center;
}

.error-content {
  max-width: 400px;
  width: 100%;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  padding: 40px 24px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--glass-border);
  box-shadow: 0 20px 50px rgba(0,0,0,0.5);
}

.error-badge {
  background: var(--wood-walnut);
  color: var(--accent-amber);
  font-size: 14px;
  font-weight: 800;
  padding: 6px 16px;
  border-radius: 100px;
  border: 1px solid var(--accent-amber);
  margin-bottom: 32px;
  letter-spacing: 2px;
}

.vibe-icon-container {
  position: relative;
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32px;
}

.vibe-icon-glow {
  position: absolute;
  width: 100%;
  height: 100%;
  background: var(--accent-amber);
  filter: blur(40px);
  opacity: 0.3;
  border-radius: 50%;
  animation: pulse 2s infinite ease-in-out;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.3; }
  50% { transform: scale(1.2); opacity: 0.5; }
}

.vibe-icon {
  font-size: 64px;
  line-height: 1;
  z-index: 1;
}

.error-title {
  font-size: 28px;
  margin-bottom: 16px;
  color: var(--text-primary);
  font-weight: 800;
}

.error-message {
  font-size: 16px;
  color: var(--text-muted);
  margin-bottom: 40px;
  line-height: 1.6;
}

.back-home-btn {
  gap: 12px;
  max-width: 240px;
}

.btn-icon {
  transition: transform 0.3s ease;
}

.back-home-btn:hover .btn-icon {
  transform: scale(1.2);
}

.decoration {
  position: absolute;
  width: 300px;
  height: 300px;
  border: 2px solid var(--accent-amber);
  opacity: 0.05;
  border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
  pointer-events: none;
}

.decoration-1 {
  top: -100px;
  right: -100px;
  animation: spin-slow 25s linear infinite;
}

.decoration-2 {
  bottom: -100px;
  left: -100px;
  animation: spin-slow 30s linear infinite reverse;
}

@media (max-width: 480px) {
  .error-title {
    font-size: 24px;
  }
  .error-message {
    font-size: 14px;
  }
}
</style>
