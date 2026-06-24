<!-------- (ReviewsList.vue) ./src/components/communication/ReviewsList.vue ------------>
<script setup>
import { ref, computed, watch } from 'vue'
import { useProgressiveData } from '../../composables/useProgressiveData'

const props = defineProps({
  productId: {
    type: [String, Number],
    required: false,
    default: null
  },
  tailorId: {
    type: [String, Number],
    required: false,
    default: null
  },
  isApp: {
    type: Boolean,
    default: false
  },
  t: {
    type: Function,
    required: true
  }
})

const emit = defineEmits(['go-back', 'write-review', 'go-product', 'navigate'])

const activeId = computed(() => props.productId || props.tailorId)
const isProductReview = computed(() => !!props.productId)

const sortBy = ref('newest') // newest, highest, lowest
const filterRating = ref(0) // 0 means all

const reviewsQuery = useProgressiveData('get_reviews', {
  isApp: props.isApp,
  tailorId: props.isApp ? null : props.tailorId,
  productId: (props.isApp || props.tailorId) ? null : props.productId
}, {
  cacheKey: `reviews_${props.productId || 'app'}_${props.tailorId || ''}`,
  ttl: 2 * 60 * 1000
})

const reviews = computed(() => {
  const raw = reviewsQuery.data.value
  if (!raw || !raw.rows || !Array.isArray(raw.rows)) return []
  return raw.rows.map(r => ({
    id: r.id,
    author: (r.first_name || r.last_name) ? `${r.first_name || ''} ${r.last_name || ''}`.trim() : r.username,
    rating: r.rating,
    text: r.text,
    time: formatDate(r.created_at),
    avatar: r.avatar,
    image: r.image || null,
    created_at: r.created_at,
    productName: r.product_name || null,
    productId: r.product_id || null,
    productImage: r.product_image || null
  }))
})

const tailorInfo = computed(() => {
  if (!props.tailorId) return null
  const raw = reviewsQuery.data.value
  if (!raw || !raw.rows || raw.rows.length === 0) return null
  const r = raw.rows[0]
  return {
    name: (r.tailor_first || r.tailor_last) ? `${r.tailor_first || ''} ${r.tailor_last || ''}`.trim() : (r.tailor_username || props.t('artisan'))
  }
})

const loading = computed(() => !reviewsQuery.data.value && !reviewsQuery.error.value)

const stats = computed(() => {
  const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  reviews.value.forEach(r => {
    if (counts[r.rating] !== undefined) counts[r.rating]++
  })
  return counts
})

const averageRating = computed(() => {
  if (reviews.value.length === 0) return 0
  const sum = reviews.value.reduce((acc, r) => acc + r.rating, 0)
  return sum / reviews.value.length
})

const totalReviews = computed(() => reviews.value.length)

const filteredAndSortedReviews = computed(() => {
  let result = [...reviews.value]
  
  if (filterRating.value !== 0) {
    result = result.filter(r => r.rating === filterRating.value)
  }
  
  if (sortBy.value === 'highest') {
    result.sort((a, b) => b.rating - a.rating)
  } else if (sortBy.value === 'lowest') {
    result.sort((a, b) => a.rating - b.rating)
  } else {
    result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }
  
  return result
})

watch(() => [props.productId, props.tailorId], ([pId, tId]) => {
  reviewsQuery.setParams({
    isApp: props.isApp,
    tailorId: props.isApp ? null : tId,
    productId: (props.isApp || tId) ? null : pId
  })
  reviewsQuery.refresh()
})

