<!-------- (SearchResults.vue) ./src/components/shop/SearchResults.vue ------------>
<script setup>
import { ref } from 'vue'
import ProductCard from './ProductCard.vue'
import SellerCard from './SellerCard.vue'

defineProps({
  results: {
    type: Object,
    default: () => ({ query: '', products: [], tailors: [] })
  }
})

const activeFilter = ref('all') // 'all', 'products', 'tailors'

const emit = defineEmits(['go-back', 'go-search-details', 'toggle-search-favorite', 'go-search-tailor'])
</script>

<template>
  <div class="search-results-page pattern-heritage animate-fade">
    <!-- Search Header -->
    <div class="results-header-glass">
      <button class="back-btn" @click="$emit('go-back')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <div class="header-info">
        <h1 class="results-title">Results for "{{ results.query }}"</h1>
        <p class="results-count">{{ results.products.length + results.tailors.length }} heritage items found</p>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="filter-bar">
      <button 
        class="filter-chip" 
        :class="{ active: activeFilter === 'all' }"
        @click="activeFilter = 'all'"
      >All</button>
      <button 
        class="filter-chip" 
        :class="{ active: activeFilter === 'products' }"
        @click="activeFilter = 'products'"
      >Trends ({{ results.products.length }})</button>
      <button 
        class="filter-chip" 
        :class="{ active: activeFilter === 'tailors' }"
        @click="activeFilter = 'tailors'"
      >Artisans ({{ results.tailors.length }})</button>
    </div>

    <div class="results-content">
      <!-- Tailors Row (Only in 'all' or 'tailors') -->
      <section v-if="(activeFilter === 'all' || activeFilter === 'tailors') && results.tailors.length > 0" class="results-section">
        <h3 class="section-label">Master Tailors</h3>
        <div class="tailors-scroll">
          <SellerCard 
            v-for="tailor in results.tailors" 
            :key="tailor.id" 
            :seller="tailor"
            @select="$emit('go-search-tailor', tailor)"
          />
        </div>
      </section>

      <!-- Products Grid -->
      <section v-if="(activeFilter === 'all' || activeFilter === 'products') && results.products.length > 0" class="results-section">
        <h3 class="section-label">Heritage Designs</h3>
        <div class="results-grid">
          <ProductCard 
            v-for="item in results.products" 
            :key="item.id" 
            :product="item" 
            @select="$emit('go-search-details', item)"
            @toggle-like="(p) => $emit('toggle-search-favorite', p)"
          />
        </div>
      </section>

      <!-- Empty State -->
      <div v-if="results.products.length === 0 && results.tailors.length === 0" class="no-results animate-scale">
        <div class="no-results-icon">🔍</div>
        <h2>No heritage matches</h2>
        <p>Try searching for "Ankara", "Maasai", or different artisan names.</p>
        <button class="primary-btn-outline" @click="$emit('go-back')">Try New Search</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.search-results-page {
  background-color: var(--wood-deep);
  min-height: 100vh;
}

.results-header-glass {
  position: sticky;
  top: 0;
  padding: 16px;
  background: var(--glass-bg);
  backdrop-filter: blur(15px);
  z-index: 100;
  display: flex;
  gap: 16px;
  align-items: center;
  border-bottom: 1px solid var(--glass-border);
}

.header-info {
  display: flex;
  flex-direction: column;
}

.results-title {
  font-size: 16px;
  font-weight: 800;
  margin: 0;
}

.results-count {
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 600;
}

.filter-bar {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  overflow-x: auto;
  white-space: nowrap;
}

.filter-chip {
  padding: 6px 14px;
  border-radius: 20px;
  background: var(--wood-walnut);
  border: 1px solid var(--glass-border);
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 700;
  transition: all 0.2s;
}

.filter-chip.active {
  background: var(--accent-amber);
  color: white;
  border-color: var(--accent-amber);
}

.results-content {
  padding: 0 16px 40px;
}

.results-section {
  margin-top: 24px;
}

.section-label {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-amber);
  font-weight: 800;
  margin-bottom: 16px;
}

.tailors-scroll {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
}

.no-results {
  padding: 80px 20px;
  text-align: center;
}

.no-results-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.no-results h2 {
  font-size: 20px;
  font-weight: 800;
  margin-bottom: 8px;
}

.no-results p {
  font-size: 14px;
  color: var(--text-muted);
  margin-bottom: 24px;
}

.back-btn {
  background-color: var(--wood-walnut) !important;
  border: 1px solid var(--glass-border) !important;
  color: var(--text-primary) !important;
}

@media (min-width: 768px) {
  .results-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
  }
}
</style>

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