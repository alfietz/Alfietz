<!-------- (SectionHeader.vue) ./src/components/layout/SectionHeader.vue ------------>
<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  showViewAll: {
    type: Boolean,
    default: true
  },
  linkText: {
    type: String,
    default: 'View all'
  }
})

defineEmits(['view-all'])
</script>

<template>
  <div class="section-header">
    <h3 class="section-title">{{ title }}</h3>
    <button 
      v-if="showViewAll" 
      class="view-all-btn" 
      @click="$emit('view-all')"
    >
      <span>{{ linkText }}</span>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="chevron-icon">
        <path d="m9 18 6-6-6-6"/>
      </svg>
    </button>
  </div>
</template>

<style scoped>
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
  padding: 0 4px;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.view-all-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--text-amber);
  font-size: 14px;
  font-weight: 600;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
}

.view-all-btn:hover {
  background-color: var(--wood-walnut);
  transform: translateX(2px);
}

.chevron-icon {
  transition: transform 0.2s ease;
}

.view-all-btn:hover .chevron-icon {
  transform: translateX(2px);
}

/* Dark theme specific adjustments if needed */
.dark-theme .view-all-btn:hover {
  background-color: var(--wood-polished);
}
</style>