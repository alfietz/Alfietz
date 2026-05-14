<!-------- (TailorDetails.vue) ./src/components/shop/TailorDetails.vue ------------>
<script setup>
import { ref } from 'vue'
import SectionHeader from '../layout/SectionHeader.vue'
import { DEFAULT_PORTFOLIO, MOCK_REVIEW } from '../../constants'

const props = defineProps({
  seller: {
    type: Object,
    required: true
  },
  userData: {
    type: Object,
    required: true
  },
  portfolio: {
    type: Array,
    default: () => DEFAULT_PORTFOLIO
  },
  reviews: {
    type: Array,
    default: () => [MOCK_REVIEW]
  }
})

const emit = defineEmits(['go-back', 'go-reviews', 'go-feedback'])

const hasConnected = ref(false)

const connectToWhatsApp = () => {
  let phoneNumber = props.seller.whatsapp || "255700000000";
  let normalized = phoneNumber.startsWith('0') ? '255' + phoneNumber.slice(1) : phoneNumber.replace('+', '')
  
  const buyerName = props.userData.firstName || props.userData.username
  const tailorName = props.seller.firstName || props.seller.name || props.seller.username

  const message = `Hello ${tailorName}! ✂️\n\nMy name is ${buyerName}, and I've been admiring your incredible work on Alfietz! 🌟\n\nI'm very interested in commissioning a custom piece from you and would love to discuss how we can bring a new heritage vision to life. 🧵✨\n\nLooking forward to hearing from you!\n\nBest regards,\n${buyerName} ✍️`;
  
  const url = `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
  hasConnected.value = true
}
</script>

<template>
  <div v-if="seller" class="tailor-page">
    
    <!-- Top Cover Section -->
    <div class="cover-section">
      <div class="top-bar">
        <button class="back-btn" @click="$emit('go-back')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <button class="icon-btn share-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
        </button>
      </div>
      
      <!-- Tailor Profile Info -->
      <div class="profile-header">
        <div class="avatar-container">
          <img :src="seller.avatar" :alt="seller.name" class="main-avatar" />
          <div v-if="seller.isVerified" class="verify-badge large">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
        </div>
        <h1 class="tailor-name">{{ seller.name }}</h1>
        <p class="tailor-specialty">{{ seller.specialty }}</p>
        <div class="rating-badge">
          <span class="star">★</span>
          <span class="rating-text">{{ seller.rating }} (48 Reviews)</span>
        </div>
      </div>
    </div>

    <!-- Tailor Details Section -->
    <div class="content-section">
      
      <div class="bio-section">
        <h3 class="section-title">About the Artisan</h3>
        <p class="description">
          {{ seller.bio || 'Preserving African heritage through every stitch and pattern.' }}
        </p>
      </div>

      <!-- Portfolio Section -->
      <div class="portfolio-section">
        <SectionHeader title="Recent Work" :show-view-all="false" />
        <div class="portfolio-grid">
          <div v-for="(img, idx) in portfolio" :key="idx" class="portfolio-item">
            <img :src="img" alt="Work sample" class="portfolio-img" />
          </div>
        </div>
      </div>

      <!-- Reviews Section -->
      <div class="reviews-section">
        <SectionHeader title="Client Feedbacks" @view-all="$emit('go-reviews')" />
        
        <div v-for="(review, index) in reviews" :key="index" class="review-card" style="margin-bottom: 12px;">
          <div class="review-top">
            <div class="reviewer-info">
              <img :src="review.avatar" alt="Reviewer" class="avatar" />
              <div>
                <h4 class="reviewer-name">{{ review.author }}</h4>
                <span class="review-time">{{ review.time }}</span>
              </div>
            </div>
            <div class="star-rating">
              <span v-for="star in 5" :key="star" class="star" :class="star <= review.rating ? 'filled' : 'empty'">★</span>
            </div>
          </div>
          <p class="review-text">{{ review.text }}</p>
        </div>
      </div>
    </div>

    <!-- Sticky Bottom Action Bar -->
    <div class="bottom-action">
      <div class="action-buttons">
        <button 
          v-if="hasConnected" 
          class="feedback-btn" 
          @click="$emit('go-feedback')"
        >
          Give Feedback
        </button>
        <button class="add-to-cart-btn" @click="connectToWhatsApp">
          {{ hasConnected ? 'Reconnect' : 'Book Custom Design' }}
        </button>
      </div>
    </div>

  </div>
</template>

<style scoped>
.tailor-page {
  background-color: var(--wood-deep);
  min-height: 100vh;
  color: var(--text-primary);
  padding-bottom: 90px;
  position: relative;
}

.cover-section {
  background-color: var(--wood-walnut);
  width: 100%;
  padding: 20px 20px 40px 20px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.top-bar {
  width: 100%;
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.icon-btn {
  background-color: var(--wood-deep);
  box-shadow: var(--shadow-sm);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-header {
  text-align: center;
}

.avatar-container {
  position: relative;
  width: 120px;
  height: 120px;
  margin-bottom: 16px;
}

.main-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid var(--wood-deep);
  box-shadow: var(--shadow-md);
}

.verify-badge.large {
  position: absolute;
  bottom: 5px;
  right: 5px;
  background: var(--accent-amber);
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid var(--wood-deep);
}

.tailor-name {
  font-size: 24px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.tailor-specialty {
  font-size: 14px;
  color: var(--text-amber);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 12px;
}

.rating-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.5);
  padding: 4px 12px;
  border-radius: 20px;
}

.rating-text {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

/* Content Section */
.content-section {
  padding: 32px 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 12px 0;
  color: var(--text-primary);
}

.description {
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-primary);
  margin-bottom: 32px;
}

/* Portfolio */
.portfolio-section {
  margin-bottom: 32px;
}

.portfolio-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.portfolio-item {
  aspect-ratio: 1;
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.portfolio-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.portfolio-item:hover .portfolio-img {
  transform: scale(1.1);
}

/* Reviews */
.reviews-section {
  margin-bottom: 24px;
}

.review-card {
  background: var(--wood-deep);
  padding: 16px;
  border-radius: var(--radius-md);
  border: 1px solid var(--glass-border);
}

.review-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.reviewer-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  object-fit: cover;
}

.reviewer-name {
  margin: 0 0 2px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.review-time {
  font-size: 12px;
  color: var(--text-muted);
}

.star-rating {
  display: flex;
  gap: 2px;
}

.star {
  font-size: 14px;
}

.star.filled {
  color: var(--accent-gold);
}

.star.empty {
  color: #E0E0E0;
}

.review-text {
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-muted);
  margin: 0;
}

/* Sticky Bottom Action */
.bottom-action {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 1440px;
  background: var(--wood-deep);
  padding: 16px 24px 24px 24px;
  border-top: 1px solid var(--glass-border);
  z-index: 100;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.feedback-btn {
  flex: 1;
  background-color: var(--wood-walnut);
  color: var(--text-primary);
  border: none;
  border-radius: 14px;
  padding: 16px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.add-to-cart-btn {
  flex: 2;
  background-color: var(--text-amber);
  color: white;
  border: none;
  border-radius: 14px;
  padding: 16px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(46, 125, 50, 0.2);
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