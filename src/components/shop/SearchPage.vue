<!-------- (SearchPage.vue) ./src/components/SearchPage.vue ------------>
<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { CATEGORY_EXAMPLES_SIMPLE as categoryExamples } from '../../constants'

const props = defineProps({
  categories: {
    type: Array,
    default: () => []
  },
  searchHistory: {
    type: Array,
    default: () => []
  },
  results: {
    type: Object,
    default: () => ({ query: '', products: [], tailors: [] })
  },
  t: {
    type: Function,
    required: true
  }
})

const searchQuery = ref('')
const isFocused = ref(false)
const isSearching = ref(false)
const emit = defineEmits(['go-back', 'search', 'select-category', 'go-tailor', 'go-product'])

const recommendedKeywords = computed(() => {
  if (!searchQuery.value.trim()) return ['Kente', 'Wedding', 'Ankara', 'Suits', 'Silk']
  
  // Extract unique words from current results for smart suggestions
  const words = new Set()
  props.results.products.forEach(p => {
    p.name.split(' ').forEach(w => {
      if (w.length > 3) words.add(w.replace(/[^a-zA-Z]/g, ''))
    })
  })
  return Array.from(words).slice(0, 5)
})

const handleSearch = (query, navigate = true) => {
  const q = query || searchQuery.value
  if (q.trim()) {
    emit('search', q, navigate)
  }
}

// Live search as user types
let searchTimeout = null
watch(searchQuery, (newVal) => {
  if (searchTimeout) clearTimeout(searchTimeout)
  if (!newVal.trim()) {
    isSearching.value = false
    return
  }
  
  isSearching.value = true
  searchTimeout = setTimeout(() => {
    emit('search', newVal, false) // Fetch but don't navigate
    setTimeout(() => { isSearching.value = false }, 500)
  }, 400) 
})
</script>

