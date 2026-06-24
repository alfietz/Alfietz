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
  exploreItems: { type: Array, default: () => [] },
  appReviews: { type: Array, default: () => [] },
  portfolioUpdates: { type: Array, default: () => [] },
  isLoading: { type: Boolean, default: false }
})

const searchQuery = ref('')

const emit = defineEmits(['go-details', 'go-notifications', 'go-search', 'go-explore', 'go-categories', 'go-trending', 'go-tailor', 'toggle-like', 'search', 'navigate', 'go-stories'])

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    emit('search', searchQuery.value)
  }
}
</script>

<template>
  <div class="home-container">
    <!-- Search Bar (Ancestral Tech Style) -->
    <div class="search-container">
      <div class="search-wrapper group">
        <input 
          type="text" 
          v-model="searchQuery" 
          :placeholder="t('searchPlaceholder')" 
          class="search-input" 
          @keyup.enter="handleSearch"
          aria-label="Search input"
        />
        <button 
          class="search-submit-btn" 
          @click="handleSearch"
          aria-label="Submit Search"
        >
          {{ t('search') || 'Search' }}
        </button>
        <!-- Futuristic scanner line effect on focus -->
        <div class="scanner-line-effect"></div>
      </div>
    </div>

    <!-- PREMIUM BRAND BANNER (Logo Focused) -->
    <BrandBanner :t="t" @click="$emit('go-explore', 'Explore more')" />

    <!-- Featured Collections (Sleek Modules) -->
    <section class="section">
      <div class="section-header-row">
        <h2 class="tech-section-title">{{ t('heritageCollections') }}</h2>
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
        <img src="https://images.unsplash.com/photo-1660695828374-4ff51ac9df5d?w=800&auto=format&fit=crop" alt="Kente Story" />
      </div>
    </section>

    <!-- Categories Section -->
    <section class="section">
      <SectionHeader :title="t('categories')" @view-all="$emit('go-categories')" />
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
      <SectionHeader :title="t('trendingProducts')" @view-all="$emit('go-trending')" />
      <div class="scroll-container">
        <!-- Skeletons -->
        <template v-if="isLoading && !trendingProducts.length">
          <div v-for="n in 4" :key="n" class="skeleton-card">
            <div class="skeleton-img shimmer"></div>
            <div class="skeleton-text shimmer"></div>
          </div>
        </template>
        <ProductCard 
          v-else
          v-for="product in trendingProducts" 
          :key="product.id" 
          :product="product" 
          loading="lazy"
          @select="$emit('go-details', product)"
          @toggle-like="(p) => $emit('toggle-like', p)"
        />
      </div>
    </section>

    <!-- Trending Sellers Section -->
    <section class="section">
      <SectionHeader :title="t('trendingSellers')" :show-view-all="false" />
      <div class="scroll-container">
        <!-- Skeletons -->
        <template v-if="isLoading && !trendingSellers.length">
          <div v-for="n in 3" :key="n" class="skeleton-seller">
            <div class="skeleton-avatar shimmer"></div>
            <div class="skeleton-line shimmer"></div>
          </div>
        </template>
        <SellerCard 
          v-else
          v-for="seller in trendingSellers" 
          :key="seller.id" 
          :seller="seller" 
          loading="lazy"
          @select="$emit('go-tailor', seller)"
        />
      </div>
    </section>

    <!-- Explore More Section -->
    <section class="section">
      <SectionHeader :title="t('exploreMore')" @view-all="$emit('go-explore')" />
      <div class="explore-grid">
        <ProductCard 
          v-for="item in exploreItems" 
          :key="item.id" 
          :product="item" 
          loading="lazy"
          @select="$emit('go-details', item)"
          @toggle-like="(p) => $emit('toggle-like', p)"
        />
      </div>
    </section>

    <!-- Tribe Experiences (App Reviews) -->
    <section v-if="appReviews.length > 0" class="section">
      <div class="section-header-row">
        <h2 class="tech-section-title">{{ t('tribeExperiences') }}</h2>
        <button class="view-all-link" @click="$emit('navigate', 'reviews', { isApp: true })">{{ t('viewAll') }} →</button>
      </div>
      <div class="scroll-container tribe-feedback-scroll">
        <div v-for="rev in appReviews" :key="rev.id" class="feedback-bubble-card">
          <div class="bubble-header">
            <img :src="rev.avatar" class="bubble-avatar" />
            <div class="bubble-info">
              <span class="bubble-author">{{ rev.author }}</span>
              <div class="star-rating mini">
                <span v-for="n in 5" :key="n" class="star" :class="n <= rev.rating ? 'filled' : 'empty'">★</span>
              </div>
            </div>
          </div>
          <p class="bubble-text">"{{ rev.text }}"</p>
        </div>
        <div class="feedback-cta-card" @click="$emit('navigate', 'app-review')">
          <div class="cta-plus">+</div>
          <span>{{ t('shareJourney') }}</span>
        </div>
      </div>
    </section>

    <!-- Future Heritage / Teaser Section (Wooden Vibes) -->
    <section class="section future-heritage">
      <div class="wood-banner portfolio-updates">
        <div class="wood-content">
          <span class="teaser-label">LIVE FROM THE TRIBE</span>
          <h2 class="teaser-title">Portfolio Updates</h2>
          <p class="teaser-text">
            See the latest masterpieces woven by our master tailors. Every stitch is a story of tradition meeting modernity.
          </p>
          
          <!-- Simple Portfolio Feed -->
          <div class="portfolio-feed">
            <div class="update-item" v-for="(update, idx) in portfolioUpdates" :key="idx">
              <div class="update-dot"></div>
              <span class="update-text">{{ update.text }}</span>
              <span class="update-time">{{ update.time }}</span>
            </div>
            <div v-if="portfolioUpdates.length === 0" class="update-item">
              <div class="update-dot"></div>
              <span class="update-text">The ancestors are preparing new masterpieces...</span>
            </div>
          </div>

          <div class="countdown-teaser" style="margin-top: 24px;">
            <span @click="$emit('go-explore', 'Explore more')">Browse the Gallery →</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Skeletons */
