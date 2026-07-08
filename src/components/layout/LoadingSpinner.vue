<script setup>
defineProps({
  message: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <div class="loading-overlay">
    <div class="loading-content">
      <div class="thread-container">
        <!-- Waving Thread (SVG Path with Animation) -->
        <svg viewBox="0 0 100 20" class="waving-thread">
          <path d="M0 10 Q 12.5 0, 25 10 T 50 10 T 75 10 T 100 10" stroke="var(--accent-amber)" stroke-width="3" fill="none" stroke-linecap="round" />
        </svg>
      </div>
      <p v-if="message" class="loading-text">{{ message }}</p>
    </div>
  </div>
</template>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--glass-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.thread-container {
  width: 120px;
}

.waving-thread {
  width: 100%;
  height: auto;
  overflow: visible;
}

.waving-thread path {
  stroke-dasharray: 100;
  animation: wave 1.5s ease-in-out infinite;
}

@keyframes wave {
  0% {
    stroke-dashoffset: 100;
    transform: translateY(0);
  }
  50% {
    stroke-dashoffset: 0;
    transform: translateY(-5px);
  }
  100% {
    stroke-dashoffset: -100;
    transform: translateY(0);
  }
}

.loading-text {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary); /* --secondary-brown */
  margin: 0;
  letter-spacing: 0.5px;
}
</style>