<!-------- (Home.vue) ./src/components/shop/Home.vue ------------>
<script setup>
import { ref, watch } from 'vue'
import ProductCard from './ProductCard.vue'
import SellerCard from './SellerCard.vue'
import BrandBanner from '../layout/BrandBanner.vue'
import SectionHeader from '../layout/SectionHeader.vue'
import { CATEGORY_EXAMPLES_SIMPLE as categoryExamples } from '../../constants'

const props = defineProps({
  t: { type: Function, required: true },
  categories: { type: Array, default: () => [] },
  trendingProducts: { type: Array, default: () => [] },
  trendingSellers: { type: Array, default: () => [] },
  exploreItems: { type: Array, default: () => [] }
})

const searchQuery = ref('')

const emit = defineEmits(['go-details', 'go-notifications', 'go-search', 'go-explore', 'go-categories', 'go-trending', 'go-tailor', 'toggle-like', 'search'])

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    emit('search', searchQuery.value)
  }
}

// Live search as user types
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
  <div class="home-container">
    <!-- Search Bar (Ancestral Tech Style) -->
    <div class="search-container">
      <div class="search-wrapper group">
        <button 
          class="search-icon-btn" 
          @click="handleSearch"
          aria-label="Search"
        >
          🔍
        </button>
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Search for cultural trends, fabrics, or artifacts..." 
          class="search-input" 
          @keyup.enter="handleSearch"
          aria-label="Search input"
        />
        <!-- Futuristic scanner line effect on focus -->
        <div class="scanner-line-effect"></div>
      </div>
    </div>

    <!-- PREMIUM BRAND BANNER (Logo Focused) -->
    <BrandBanner :t="t" @click="$emit('go-explore', 'Explore more')" />

    <!-- Featured Collections (Sleek Modules) -->
    <section class="section">
      <div class="section-header-row">
        <h2 class="tech-section-title">Heritage Collections</h2>
      </div>
      <div class="scroll-container collections-grid">
        <div class="collection-module kente group" @click="$emit('go-explore', 'Kente Royal')">
          <div class="module-tech-overlay"></div>
          <div class="module-content">
            <span class="module-tag">FEATURED</span>
            <h3 class="module-title">The Royal Kente</h3>
            <p class="module-subtitle">Hand-loomed majesty for the modern era.</p>
          </div>
        </div>
        <div class="collection-module ankara group" @click="$emit('go-explore', 'Ankara Essence')">
          <div class="module-tech-overlay"></div>
          <div class="module-content">
            <span class="module-tag">NEW DROP</span>
            <h3 class="module-title">Urban Ankara Essence</h3>
            <p class="module-subtitle">Bold prints engineered for the city.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Heritage Stories Preview Banner -->
    <section class="stories-banner" @click="$emit('go-stories')">
      <div class="banner-content">
        <span class="banner-tag">New Story</span>
        <h3>The Silent Language of Kente</h3>
        <p>Discover how every thread weaves a tale of royalty...</p>
        <span class="read-link">Read Heritage Stories →</span>
      </div>
      <div class="banner-image">
        <img src="https://images.unsplash.com/photo-1660695828374-4ff51ac9df5d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8a2VudGV8ZW58MHx8MHx8fDA%3D" alt="Kente Story" />
      </div>
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
          loading="lazy"
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
          loading="lazy"
          @click="$emit('go-tailor', seller)"
        />
      </div>
    </section>

    <!-- Explore More Section -->
    <section class="section">
      <SectionHeader title="Explore more" @view-all="$emit('go-explore')" />
      <div class="explore-grid">
        <ProductCard 
          v-for="item in exploreItems" 
          :key="item.id" 
          :product="item" 
          loading="lazy"
          @click="$emit('go-details', item)"
          @toggle-like="(p) => $emit('toggle-like', p)"
        />
      </div>
    </section>

    <!-- Future Heritage / Teaser Section (Wooden Vibes) -->
    <section class="section future-heritage">
      <div class="wood-banner">
        <div class="wood-content">
          <span class="teaser-label">Something Beautiful is Coming</span>
          <h2 class="teaser-title">Whispers of the Savannah</h2>
          <p class="teaser-text">
            We are weaving new stories into our heritage. Soon, discover exclusive handmade leathercraft and AR try-ons that bring the tribe to your doorstep.
          </p>
          <div class="countdown-teaser">
            <span>Coming Early June 2026</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-container {
  padding: 24px 24px 40px 24px;
}

/* Search Bar (Ancestral Tech) */
.search-container {
  margin-bottom: 40px;
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--input-bg);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  padding: 16px 20px;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.5);
  transition: all 0.3s ease;
}

.search-wrapper:focus-within {
  border-color: var(--accent-amber);
  box-shadow: 0 0 15px var(--accent-glow);
}

.search-icon-btn {
  margin-right: 14px;
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.6;
  transition: opacity 0.3s ease;
}

.search-icon-btn:hover {
  opacity: 1;
}

