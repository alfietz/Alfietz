<!-------- (Home.vue) ./src/components/shop/Home.vue ------------>
<script setup>
import { ref } from 'vue'
import ProductCard from './ProductCard.vue'
import SellerCard from './SellerCard.vue'
import SectionHeader from '../layout/SectionHeader.vue'

defineProps({
  categories: { type: Array, default: () => [] },
  trendingProducts: { type: Array, default: () => [] },
  trendingSellers: { type: Array, default: () => [] }
})

const searchQuery = ref('')

const exploreItems = [
  { id: 1, name: 'Bogolan Mudcloth Vest', price: '$75.00' },
  { id: 2, name: 'Zulu Beaded Sandals', price: '$55.00' },
  { id: 3, name: 'Modern Adire Tunic', price: '$85.00' },
]

// Extended categories with examples
const categoryExamples = {
  'Ankara Essence': 'Infinity Dresses',
  'Kente Royal': 'Blazers',
  'Modern Dashiki': 'Kaftans',
  'Maasai Beads': 'Necklaces',
  'Traditional Wedding': 'Bridal Gowns',
  'Heritage Headwear': 'Gold Wraps',
  'Tribal Footwear': 'Sandals',
  'Agbada Collection': 'Robes',
  'Normal Clothes': 'T-Shirts'
}

const emit = defineEmits(['go-details', 'go-notifications', 'go-search', 'go-explore', 'go-categories', 'go-trending', 'go-tailor', 'toggle-like', 'search'])

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    emit('search', searchQuery.value)
  }
}
</script>

<template>
  <div class="home-container">
    <!-- Search Bar -->
    <div class="search-container">
      <div class="search-bar">
        <span class="search-icon" @click="handleSearch">🔍</span>
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Search for trends..." 
          class="search-input" 
          @keyup.enter="handleSearch"
        />
      </div>
    </div>

    <!-- Greetings / Hero Banner -->
    <section class="hero-banner">
      <p class="hero-subtext">Celebrating African Craftsmanship</p>
      <button class="order-btn" @click="$emit('go-explore', 'Explore more')">Discover Heritage</button>
    </section>

    <!-- Categories Section -->
    <section class="section">
      <SectionHeader title="Categories" @view-all="$emit('go-categories')" />
      <div class="scroll-container">
        <div 
          v-for="category in categories" 
          :key="category.id" 
          class="category-card"
          @click="$emit('go-explore', category.name)"
        >
          <div class="card-content">
            <span class="cat-name-home">{{ category.name }}</span>
            <span class="cat-example-home" v-if="categoryExamples[category.name]">
              {{ categoryExamples[category.name] }}
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- Trending Products Section -->
    <section class="section">
      <SectionHeader title="Trending products" @view-all="$emit('go-trending')" />
      <div class="scroll-container">
        <ProductCard 
          v-for="product in trendingProducts" 
          :key="product.id" 
          :product="product" 
          @click="$emit('go-details', product)"
          @toggle-like="(p) => $emit('toggle-like', p)"
        />
      </div>
    </section>

    <!-- Trending Sellers Section -->
    <section class="section">
      <SectionHeader title="Trending Sellers" :show-view-all="false" />
      <div class="scroll-container">
        <SellerCard 
          v-for="seller in trendingSellers" 
          :key="seller.id" 
          :seller="seller" 
          @click="$emit('go-tailor', seller)"
        />
      </div>
    </section>

    <!-- Explore More Section -->
    <section class="section">
      <SectionHeader title="Explore more" @view-all="$emit('go-explore')" />
      <div class="explore-grid">
        <div v-for="item in exploreItems" :key="item.id" class="explore-card">
          <p class="explore-name">{{ item.name }}</p>
          <p class="explore-desc">{{ item.price }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-container {
  padding: 20px 20px 100px 20px;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.logo-container.home-logo {
  width: 56px;
  height: 56px;
  margin-bottom: 0;
  margin-left: 0;
  padding: 8px;
  cursor: pointer;
}

.header-icons {
  display: flex;
  gap: 12px;
}

/* Search Bar */
.search-container {
  margin-bottom: 32px;
}

.search-bar {
  display: flex;
  align-items: center;
  background-color: var(--primary-tan);
  border-radius: var(--radius-md);
  padding: 12px 16px;
}

.search-icon {
  margin-right: 12px;
  opacity: 0.6;
  cursor: pointer;
}

.search-input {
  background: transparent;
  border: none;
  width: 100%;
  font-size: 16px;
  color: var(--secondary-brown);
  outline: none;
}

.hero-banner {
  text-align: center;
  margin-bottom: 40px;
  padding: 32px 24px;
  background: var(--secondary-brown);
  border-radius: var(--radius-lg);
  color: white;
  box-shadow: var(--shadow-md);
}

.hero-subtext {
  color: var(--primary-tan);
  font-size: 18px;
  font-weight: 500;
  margin: 0 0 20px 0;
  letter-spacing: 0.5px;
}

.order-btn {
  background: var(--accent-gold);
  color: var(--secondary-brown);
  border: none;
  padding: 12px 32px;
  border-radius: 30px;
  font-weight: 700;
  font-size: 15px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.order-btn:hover {
  transform: scale(1.05);
  background: #ffca28;
}

/* Sections */
.section {
  margin-bottom: 32px;
}

/* Scrolling & Grids */
.scroll-container {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 12px;
  scrollbar-width: none;
}

.scroll-container::-webkit-scrollbar {
  display: none;
}

.category-card {
  width: fit-content;
  min-width: 120px;
  padding: 16px;
  height: 120px;
  background-color: var(--primary-tan);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  flex-shrink: 0;
  cursor: pointer;
  text-align: center;
}

.card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.cat-name-home {
  font-weight: 700;
  color: var(--secondary-brown);
  font-size: 14px;
}

.cat-example-home {
  font-size: 10px;
  color: var(--primary-green);
  font-style: italic;
  font-weight: 500;
}

.explore-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

@media (min-width: 768px) {
  .explore-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1024px) {
  .explore-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (min-width: 1280px) {
  .explore-grid {
    grid-template-columns: repeat(6, 1fr);
  }
}

.explore-card {
  background-color: var(--primary-tan);
  padding: 16px;
  border-radius: var(--radius-md);
  color: var(--secondary-brown);
}

.explore-name {
  font-weight: 600;
  margin: 0 0 4px 0;
  font-size: 14px;
}

.explore-desc {
  font-size: 12px;
  color: var(--text-muted);
  margin: 0;
}
</style>