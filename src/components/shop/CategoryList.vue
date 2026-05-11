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
  padding: 24px 20px 100px;
}

.header-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
}

.title {
  font-size: 22px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.category-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.category-item {
  background: var(--wood-walnut);
  padding: 20px;
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
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.cat-examples {
  font-size: 13px;
  color: var(--text-amber);
  font-style: italic;
  margin: 0 0 8px 0;
}

.cat-count {
  font-size: 12px;
  color: var(--text-muted);
  margin: 0;
}

.cat-chevron {
  color: var(--text-amber);
}
</style>