.search-input {
  background: transparent;
  border: none;
  width: 100%;
  font-size: 15px;
  color: var(--text-primary);
  outline: none;
}

.search-input::placeholder {
  color: var(--input-placeholder);
}

.scanner-line-effect {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 1px;
  background-color: var(--accent-amber);
  transition: width 0.5s ease-out;
  opacity: 0.6;
}

.search-wrapper:focus-within .scanner-line-effect {
  width: 100%;
}

/* HERO SECTION (Ancestral Tech) */
.hero-section {
  position: relative;
  background: linear-gradient(135deg, var(--wood-walnut) 0%, var(--wood-polished) 100%);
  border: 1px solid var(--glass-border);
  border-radius: 32px;
  padding: 40px;
  overflow: hidden;
  margin-bottom: 64px;
  display: flex;
  flex-direction: column;
  gap: 32px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.4);
}

@media (min-width: 768px) {
  .hero-section {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 64px;
  }
}

.hero-fingerprint {
  position: absolute;
  top: -40px;
  right: -40px;
  width: 240px;
  height: 240px;
  color: var(--accent-amber);
  opacity: 0.08;
  pointer-events: none;
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 480px;
}

.hero-title {
  font-size: 32px;
  line-height: 1.1;
  font-weight: 800;
  margin-bottom: 20px;
  background: linear-gradient(to right, var(--text-primary), var(--accent-amber));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

@media (min-width: 768px) {
  .hero-title {
    font-size: 48px;
  }
}

.hero-description {
  font-size: 16px;
  line-height: 1.6;
  color: var(--text-muted);
  margin-bottom: 32px;
}

.hero-cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 16px 32px;
  background: linear-gradient(135deg, var(--accent-amber), #92400E);
  color: white;
  border: none;
  border-radius: 16px;
  font-weight: 700;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 10px 20px rgba(217,119,6,0.2);
}

.hero-cta-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 30px rgba(217,119,6,0.4);
}

.btn-arrow {
  font-size: 20px;
  transition: transform 0.3s ease;
}

.hero-cta-btn:hover .btn-arrow {
  transform: translateX(4px);
}

.hero-visual {
  position: relative;
  width: 200px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ring {
  position: absolute;
  border: 1px solid rgba(217,119,6,0.2);
  border-radius: 50%;
}

.ring-1 { width: 100%; height: 100%; animation: spin-slow 20s linear infinite; }
.ring-2 { width: 80%; height: 80%; animation: spin-slow 15s linear infinite reverse; opacity: 0.6; }
.ring-3 { width: 60%; height: 60%; animation: spin-slow 25s linear infinite; opacity: 0.4; }

.hexagon-inner {
  width: 64px;
  height: 64px;
  color: var(--accent-amber);
  opacity: 0.8;
}

/* Collections Modules */
.tech-section-title {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.tech-section-title::before {
  content: "";
  width: 4px;
  height: 24px;
  background: var(--accent-amber);
  border-radius: 2px;
  box-shadow: 0 0 8px var(--accent-glow);
}

.collections-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 24px;
}

@media (min-width: 768px) {
  .collections-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.collection-module {
  position: relative;
  height: 220px;
  border-radius: 24px;
  padding: 32px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.05);
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: var(--wood-deep);
}

.collection-module::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%);
  z-index: 1;
}

.collection-module:hover {
  border-color: rgba(217,119,6,0.4);
}

.collection-module.kente {
  background: linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.2)), url("https://images.unsplash.com/photo-1660695828374-4ff51ac9df5d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8a2VudGV8ZW58MHx8MHx8fDA%3D");
  background-size: cover;
  background-position: center;
}

.collection-module.ankara {
  background: linear-gradient(135deg, var(--wood-polished) 0%, var(--wood-walnut) 100%);
}

.module-tech-overlay {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
  background-size: 20px 20px;
  opacity: 0.2;
  z-index: 1;
}

.module-content {
  position: relative;
  z-index: 2;
  transform: translateY(10px);
  transition: transform 0.3s ease;
}

.collection-module:hover .module-content {
  transform: translateY(0);
}

.module-tag {
  display: inline-block;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1px;
  padding: 4px 10px;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 6px;
  margin-bottom: 12px;
  color: #FBBF24; /* Hardcoded amber for consistency on dark overlay */
}

.module-title {
  font-size: 22px;
  font-weight: 800;
  color: white; /* Forced white for readability on dark gradient */
  margin-bottom: 4px;
}

.module-subtitle {
  font-size: 13px;
  color: rgba(255,255,255,0.8); /* Slightly brighter white for better contrast */
  opacity: 0;
  transition: opacity 0.3s ease 0.1s;
}

.collection-module:hover .module-subtitle {
  opacity: 1;
}

/* Future Heritage Teaser */
.future-heritage {
  margin-top: 48px;
}

.wood-banner {
  background: var(--wood-gradient);
  border-radius: var(--radius-lg);
  padding: 40px 24px;
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--glass-border);
}