function formatDate(dateStr) {
  if (!dateStr) return props.t('recently')
  const date = new Date(dateStr)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 1) return props.t('today')
  if (diffDays < 7) return `${diffDays} ${props.t('daysAgo')}`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} ${props.t('weeksAgo')}`
  
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<template>
  <div class="reviews-page pattern-heritage animate-fade">
    <div class="header-row">
      <button class="back-btn" @click="$emit('go-back')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <h1 class="title">
        {{ isApp ? t('tribeReviewsTitle') : (tailorId ? (tailorInfo ? tailorInfo.name + "'s " + t('reviewsCount') : t('artisanReviewsTitle')) : t('heritageReviewsTitle')) }}
      </h1>
    </div>

    <div v-if="loading" class="loading-reviews">
      <div class="spinner"></div>
      <p>{{ t('consultingAncestors') }}</p>
    </div>

    <template v-else>
      <!-- Overall Rating Section -->
      <div class="rating-overview-card">
        <div class="rating-summary">
          <h2 class="rating-score">{{ averageRating.toFixed(1) }}</h2>
          <div class="star-rating large-stars">
            <span v-for="n in 5" :key="n" class="star" :class="n <= Math.round(averageRating) ? 'filled' : 'empty'">★</span>
          </div>
          <p class="rating-count">{{ totalReviews }} {{ t('reviewsCount') }}</p>
        </div>
        
        <div class="rating-bars">
          <div v-for="star in [5, 4, 3, 2, 1]" :key="star" class="rating-bar-row" @click="filterRating = filterRating === star ? 0 : star" :class="{ active: filterRating === star }">
            <span class="star-label">{{ star }} ★</span>
            <div class="bar-container">
              <div class="bar-fill" :style="{ width: totalReviews ? (stats[star] / totalReviews * 100) + '%' : '0%' }"></div>
            </div>
            <span class="count-label">{{ stats[star] }}</span>
          </div>
        </div>
      </div>

      <!-- Controls -->
      <div class="reviews-controls">
        <div class="sort-select-wrapper">
          <select v-model="sortBy" class="sort-select">
            <option value="newest">{{ t('newestFirst') }}</option>
            <option value="highest">{{ t('highestRated') }}</option>
            <option value="lowest">{{ t('lowestRated') }}</option>
          </select>
        </div>
        <button v-if="filterRating !== 0" class="clear-filter" @click="filterRating = 0">
          {{ t('clearFilter') }} ({{ filterRating }}★) ✕
        </button>
      </div>

      <!-- Reviews List -->
      <div v-if="filteredAndSortedReviews.length > 0" class="reviews-list">
        <div v-for="review in filteredAndSortedReviews" :key="review.id" class="review-card animate-fade-in">
          <div class="review-header">
            <div class="avatar-wrapper">
              <img :src="review.avatar || 'https://i.pravatar.cc/150?u=' + review.author" alt="Reviewer" class="avatar" />
              <div v-if="review.rating === 5" class="top-reviewer-badge">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              </div>
            </div>
            <div class="reviewer-info">
              <div class="name-row">
                <h4 class="reviewer-name">{{ review.author }}</h4>
                <span class="verified-badge">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                  {{ t('verified') }}
                </span>
              </div>
              <div class="meta-row">
                <div class="star-rating small-stars">
                  <span v-for="n in 5" :key="n" class="star" :class="n <= review.rating ? 'filled' : 'empty'">★</span>
                </div>
                <span class="review-time">{{ review.time }}</span>
              </div>
            </div>
          </div>

          <!-- Product Context (for Tailor View) -->
          <div v-if="review.productName" class="product-context" @click="$emit('go-product', { id: review.productId, name: review.productName, image: review.productImage })">
            <div class="product-mini-img-box">
              <img :src="review.productImage" alt="Product" />
            </div>
            <div class="product-context-info">
              <span class="context-label">{{ t('reviewFor') }}</span>
              <span class="context-name">{{ review.productName }}</span>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m9 18 6-6-6-6"/></svg>
          </div>

          <div class="review-content">
            <p class="review-text">{{ review.text }}</p>
            <div v-if="review.image" class="review-media-box">
              <img :src="review.image" alt="Customer Photo" class="review-img" />
            </div>
          </div>
          <div class="review-footer">
            <button class="helpful-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
              {{ t('helpful') }}
            </button>
            <button class="report-btn">{{ t('report') }}</button>
          </div>
        </div>
      </div>
      <div v-else class="no-reviews">
        <div class="empty-icon">📜</div>
        <p v-if="filterRating !== 0">{{ t('noReviewsFound').replace('{rating}', filterRating) }}</p>
        <p v-else>{{ t('noReviewsYet').replace('{item}', isApp ? t('appExperience') : (tailorId ? t('artisan') : t('heritagePiece'))) }}</p>
      </div>
    </template>

    <div v-if="productId || isApp" class="bottom-action">
      <button class="primary-btn" @click="isApp ? $emit('navigate', 'app-review') : $emit('write-review')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        {{ isApp ? t('shareJourney') : t('writeReview') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.reviews-page {
  background: var(--wood-deep);
  min-height: 100vh;
  padding: var(--space-10) var(--space-6) 140px;
  max-width: 800px;
  margin: 0 auto;
}

.header-row {
  display: flex;
  align-items: center;
  gap: var(--space-5);
  margin-bottom: var(--space-10);
}

.back-btn {
  background-color: var(--wood-walnut) !important;
  border: 1px solid var(--glass-border) !important;
  color: var(--text-primary) !important;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease !important;
}

.back-btn:hover {
  background-color: var(--wood-polished) !important;
  border-color: var(--accent-amber) !important;
}

.title {
  font-size: var(--text-h1);
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
}

.loading-reviews {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-5);
  padding: var(--space-12) var(--space-5);
  color: var(--text-muted);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(217, 164, 4, 0.1);
  border-top-color: var(--accent-amber);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.rating-overview-card {
  background: var(--wood-walnut);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  display: flex;
  gap: var(--space-8);
  margin-bottom: var(--space-8);
}

@media (max-width: 600px) {
  .rating-overview-card {
    flex-direction: column;
    gap: var(--space-6);
    align-items: center;
    text-align: center;
  }
}

.rating-summary {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 120px;
}

.rating-score {
  font-size: var(--text-display);
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
}

.star-rating {
  display: flex;
  gap: var(--space-1);
}

.large-stars .star { font-size: var(--text-h2); }
.small-stars .star { font-size: var(--text-caption); }

.star.filled { color: var(--accent-amber); }
.star.empty { color: rgba(255,255,255,0.1); }

.rating-count {
  font-size: var(--text-body);
  color: var(--text-muted);
  margin-top: var(--space-2);
}

.rating-bars {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  width: 100%;
}

.rating-bar-row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  cursor: pointer;
  padding: var(--space-1);
  border-radius: var(--radius-sm);
  transition: background 0.2s;
}

.rating-bar-row:hover { background: rgba(255,255,255,0.05); }
.rating-bar-row.active { background: rgba(217, 164, 4, 0.1); }

.star-label {
  font-size: var(--text-caption);
  font-weight: 700;
  color: var(--text-muted);
  width: 30px;
}

.bar-container {
  flex: 1;
  height: 6px;
  background: rgba(255,255,255,0.05);
  border-radius: 3px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: var(--accent-amber);
  transition: width 0.8s ease;
}

.count-label {
  font-size: var(--text-caption);
  color: var(--text-muted);
  width: 20px;
  text-align: right;
}

.reviews-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-6);
  gap: var(--space-3);
}

.sort-select {
  background: var(--wood-walnut);
  border: 1px solid var(--glass-border);
  color: var(--text-primary);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-sm);
  font-size: var(--text-body);
  outline: none;
  cursor: pointer;
}

.clear-filter {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #EF4444;
  padding: var(--space-2) 14px;
  border-radius: var(--radius-sm);
  font-size: var(--text-caption);
  font-weight: 700;
  cursor: pointer;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.review-card {
  background: var(--wood-walnut);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.review-header {
  display: flex;
  gap: var(--space-4);
}

.avatar {
  width: 52px;
  height: 52px;
  border-radius: var(--radius-md);
  object-fit: cover;
}

.reviewer-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.reviewer-name {
  margin: 0;
  font-size: var(--text-body-lg);
  font-weight: 700;
  color: var(--text-primary);
}

.verified-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-micro);
  font-weight: 800;
  color: #10B981;
  background: rgba(16, 185, 129, 0.1);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  width: fit-content;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.review-time {
  font-size: var(--text-caption);
  color: var(--text-muted);
}

.product-context {
  background: rgba(0,0,0,0.15);
  border-radius: var(--radius-sm);
  padding: var(--space-2) var(--space-3);
  display: flex;
  align-items: center;
  gap: var(--space-3);
  cursor: pointer;
}

.product-mini-img-box {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.product-mini-img-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-context-info { flex: 1; display: flex; flex-direction: column; }
.context-label { font-size: var(--text-micro); color: var(--text-muted); text-transform: uppercase; }
.context-name { font-size: var(--text-body); font-weight: 700; color: var(--text-amber); }

.review-text {
  margin: 0;
  font-size: var(--text-body);
  line-height: var(--leading-relaxed);
  color: var(--text-muted);
}

.review-media-box {
  margin-top: var(--space-3);
  border-radius: var(--radius-sm);
  overflow: hidden;
  max-width: 300px;
}

.review-img { width: 100%; display: block; }

.review-footer {
  display: flex;
  gap: var(--space-4);
  border-top: 1px solid rgba(255,255,255,0.05);
  padding-top: var(--space-4);
}

.helpful-btn, .report-btn {
  background: none;
  border: none;
  font-size: var(--text-caption);
  font-weight: 700;
  cursor: pointer;
  color: var(--text-muted);
}

.report-btn { margin-left: auto; color: rgba(255,255,255,0.2); }

.no-reviews {
  text-align: center;
  padding: var(--space-12) var(--space-5);
  color: var(--text-muted);
  border-radius: var(--radius-lg);
  border: 1px dashed var(--glass-border);
}

.bottom-action {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: var(--space-6) var(--space-5) var(--space-10);
  background: linear-gradient(to top, var(--wood-deep) 80%, transparent);
  z-index: 10;
  display: flex;
  justify-content: center;
}

.primary-btn {
  width: 100%;
  max-width: 400px;
  background: var(--accent-amber);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  padding: var(--space-5);
  font-size: var(--text-body-lg);
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  box-shadow: 0 10px 25px var(--accent-glow);
}
</style>
