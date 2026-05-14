<!-------- (ReviewsList.vue) ./src/components/ReviewsList.vue ------------>
<script setup>
import { ref, onMounted, computed } from 'vue'
import { db } from '../../db/client'

const props = defineProps({
  productId: {
    type: [String, Number],
    required: true
  }
})

defineEmits(['go-back', 'write-review'])

const reviews = ref([])
const loading = ref(true)

const averageRating = computed(() => {
  if (reviews.value.length === 0) return 0
  const sum = reviews.value.reduce((acc, r) => acc + r.rating, 0)
  return sum / reviews.value.length
})

const totalReviews = computed(() => reviews.value.length)

onMounted(async () => {
  try {
    loading.value = true
    const res = await db.execute({
      sql: `
        SELECT r.*, u.first_name, u.last_name, u.avatar 
        FROM reviews r 
        JOIN users u ON r.user_id = u.id 
        WHERE r.product_id = ?
        ORDER BY r.created_at DESC
      `,
      args: [props.productId]
    })
    reviews.value = res.rows.map(r => ({
      id: r.id,
      author: `${r.first_name} ${r.last_name}`,
      rating: r.rating,
      text: r.text,
      time: 'Recently',
      avatar: r.avatar
    }))
  } catch (e) {
    console.error('Error fetching reviews:', e)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="reviews-page">
    <div class="header-row">
      <button class="back-btn" @click="$emit('go-back')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <h1 class="title">Reviews</h1>
    </div>

    <div v-if="loading" class="loading-reviews">
      <p>Fetching heritage reviews...</p>
    </div>

    <template v-else>
      <!-- Overall Rating Section -->
      <div class="overall-rating">
        <h2 class="rating-score">{{ averageRating.toFixed(1) }}</h2>
        <div class="star-rating large-stars">
          <span v-for="n in 5" :key="n" class="star" :class="n <= Math.round(averageRating) ? 'filled' : 'empty'">★</span>
        </div>
        <p class="rating-count">Based on {{ totalReviews }} reviews</p>
      </div>

      <!-- Reviews List -->
      <div v-if="reviews.length > 0" class="reviews-list">
        <div v-for="review in reviews" :key="review.id" class="review-card">
          <div class="review-header">
            <img :src="review.avatar" alt="Reviewer" class="avatar" />
            <div class="reviewer-info">
              <h4 class="reviewer-name">{{ review.author }}</h4>
              <span class="review-time">{{ review.time }}</span>
            </div>
            <div class="star-rating small-stars">
              <span v-for="n in 5" :key="n" class="star" :class="n <= review.rating ? 'filled' : 'empty'">★</span>
            </div>
          </div>
          <p class="review-text">{{ review.text }}</p>
        </div>
      </div>
      <div v-else class="no-reviews">
        <p>No reviews yet for this heritage piece.</p>
      </div>
    </template>

    <!-- Bottom Action -->
    <div class="bottom-action">
      <button class="primary-btn" @click="$emit('write-review')">Write a review</button>
    </div>
  </div>
</template>

<style scoped>
.reviews-page {
  background: var(--wood-deep);
  min-height: 100vh;
  font-family: 'Inter', -apple-system, sans-serif;
  padding: 24px 20px 120px;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
}

.loading-reviews, .no-reviews {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-muted);
}
/* ... rest of existing styles ... */

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
}

.title {
  font-size: 22px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

/* Overall Rating */
.overall-rating {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32px;
}

.rating-score {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.star-rating {
  display: flex;
  gap: 4px;
}

.large-stars .star { font-size: 24px; }
.small-stars .star { font-size: 14px; }

.star.filled { color: #FFC107; }
.star.empty { color: #E0E0E0; }

.rating-count {
  font-size: 13px;
  color: var(--text-muted);
  margin: 8px 0 0 0;
}

/* Reviews List */
.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
  flex: 1;
}

.review-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.review-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
}

.reviewer-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.reviewer-name {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.review-time {
  font-size: 12px;
  color: var(--text-muted);
}

.review-text {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-muted);
}

/* Bottom Action */
.bottom-action {
  padding-top: 24px;
  padding-bottom: 24px;
}

.primary-btn {
  width: 100%;
  background: var(--accent-amber);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 16px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
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