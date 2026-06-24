<!-------- (CategoryList.vue) ./src/components/shop/CategoryList.vue ------------>
<script setup>
import { CATEGORY_EXAMPLES_DETAILED as categoryExamples } from '../../constants'

const props = defineProps({
  categories: {
    type: Array,
    default: () => []
  }
})

defineEmits(['go-back', 'select-category'])
</script>

<template>
  <div class="category-list-page">
    <div class="category-grid">
      <div 
        v-for="cat in categories" 
        :key="cat.id" 
        class="category-item"
        @click="$emit('select-category', cat.name)"
      >
        <div class="cat-info">
          <h3 class="cat-name">{{ cat.name }}</h3>
          <p class="cat-examples" v-if="categoryExamples[cat.name]">
            Examples: {{ categoryExamples[cat.name] }}
          </p>
          <p class="cat-count">{{ cat.count || 0 }} Products</p>
        </div>
        <div class="cat-chevron">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.category-list-page {
  background-color: var(--wood-deep);
  min-height: 100vh;
  padding: var(--space-6) var(--space-5) 100px;
}

.header-row {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-8);
}

.title {
  font-size: var(--text-h1);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.category-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.category-item {
  background: var(--wood-walnut);
  padding: var(--space-5);
  border-radius: var(--radius-lg);
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: transform 0.2s;
}

.category-item:hover {
  transform: scale(1.02);
}

.cat-name {
  font-size: var(--text-body-lg);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 var(--space-1) 0;
}

.cat-examples {
  font-size: var(--text-body);
  color: var(--text-amber);
  font-style: italic;
  margin: 0 0 var(--space-2) 0;
}

.cat-count {
  font-size: var(--text-caption);
  color: var(--text-muted);
  margin: 0;
}

.cat-chevron {
  color: var(--text-amber);
}
</style>