<template>
  <div class="search-page pattern-heritage animate-fade">
    <!-- Header -->
    <div class="search-header-glass">
      <button class="back-btn" @click="$emit('go-back')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <div class="search-input-box" :class="{ 'focused': isFocused, 'scanning': isSearching }">
        <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <input 
          type="text" 
          v-model="searchQuery" 
          :placeholder="t('search') + ' heritage...'" 
          class="search-input" 
          @focus="isFocused = true"
          @blur="setTimeout(() => isFocused = false, 200)"
          @keyup.enter="handleSearch(null, true)"
        />
        <button v-if="searchQuery" class="clear-btn" @click="searchQuery = ''">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <!-- Non-blocking Progress Bar -->
      <div v-if="isSearching" class="header-loader-bar"></div>
    </div>

    <div class="search-content">
      <!-- Smart Keyword Recommendations -->
      <div class="keyword-recommendations animate-fade">
        <button 
          v-for="word in recommendedKeywords" 
          :key="word" 
          class="keyword-chip"
          @click="searchQuery = word; handleSearch(word, false)"
        >
          {{ word }}
        </button>
      </div>

      <!-- Quick Search Skeletons (While Fetching) -->
      <div v-if="isSearching" class="quick-results skeletons">
        <div class="quick-section">
          <div class="skeleton-title"></div>
          <div class="quick-list">
            <div v-for="n in 2" :key="n" class="quick-item">
              <div class="skeleton-circle"></div>
              <div class="quick-info">
                <div class="skeleton-line name"></div>
                <div class="skeleton-line bio"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="quick-section">
          <div class="skeleton-title"></div>
          <div class="quick-list">
            <div v-for="n in 3" :key="n" class="quick-item">
              <div class="skeleton-square"></div>
              <div class="quick-info">
                <div class="skeleton-line name"></div>
                <div class="skeleton-line meta"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Live Quick Results -->
      <div v-else-if="searchQuery && (results.products.length || results.tailors.length)" class="quick-results animate-fade">
        <!-- Artisans -->
        <div v-if="results.tailors.length" class="quick-section">
          <h3 class="section-title mini">Artisans</h3>
          <div class="quick-list">
            <div 
              v-for="tailor in results.tailors.slice(0, 3)" 
              :key="tailor.id" 
              class="quick-item tap-active"
              @click="$emit('go-tailor', tailor)"
            >
              <img :src="tailor.avatar" class="quick-avatar" />
              <div class="quick-info">
                <span class="quick-name">{{ tailor.name }}</span>
                <span class="quick-meta">{{ tailor.bio }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Products -->
        <div v-if="results.products.length" class="quick-section">
          <h3 class="section-title mini">Heritage Pieces</h3>
          <div class="quick-list">
            <div 
              v-for="item in results.products.slice(0, 4)" 
              :key="item.id" 
              class="quick-item tap-active"
              @click="$emit('go-product', item)"
            >
              <img :src="item.image" class="quick-thumb" />
              <div class="quick-info">
                <span class="quick-name">{{ item.name }}</span>
                <span class="quick-meta">{{ item.price }} • {{ item.category_name }}</span>
              </div>
            </div>
          </div>
        </div>

        <button class="see-all-btn" @click="handleSearch(null, true)">
          See all {{ results.products.length + results.tailors.length }} results →
        </button>
      </div>

      <!-- No Results Catch -->
      <div v-else-if="searchQuery && !isSearching" class="no-results-catch animate-scale">
        <div class="empty-icon">📭</div>
        <h4>No heritage matches for "{{ searchQuery }}"</h4>
        <p>Try different keywords like "Kente", "Ankara", or artisan names.</p>
        <button class="text-link" @click="searchQuery = ''">Reset Search</button>
      </div>

      <!-- Initial State (Recent Searches & Categories) -->
      <template v-if="!searchQuery && !isSearching">
        <!-- Recent Searches -->
        <section v-if="searchHistory.length > 0" class="search-section animate-slide-up">
          <div class="section-top">
            <h3 class="section-title">Recent Searches</h3>
            <button class="text-link" @click="$emit('clear-history')">Clear</button>
          </div>
          <div class="history-list">
            <div 
              v-for="item in searchHistory" 
              :key="item" 
              class="history-item tap-active"
              @click="handleSearch(item)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>{{ item }}</span>
            </div>
          </div>
        </section>

        <!-- Popular Categories -->
        <section class="search-section animate-slide-up" :style="{ animationDelay: '0.1s' }">
          <h3 class="section-title">Explore Categories</h3>
          <div class="category-grid">
            <button 
              v-for="cat in categories" 
              :key="cat.id" 
              class="cat-card tap-active"
              @click="$emit('select-category', cat.name)"
            >
              <div class="cat-content">
                <span class="cat-name">{{ cat.name }}</span>
                <span class="cat-tag" v-if="categoryExamples[cat.name]">
                  {{ categoryExamples[cat.name] }}
                </span>
              </div>
              <div class="cat-arrow">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="m9 18 6-6-6-6"/></svg>
              </div>
            </button>
          </div>
        </section>

        <!-- Search Inspiration -->
        <div class="search-inspiration animate-fade">
          <div class="inspire-card">
            <div class="inspire-icon">✨</div>
            <h4>Find your unique fit</h4>
            <p>Search for "Kente", "Custom Suits", or "Wedding Wear" to discover artisanal pieces.</p>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.search-page {
  background-color: var(--wood-deep);
  min-height: 100vh;
}

.search-header-glass {
  position: sticky;
  top: 0;
  padding: 16px;
  background: var(--glass-bg);
  backdrop-filter: blur(15px);
  z-index: 100;
  display: flex;
  gap: 12px;
  align-items: center;
  border-bottom: 1px solid var(--glass-border);
}

.search-input-box {
  flex: 1;
  background: var(--wood-walnut);
  border: 1px solid var(--glass-border);
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  gap: 10px;
  transition: all 0.3s ease;
}

.search-input-box.focused {
  border-color: var(--accent-amber);
  background: var(--wood-polished);
  box-shadow: 0 0 15px var(--accent-glow);
}

.search-input-box.scanning .scanner-line {
  display: block;
  animation: scan 1.5s infinite ease-in-out;
}

.scanner-line {
  display: none;
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  background: var(--accent-amber);
  box-shadow: 0 0 10px var(--accent-glow);
  width: 100%;
  border-radius: 2px;
}

@keyframes scan {
  0% { transform: scaleX(0); opacity: 0; }
  50% { transform: scaleX(1); opacity: 1; }
  100% { transform: scaleX(0); opacity: 0; }
}

.quick-results {
  background: var(--wood-walnut);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  margin-bottom: 24px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

.quick-section {
  padding: 16px;
  border-bottom: 1px solid var(--glass-border);
}

.section-title.mini {
  font-size: 11px;
  margin-bottom: 12px;
  opacity: 0.6;
}

.quick-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.quick-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.quick-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid var(--glass-border);
}

.quick-thumb {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  object-fit: cover;
}

.quick-info {
  display: flex;
  flex-direction: column;
}

.quick-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
}

