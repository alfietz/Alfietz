<!-------- (FeedbackSuccessDialog.vue) ./src/components/FeedbackSuccessDialog.vue ------------>
<script setup>
defineEmits(['close'])
</script>

<template>
  <div class="dialog-overlay" @click.self="$emit('close')">
    <div class="dialog-card">
      <div class="icon-circle">
        <!-- Thumbs Up Icon -->
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
        </svg>
      </div>
      
      <h2 class="dialog-title">Your feedback submitted</h2>
      <p class="dialog-text">Your review has been submitted successfully.</p>
      
      <button class="btn-primary" @click="$emit('close')">Ok</button>
    </div>
  </div>
</template>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--glass-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  padding: 20px;
  font-family: 'Inter', -apple-system, sans-serif;
  backdrop-filter: blur(8px);
}

.dialog-card {
  background: var(--wood-deep);
  border-radius: 20px;
  padding: 32px 24px;
  width: 100%;
  max-width: 320px;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.icon-circle {
  width: 80px;
  height: 80px;
  background: var(--accent-amber);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.dialog-title {
  margin: 0 0 12px 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
}

.dialog-text {
  margin: 0 0 32px 0;
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.5;
}

.btn-primary {
  width: 100%;
  padding: 14px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  background: var(--accent-amber);
  border: none;
  color: white;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background: var(--wood-polished);
}
</style>