.skeleton-card {
  width: 200px;
  flex-shrink: 0;
  margin-right: var(--space-4);
}
.skeleton-img {
  width: 100%;
  height: 240px;
  border-radius: var(--radius-md);
  background: var(--wood-walnut);
}
.skeleton-text {
  width: 60%;
  height: 12px;
  margin-top: var(--space-3);
  border-radius: var(--radius-sm);
  background: var(--wood-walnut);
}

.skeleton-seller {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: var(--space-6);
}
.skeleton-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--wood-walnut);
}
.skeleton-line {
  width: 40px;
  height: 8px;
  margin-top: 8px;
  border-radius: 4px;
  background: var(--wood-walnut);
}

.shimmer {
  position: relative;
  overflow: hidden;
}
.shimmer::after {
  content: '';
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

.home-container {
  padding: var(--space-6) var(--space-6) var(--space-10) var(--space-6);
  max-width: 1200px;
  margin: 0 auto;
}

/* Search Bar (Ancestral Tech) */
.search-container {
  margin-bottom: var(--space-10);
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--input-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-2) var(--space-2) var(--space-5);
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.5);
  transition: all 0.3s ease;
}

.search-wrapper:focus-within {
  border-color: var(--accent-amber);
  box-shadow: 0 0 15px var(--accent-glow);
}

.search-submit-btn {
  background: var(--accent-amber);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  padding: var(--space-2) var(--space-5);
  font-size: var(--text-body);
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 10px rgba(0,0,0,0.3);
}

.search-submit-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 15px var(--accent-glow);
}

.search-submit-btn:active {
  transform: translateY(0);
}

