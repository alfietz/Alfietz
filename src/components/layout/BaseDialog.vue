<script setup>
defineProps({
  show: Boolean,
  title: String,
  message: String,
  confirmText: {
    type: String,
    default: 'OK'
  },
  cancelText: {
    type: String,
    default: 'Cancel'
  },
  isConfirm: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'info' // 'info', 'error', 'success', 'warning'
  }
})

defineEmits(['close', 'confirm', 'cancel'])
</script>

<template>
  <Transition name="fade">
    <div v-if="show" class="dialog-overlay" @click.self="$emit('close')">
      <Transition name="scale">
        <div v-if="show" class="dialog-card" :class="type">
          <div class="dialog-icon" v-if="type !== 'info'">
            <svg v-if="type === 'success'" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <svg v-else-if="type === 'error'" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <svg v-else-if="type === 'warning'" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
          
          <h2 class="dialog-title" v-if="title">{{ title }}</h2>
          <p class="dialog-text">{{ message }}</p>
          
          <div class="dialog-actions">
            <button v-if="isConfirm" class="btn-cancel" @click="$emit('cancel')">{{ cancelText }}</button>
            <button class="btn-confirm" @click="$emit('confirm')">{{ confirmText }}</button>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.dialog-card {
  background: var(--wood-deep);
  border: 1px solid var(--glass-border);
  border-radius: 24px;
  padding: 32px;
  width: 100%;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 20px 50px rgba(0,0,0,0.5);
}

.dialog-icon {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
}

.error .dialog-icon { color: #EF4444; }
.success .dialog-icon { color: #10B981; }
.warning .dialog-icon { color: #F59E0B; }

.dialog-title {
  margin: 0 0 12px 0;
  font-size: 22px;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.5px;
}

.dialog-text {
  margin: 0 0 32px 0;
  font-size: 15px;
  line-height: 1.6;
  color: var(--text-muted);
}

.dialog-actions {
  display: flex;
  gap: 12px;
}

.btn-cancel, .btn-confirm {
  flex: 1;
  padding: 16px;
  border-radius: 16px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-cancel {
  background: var(--wood-walnut);
  border: 1px solid var(--glass-border);
  color: var(--text-primary);
}

.btn-cancel:hover { background: var(--wood-polished); }

.btn-confirm {
  background: var(--accent-amber);
  color: white;
  box-shadow: 0 4px 15px var(--accent-glow);
}

.btn-confirm:hover { transform: translateY(-2px); box-shadow: 0 6px 20px var(--accent-glow); }

/* Animations */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.scale-enter-active, .scale-leave-active { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.scale-enter-from, .scale-leave-to { opacity: 0; transform: scale(0.9); }
</style>