/* Add a subtle wood grain overlay via CSS */
.wood-banner::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url("data:image/svg+xml,%3Csvg width='400' height='400' viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.15'/%3E%3C/svg%3E");
  opacity: 0.2;
  pointer-events: none;
}

.wood-content {
  position: relative;
  z-index: 2;
  text-align: center;
  color: var(--text-primary);
}

.teaser-label {
  display: inline-block;
  background: var(--accent-gold);
  color: var(--wood-deep);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 16px;
}

.teaser-title {
  font-size: 28px;
  font-weight: 800;
  margin: 0 0 12px 0;
  color: var(--text-primary);
  font-family: serif; /* Elegant contrast */
}

.teaser-text {
  font-size: 14px;
  line-height: 1.6;
  max-width: 500px;
  margin: 0 auto 24px auto;
  opacity: 0.85;
}

.countdown-teaser {
  font-size: 13px;
  font-weight: 600;
  color: var(--accent-gold);
  border: 1px solid var(--accent-glow);
  padding: 8px 16px;
  border-radius: 8px;
  display: inline-block;
}

/* Sections */
.section {
  margin-bottom: 32px;
}

/* Scrolling & Grids */

/* Scrolling & Grids */
.scroll-container {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding: 4px 4px 24px 4px; /* Added padding to prevent shadow clipping */
  margin: -4px -4px 0 -4px;
  -webkit-overflow-scrolling: touch; /* Momentum scrolling on iOS */
  scroll-snap-type: x proximity; /* Subtle snapping for better feel */
  
  /* Desktop scrollbar styling */
  scrollbar-width: thin;
  scrollbar-color: var(--accent-amber) var(--wood-deep);
}

.scroll-container::-webkit-scrollbar {
  height: 8px;
}

.scroll-container::-webkit-scrollbar-track {
  background: var(--wood-deep);
  border-radius: 4px;
}

.scroll-container::-webkit-scrollbar-thumb {
  background-color: var(--accent-amber);
  border-radius: 4px;
  border: 2px solid var(--wood-deep);
}


.scroll-container :deep(.product-card) {
  width: 200px;
  flex-shrink: 0;
  scroll-snap-align: start;
  flex-direction: column !important;
  height: auto !important;
  border-radius: 24px !important;
}

.scroll-container :deep(.image-wrapper) {
  width: 100% !important;
  height: 200px !important;
  border-radius: 24px 24px 0 0 !important;
}

.scroll-container :deep(.product-details) {
  padding: 16px !important;
  gap: 12px !important;
}

.scroll-container :deep(.product-name) {
  font-size: 13px !important;
  -webkit-line-clamp: 1 !important;
}

.scroll-container :deep(.price-row) {
  margin-top: 0 !important;
}

@media (min-width: 768px) {
  .scroll-container :deep(.product-card) {
    width: 260px;
  }
  .scroll-container :deep(.image-wrapper) {
    height: 260px !important;
  }
}

.category-card {
  width: 140px; /* Slightly wider for better text fit */
  padding: 16px;
  height: 140px;
  background-color: var(--wood-walnut);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  flex-shrink: 0;
  cursor: pointer;
  text-align: center;
  scroll-snap-align: start;
  border: 1px solid var(--glass-border);
  transition: all 0.2s ease;
}

.category-card:active {
  transform: scale(0.95);
  border-color: var(--accent-amber);
}

.card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.cat-name-home {
  font-weight: 700;
  color: var(--text-primary);
  font-size: 14px;
}

.cat-example-home {
  font-size: 10px;
  color: var(--text-amber);
  font-style: italic;
  font-weight: 500;
}

.explore-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.explore-grid :deep(.product-card) {
  flex-direction: column !important;
  height: auto !important;
  border-radius: 24px !important;
}

.explore-grid :deep(.image-wrapper) {
  width: 100% !important;
  height: 180px !important;
  border-radius: 24px 24px 0 0 !important;
}

.explore-grid :deep(.product-details) {
  padding: 12px !important;
  gap: 8px !important;
}

.explore-grid :deep(.product-name) {
  font-size: 13px !important;
  -webkit-line-clamp: 1 !important;
}

.explore-grid :deep(.price-row) {
  margin-top: 0 !important;
}

.explore-grid :deep(.add-btn) {
  display: none !important;
}

@media (min-width: 768px) {
  .explore-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1280px) {
  .explore-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.stories-banner {
  margin: 0 0 40px 0;
  background: linear-gradient(135deg, var(--wood-polished), var(--wood-deep));
  border-radius: 24px;
  border: 1px solid var(--glass-border);
  display: flex;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.stories-banner:hover {
  transform: translateY(-4px);
  border-color: var(--accent-amber);
}

.banner-content {
  flex: 1;
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.banner-tag {
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--accent-amber);
  margin-bottom: 8px;
}

.banner-content h3 {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.banner-content p {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 16px;
  line-height: 1.4;
}

.read-link {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-amber);
}

.banner-image {
  width: 35%;
  overflow: hidden;
}

.banner-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>