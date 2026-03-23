<!-------- (ReviewsList.vue) ./src/components/ReviewsList.vue ------------>
<script setup>
import { ref } from 'vue'

const reviews = ref([
  {
    id: 1,
    author: 'Leslie Alexander',
    time: '5 Min',
    rating: 4,
    text: 'Good service and I\'m happy with the service, best value plant nursery in my area.',
    avatar: 'https://i.pravatar.cc/150?u=leslie'
  },
  {
    id: 2,
    author: 'Raji Fakhr',
    time: '10 Min',
    rating: 3,
    text: 'Formal assessment of something with the intention of change if necessary.',
    avatar: 'https://i.pravatar.cc/150?u=raji'
  },
  {
    id: 3,
    author: 'Thuwaybah Issa',
    time: '15 Min',
    rating: 3,
    text: 'Good service and I\'m happy with the service, best value plant nursery in my area.',
    avatar: 'https://i.pravatar.cc/150?u=thuwaybah'
  },
  {
    id: 4,
    author: 'Nuhaid Rihab',
    time: '20 Min',
    rating: 3,
    text: 'Review of the latest book on Chaucer. A criticism is a judgment, usually in an article, either favorable.',
    avatar: 'https://i.pravatar.cc/150?u=nuhaid'
  }
])

defineEmits(['go-back', 'write-review'])
</script>

<template>
  <div class="reviews-page">
    <div class="header-row">
      <button class="back-btn" @click="$emit('go-back')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <h1 class="title">Reviews</h1>
    </div>

    <!-- Overall Rating Section -->
    <div class="overall-rating">
      <h2 class="rating-score">4.0</h2>
      <div class="star-rating large-stars">
        <span class="star filled">★</span>
        <span class="star filled">★</span>
        <span class="star filled">★</span>
        <span class="star filled">★</span>
        <span class="star empty">★</span>
      </div>
      <p class="rating-count">Based on 23 reviews</p>
    </div>

    <!-- Reviews List -->
    <div class="reviews-list">
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

    <!-- Bottom Action -->
    <div class="bottom-action">
      <button class="primary-btn" @click="$emit('write-review')">Write a review</button>
    </div>
  </div>
</template>

<style scoped>
.reviews-page {
  background-color: #FFFFFF;
  min-height: 100vh;
  font-family: 'Inter', -apple-system, sans-serif;
  padding: 24px 20px;
  max-width: 1200px;
  margin: 0 auto;
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
  background-color: #F5F5F5;
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
  color: #1A1A1A;
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
  color: #1A1A1A;
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
  color: #888888;
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
  color: #1A1A1A;
}

.review-time {
  font-size: 12px;
  color: #888888;
}

.review-text {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: #555555;
}

/* Bottom Action */
.bottom-action {
  padding-top: 24px;
  padding-bottom: 24px;
}

.primary-btn {
  width: 100%;
  background: #5D8374;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 16px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}
</style>