.search-input {
  background: transparent;
  border: none;
  flex: 1;
  font-size: var(--text-body-lg);
  color: var(--text-primary);
  outline: none;
  padding-right: var(--space-3);
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
  border-radius: var(--radius-lg);
  padding: var(--space-10);
  overflow: hidden;
  margin-bottom: var(--space-12);
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
  box-shadow: 0 20px 40px rgba(0,0,0,0.4);
}

@media (min-width: 768px) {
  .hero-section {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-12);
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
  font-size: var(--text-display);
  line-height: var(--leading-tight);
  font-weight: 800;
  margin-bottom: var(--space-5);
  background: linear-gradient(to right, var(--text-primary), var(--accent-amber));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

@media (min-width: 768px) {
  .hero-title {
    font-size: var(--text-display);
  }
}

.hero-description {
  font-size: var(--text-body-lg);
  line-height: var(--leading-relaxed);
  color: var(--text-muted);
  margin-bottom: var(--space-8);
}

.hero-cta-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-8);
  background: linear-gradient(135deg, var(--accent-amber), #92400E);
  color: white;
  border: none;
  border-radius: var(--radius-md);
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
  font-size: var(--text-h2);
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
  font-size: var(--text-h2);
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-6);
  line-height: var(--leading-tight);
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
  gap: var(--space-6);
}

@media (min-width: 768px) {
  .collections-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.collection-module {
  position: relative;
  height: 220px;
  border-radius: var(--radius-lg);
  padding: var(--space-8);
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
  background: linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url("https://images.unsplash.com/photo-1660695828374-4ff51ac9df5d?w=800&auto=format&fit=crop");
  background-size: cover;
  background-position: center;
}

.collection-module.ankara {
  background: linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url("https://i.ibb.co/FbR4NJjf/www-cewax.jpg");
  background-size: cover;
  background-position: center;
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
  font-size: var(--text-micro);
  font-weight: 800;
  letter-spacing: 1px;
  padding: var(--space-1) var(--space-3);
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: var(--radius-sm);
  margin-bottom: var(--space-3);
  color: #FBBF24;
}

.module-title {
  font-size: var(--text-h2);
  font-weight: 800;
  color: white;
  margin-bottom: var(--space-1);
  line-height: var(--leading-tight);
}

.module-subtitle {
  font-size: var(--text-body);
  color: rgba(255,255,255,0.8);
  line-height: var(--leading-snug);
  opacity: 0;
  transition: opacity 0.3s ease 0.1s;
}

.collection-module:hover .module-subtitle {
  opacity: 1;
}

/* Future Heritage Teaser */
.future-heritage {
  margin-top: var(--space-12);
}

.wood-banner {
  background: var(--wood-gradient);
  border-radius: var(--radius-lg);
  padding: var(--space-10) var(--space-6);
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
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--text-caption);
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: var(--space-4);
}

.teaser-title {
  font-size: var(--text-h1);
  font-weight: 800;
  margin: 0 0 var(--space-3) 0;
  color: var(--text-primary);
  font-family: serif;
  line-height: var(--leading-tight);
}

.teaser-text {
  font-size: var(--text-body);
  line-height: var(--leading-relaxed);
  max-width: 500px;
  margin: 0 auto var(--space-6) auto;
  opacity: 0.85;
}

.portfolio-feed {
  max-width: 450px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  text-align: left;
  background: rgba(0,0,0,0.2);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  border: 1px solid rgba(255,255,255,0.05);
}

.update-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-size: var(--text-body);
}

.update-dot {
  width: 6px;
  height: 6px;
  background: var(--accent-amber);
  border-radius: 50%;
  box-shadow: 0 0 8px var(--accent-glow);
}

.update-text {
  color: var(--text-primary);
  flex: 1;
}

.update-time {
  color: var(--text-muted);
  font-size: var(--text-caption);
}

.countdown-teaser {
  font-size: var(--text-body);
  font-weight: 600;
  color: var(--accent-gold);
  border: 1px solid var(--accent-glow);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-sm);
  display: inline-block;
}

