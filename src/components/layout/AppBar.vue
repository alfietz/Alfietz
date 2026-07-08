<!-------- (AppBar.vue) ./src/components/AppBar.vue ------------>
<script setup>
defineProps({
  title: {
    type: String,
    default: 'name'
  }
})

defineEmits(['go-back'])
</script>

<template>
  <header class="app-bar">
    <button class="back-btn" @click="$emit('go-back')">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m15 18-6-6 6-6"/>
      </svg>
    </button>
    <h1 class="title">{{ title }}</h1>
  </header>
</template>

<style scoped>
.app-bar {
  background-color: var(--wood-deep);
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  width: 100%;
  box-sizing: border-box;
}

.title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
}

.back-btn {
  background-color: var(--wood-walnut) !important;
  border: 1px solid var(--glass-border) !important;
  color: var(--text-primary) !important;
  transition: all 0.2s ease !important;
}

.back-btn:hover {
  background-color: var(--wood-polished) !important;
  border-color: var(--accent-amber) !important;
}

.back-btn {
  background-color: var(--wood-walnut) !important;
  border: 1px solid var(--glass-border) !important;
  color: var(--text-primary) !important;
  transition: all 0.2s ease !important;
}

.back-btn:hover {
  background-color: var(--wood-polished) !important;
  border-color: var(--accent-amber) !important;
}
</style>