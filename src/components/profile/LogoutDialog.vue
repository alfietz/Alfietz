<!-------- (LogoutDialog.vue) ./src/components/LogoutDialog.vue ------------>
<script setup>
defineEmits(['cancel', 'confirm'])
</script>

<template>
  <div class="dialog-overlay" @click.self="$emit('cancel')">
    <div class="dialog-card">
      <h2 class="dialog-title">Logout</h2>
      <p class="dialog-text">Are you sure you want to logout?</p>
      
      <div class="dialog-actions">
        <button class="btn-cancel" @click="$emit('cancel')">No</button>
        <button class="btn-confirm" @click="$emit('confirm')">Yes</button>
      </div>
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
  z-index: 2000;
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
}

.dialog-title {
  margin: 0 0 12px 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
}

.dialog-text {
  margin: 0 0 24px 0;
  font-size: 14px;
  color: var(--text-muted);
}

.dialog-actions {
  display: flex;
  gap: 12px;
}

.btn-cancel, .btn-confirm {
  flex: 1;
  padding: 14px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  background-color: transparent;
  border: 1px solid #5D8374;
  color: var(--text-amber);
}

.btn-cancel:hover { background: var(--wood-walnut); }

.btn-confirm {
  background: var(--accent-amber);
  border: 1px solid var(--accent-amber);
  color: white;
}

.btn-confirm:hover { background: var(--wood-polished); }
</style>