/* Sections */
.section {
  margin-bottom: var(--space-8);
}

/* Scrolling & Grids */

/* Scrolling & Grids */
.scroll-container {
  display: flex;
  gap: var(--space-4);
  overflow-x: auto;
  padding: var(--space-1) var(--space-1) var(--space-6) var(--space-1);
  margin: calc(var(--space-1) * -1) calc(var(--space-1) * -1) 0 calc(var(--space-1) * -1);
  -webkit-overflow-scrolling: touch;
  scroll-snap-type: x proximity;
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
  height: auto;
  border-radius: 24px;
}

.scroll-container :deep(.image-wrapper) {
  width: 100%;
  height: 200px;
  border-radius: 24px 24px 0 0;
}

.scroll-container :deep(.product-details) {
  padding: var(--space-4);
  gap: var(--space-3);
}

.scroll-container :deep(.product-name) {
  font-size: var(--text-h3);
  -webkit-line-clamp: 1;
}

.scroll-container :deep(.price-row) {
  margin-top: 0;
}

@media (min-width: 768px) {
  .scroll-container :deep(.product-card) {
    width: 260px;
  }
  .scroll-container :deep(.image-wrapper) {
    height: 260px;
  }
}

.category-card {
  width: 140px;
  padding: var(--space-4);
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
  gap: var(--space-1);
}

.cat-name-home {
  font-weight: 700;
  color: var(--text-primary);
  font-size: var(--text-body);
  line-height: var(--leading-tight);
}

.cat-example-home {
  font-size: var(--text-micro);
  color: var(--text-amber);
  font-style: italic;
  font-weight: 500;
}

.explore-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-4);
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
  padding: var(--space-3) !important;
  gap: var(--space-2) !important;
}

.explore-grid :deep(.product-name) {
  font-size: var(--text-h3) !important;
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

.view-all-link {
  font-size: var(--text-body);
  font-weight: 700;
  color: var(--accent-amber);
  background: none;
  border: none;
  cursor: pointer;
}

.tribe-feedback-scroll {
  padding-bottom: var(--space-6);
}

.feedback-bubble-card {
  width: 260px;
  flex-shrink: 0;
  background: var(--wood-walnut);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  scroll-snap-align: start;
}

.bubble-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.bubble-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid var(--glass-border);
}

.bubble-info {
  display: flex;
  flex-direction: column;
}

.bubble-author {
  font-size: var(--text-body);
  font-weight: 700;
  color: var(--text-primary);
  line-height: var(--leading-tight);
}

.bubble-text {
  font-size: var(--text-body);
  color: var(--text-muted);
  font-style: italic;
  line-height: var(--leading-snug);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.feedback-cta-card {
  width: 160px;
  flex-shrink: 0;
  background: rgba(217, 164, 4, 0.05);
  border: 2px dashed rgba(217, 164, 4, 0.2);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  cursor: pointer;
  color: var(--accent-amber);
  font-weight: 700;
  font-size: var(--text-body);
  text-align: center;
  padding: var(--space-5);
  transition: all 0.3s;
}

.feedback-cta-card:hover {
  background: rgba(217, 164, 4, 0.1);
  border-color: var(--accent-amber);
}

.cta-plus {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--accent-amber);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-h2);
}

.stories-banner {
  margin: 0 0 var(--space-10) 0;
  background: linear-gradient(135deg, var(--wood-polished), var(--wood-deep));
  border-radius: var(--radius-lg);
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
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.banner-tag {
  font-size: var(--text-micro);
  font-weight: 800;
  text-transform: uppercase;
  color: var(--accent-amber);
  margin-bottom: var(--space-2);
}

.banner-content h3 {
  font-size: var(--text-h3);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--space-2);
  line-height: var(--leading-tight);
}

.banner-content p {
  font-size: var(--text-body);
  color: var(--text-muted);
  margin-bottom: var(--space-4);
  line-height: var(--leading-snug);
}

.read-link {
  font-size: var(--text-body);
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