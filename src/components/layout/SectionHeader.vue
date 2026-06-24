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
    default: ''
  },
  t: {
    type: Function,
    required: false
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
      <span>{{ linkText || (t ? t('viewAll') : 'View all') }}</span>
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
  margin-bottom: var(--space-4);
  padding: 0 var(--space-1);
}

.section-title {
  font-size: var(--text-h3);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  line-height: var(--leading-tight);
}

.view-all-btn {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  color: var(--text-amber);
  font-size: var(--text-caption);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
}

.view-all-btn:hover {
  background-color: var(--wood-walnut);
  transform: translateX(var(--space-1));
}

.chevron-icon {
  transition: transform 0.2s ease;
}

.view-all-btn:hover .chevron-icon {
  transform: translateX(var(--space-1));
}
</style>
