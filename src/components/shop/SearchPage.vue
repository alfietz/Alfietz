<!-------- (SearchPage.vue) ./src/components/SearchPage.vue ------------>
<script setup>
import { ref } from 'vue'
import { CATEGORY_EXAMPLES_SIMPLE as categoryExamples } from '../../constants'

const props = defineProps({
  categories: {
    type: Array,
    default: () => []
  },
  t: {
    type: Function,
    required: true
  }
})

const searchQuery = ref('')
const emit = defineEmits(['go-back', 'search', 'select-category'])

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    emit('search', searchQuery.value)
  }
}

// Live search as user types
import { watch } from 'vue'
let searchTimeout = null
watch(searchQuery, (newVal) => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    if (newVal.trim()) {
      emit('search', newVal)
    }
  }, 500) // 500ms debounce
})
</script>

<template>
  <div class="search-page">
    <!-- Header with Back Button -->
    <div class="header-row">
      <button class="back-btn" @click="$emit('go-back')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <h1 class="title">{{ t('search') }}</h1>
    </div>

    <!-- Search Input Area -->
    <div class="search-controls">
      <div class="search-bar">
        <span class="search-icon" @click="handleSearch">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A0A0A0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        </span>
        <input 
          type="text" 
          v-model="searchQuery" 
          :placeholder="t('search') + '...'" 
          class="search-input" 
          @keyup.enter="handleSearch"
        />
      </div>
    </div>

    <!-- Browse Categories -->
    <div class="browse-section">
      <h3 class="section-title">{{ t('categories') }}</h3>
      <div class="category-chips">
        <button 
          v-for="cat in categories" 
          :key="cat.id" 
          class="cat-chip"
          @click="$emit('select-category', cat.name)"
        >
          <span class="chip-name">{{ cat.name }}</span>
          <span class="chip-example" v-if="categoryExamples[cat.name]">
            {{ categoryExamples[cat.name] }}
          </span>
        </button>
      </div>
    </div>

    <!-- Empty State Content (only if no query) -->
    <div v-if="!searchQuery" class="empty-state-wrapper">
      <div class="icon-circle">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.3-4.3"/>
        </svg>
      </div>
      <h2 class="empty-title">{{ t('welcome') }} {{ t('search') }}</h2>
      <p class="empty-subtitle">
        Find the perfect African craftsmanship by<br>
        searching for trends or master tailors.
      </p>
    </div>
  </div>
</template>

<style scoped>
.search-page {
  background-color: var(--wood-deep);
  min-height: 100vh;
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
}

.header-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.back-btn {
  background: var(--wood-polished);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-primary);
}

.title {
  font-size: 22px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

/* Search Controls */
.search-controls {
  margin-bottom: 24px;
}

.search-bar {
  display: flex;
  align-items: center;
  background-color: var(--wood-walnut);
  border-radius: 12px;
  padding: 12px 16px;
}

.search-icon {
  margin-right: 12px;
  display: flex;
  cursor: pointer;
}

.search-input {
  background: transparent;
  border: none;
  outline: none;
  width: 100%;
  font-size: 15px;
  color: var(--text-primary);
}

/* Browse Section */
.browse-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 16px;
  color: var(--text-primary);
}

.category-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.cat-chip {
  background: var(--wood-deep);
  border: 1px solid var(--wood-walnut);
  padding: 10px 16px;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  transition: all 0.2s;
  cursor: pointer;
}

.cat-chip:hover {
  background: var(--wood-walnut);
}

.chip-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.chip-example {
  font-size: 10px;
  color: var(--text-amber);
  font-style: italic;
}

/* Empty State */
.empty-state-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin-top: -40px;
}

.icon-circle {
  width: 80px;
  height: 80px;
  background-color: var(--text-amber);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.empty-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 12px 0;
}

.empty-subtitle {
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.5;
  margin: 0;
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