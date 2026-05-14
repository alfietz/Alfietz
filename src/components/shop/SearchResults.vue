<!-------- (SearchResults.vue) ./src/components/shop/SearchResults.vue ------------>
<script setup>
import ProductCard from './ProductCard.vue'

defineProps({
  results: {
    type: Array,
    default: () => []
  }
})

defineEmits(['go-back', 'go-details', 'toggle-like'])
</script>

<template>
  <div class="search-results-page">
    <div class="header-row">
      <button class="back-btn" @click="$emit('go-back')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <h1 class="title">Search results</h1>
    </div>

    <div v-if="results.length > 0" class="results-grid">
      <ProductCard 
        v-for="item in results" 
        :key="item.id" 
        :product="item" 
        @click="$emit('go-details', item)"
        @toggle-like="(p) => $emit('toggle-like', p)"
      />
    </div>
    <div v-else class="empty-results">
      <p>No products found matching your search.</p>
    </div>
  </div>
</template>

<style scoped>
.search-results-page {
  background-color: var(--wood-deep);
  min-height: 100vh;
  padding: 24px 20px;
}

.header-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.title {
  font-size: 22px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
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