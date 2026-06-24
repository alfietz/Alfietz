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
  padding: var(--space-5);
  font-family: 'Inter', -apple-system, sans-serif;
  backdrop-filter: blur(8px);
}

.dialog-card {
  background: var(--wood-deep);
  border-radius: var(--radius-lg);
  padding: var(--space-8) var(--space-6);
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
  margin-bottom: var(--space-6);
}

.dialog-title {
  margin: 0 0 var(--space-3) 0;
  font-size: var(--text-h2);
  font-weight: 700;
  color: var(--text-primary);
}

.dialog-text {
  margin: 0 0 var(--space-8) 0;
  font-size: var(--text-body);
  color: var(--text-muted);
  line-height: var(--leading-snug);
}

.btn-primary {
  width: 100%;
  padding: var(--space-4);
  border-radius: var(--radius-md);
  font-size: var(--text-body-lg);
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