.quick-meta {
  font-size: 11px;
  color: var(--text-muted);
}

.see-all-btn {
  width: 100%;
  padding: 14px;
  background: var(--wood-polished);
  border: none;
  color: var(--accent-amber);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.header-loader-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--accent-amber), transparent);
  background-size: 200% 100%;
  animation: move-loader 1.5s infinite linear;
}

@keyframes move-loader {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Skeleton Loading Styles */
.quick-results.skeletons {
  pointer-events: none;
}

.skeleton-title {
  width: 80px;
  height: 12px;
  background: var(--wood-polished);
  border-radius: 4px;
  margin-bottom: 16px;
  position: relative;
  overflow: hidden;
}

.skeleton-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--wood-polished);
  position: relative;
  overflow: hidden;
}

.skeleton-square {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: var(--wood-polished);
  position: relative;
  overflow: hidden;
}

.skeleton-line {
  background: var(--wood-polished);
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

.skeleton-line.name { width: 120px; height: 12px; margin-bottom: 6px; }
.skeleton-line.bio, .skeleton-line.meta { width: 180px; height: 10px; }

/* Shimmer Animation */
.skeleton-title::after,
.skeleton-circle::after,
.skeleton-square::after,
.skeleton-line::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.05), transparent);
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.no-results-catch {
  padding: 80px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.no-results-catch h4 {
  font-size: 18px;
  font-weight: 800;
  margin: 0 0 8px 0;
}

.no-results-catch p {
  font-size: 14px;
  color: var(--text-muted);
  margin-bottom: 20px;
}

.search-icon {
  color: var(--text-muted);
}

.search-input {
  background: transparent;
  border: none;
  outline: none;
  width: 100%;
  color: var(--text-primary);
  font-size: 15px;
  font-weight: 500;
}

.clear-btn {
  color: var(--text-muted);
}

.search-content {
  padding: 24px 16px;
}

.keyword-recommendations {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 20px;
  scrollbar-width: none;
}

.keyword-recommendations::-webkit-scrollbar { display: none; }

.keyword-chip {
  padding: 6px 14px;
  border-radius: 20px;
  background: var(--wood-walnut);
  border: 1px solid var(--glass-border);
  color: var(--text-muted);
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
  transition: all 0.2s;
  cursor: pointer;
}

.keyword-chip:hover {
  background: var(--wood-polished);
  border-color: var(--accent-amber);
  color: var(--text-primary);
}

.search-section {
  margin-bottom: 32px;
}

.section-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 800;
  color: var(--text-primary);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.text-link {
  font-size: 13px;
  font-weight: 700;
  color: var(--accent-amber);
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 8px;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--wood-walnut);
  border-radius: 10px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
}

.category-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

.cat-card {
  background: var(--wood-walnut);
  border: 1px solid var(--glass-border);
  padding: 16px;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-align: left;
}

.cat-name {
  display: block;
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
}

.cat-tag {
  font-size: 11px;
  color: var(--accent-amber);
  font-weight: 600;
}

.cat-arrow {
  color: var(--text-muted);
}

.search-inspiration {
  margin-top: 40px;
}

.inspire-card {
  background: linear-gradient(135deg, var(--wood-walnut) 0%, var(--wood-deep) 100%);
  border: 1px solid var(--glass-border);
  padding: 30px 20px;
  border-radius: 20px;
  text-align: center;
}

.inspire-icon {
  font-size: 32px;
  margin-bottom: 16px;
}

.inspire-card h4 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 800;
}

.inspire-card p {
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.6;
}

.back-btn {
  background-color: var(--wood-walnut) !important;
  border: 1px solid var(--glass-border) !important;
  color: var(--text-primary) !important;
}
</style>