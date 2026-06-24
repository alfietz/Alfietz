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
  padding: var(--space-4);
  background: var(--glass-bg);
  backdrop-filter: blur(15px);
  z-index: 100;
  display: flex;
  gap: var(--space-4);
  align-items: center;
  border-bottom: 1px solid var(--glass-border);
}

.header-info {
  display: flex;
  flex-direction: column;
}

.results-title {
  font-size: var(--text-body-lg);
  font-weight: 800;
  margin: 0;
}

.results-count {
  font-size: var(--text-caption);
  color: var(--text-muted);
  font-weight: 600;
}

.filter-bar {
  display: flex;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  overflow-x: auto;
  white-space: nowrap;
}

.filter-chip {
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  background: var(--wood-walnut);
  border: 1px solid var(--glass-border);
  color: var(--text-muted);
  font-size: var(--text-caption);
  font-weight: 700;
  transition: all 0.2s;
}

.filter-chip.active {
  background: var(--accent-amber);
  color: white;
  border-color: var(--accent-amber);
}

.results-content {
  padding: 0 var(--space-4) var(--space-10);
}

.results-section {
  margin-top: var(--space-6);
}

.section-label {
  font-size: var(--text-caption);
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-amber);
  font-weight: 800;
  margin-bottom: var(--space-4);
}

.tailors-scroll {
  display: flex;
  gap: var(--space-3);
  overflow-x: auto;
  padding-bottom: var(--space-2);
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: var(--space-3);
}

.no-results {
  padding: var(--space-12) var(--space-5);
  text-align: center;
}

.no-results-icon {
  font-size: var(--text-display);
  margin-bottom: var(--space-4);
}

.no-results h2 {
  font-size: var(--text-h2);
  font-weight: 800;
  margin-bottom: var(--space-2);
}

.no-results p {
  font-size: var(--text-body);
  color: var(--text-muted);
  margin-bottom: var(--space-6);
}

.back-btn {
  background-color: var(--wood-walnut) !important;
  border: 1px solid var(--glass-border) !important;
  color: var(--text-primary) !important;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (min-width: 768px) {
  .results-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: var(--space-5);
  }
}
</style>