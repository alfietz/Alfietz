<!-------- (ProductDetails.vue) ./src/components/ProductDetails.vue ------------>
<script setup>
import { ref } from 'vue'
import SectionHeader from '../layout/SectionHeader.vue'

const props = defineProps({
  product: {
    type: Object,
    default: () => ({
      name: 'Adirondack chair',
      price: '$120.00',
      description: 'The biggest persuader for buying an Adirondack chairs is their ability to deliver a heavy dose of comfort and support. The Adirondack chair was designed for comfort, ',
      image: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?q=80&w=800&auto=format&fit=crop',
      isFavorite: false
    })
  },
  t: {
    type: Function,
    required: true
  }
})

const hasConnected = ref(false)

// Color options from your design
const colors = ref([
  { id: 1, hex: '#1C1C1E' }, // Almost Black
  { id: 2, hex: '#876964' }, // Warm Brown
  { id: 3, hex: '#6A807D' }, // Slate Green
  { id: 4, hex: '#806782' }  // Muted Purple
])

// State to track which color is selected
const selectedColorId = ref(1)

// Mock review data
const review = ref({
  author: 'Leslie Alexander',
  time: '3 years ago',
  rating: 4,
  text: "Good service and I'm happy with the service, best value plant nursery in my area.",
  // Placeholder avatar
  avatar: 'https://i.pravatar.cc/150?u=leslie' 
})

const selectColor = (id) => {
  selectedColorId.value = id
}

const connectToWhatsApp = () => {
  const phoneNumber = "255700000000"; // Designer's WhatsApp number
  const message = `Hello! I'm interested in ordering the ${props.product.name}.`;
  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
  hasConnected.value = true
}

defineEmits(['go-back', 'go-reviews', 'go-feedback', 'toggle-favorite'])
</script>

<template>
  <div class="product-page">
    
    <!-- Top Image Section -->
    <div class="image-section">
      <!-- Navigation & Action Buttons -->
      <div class="top-bar">
        <button class="icon-btn back-btn" @click="$emit('go-back')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <button class="icon-btn fav-btn" @click="$emit('toggle-favorite', product)">
          <svg v-if="product.liked || product.isFavorite" width="20" height="20" viewBox="0 0 24 24" fill="#333" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
        </button>
      </div>
      
      <!-- Product Image -->
      <img :src="product.image" alt="Product Image" class="main-image" />
    </div>

    <!-- Product Details Section -->
    <div class="content-section">
      
      <!-- Title and Price -->
      <div class="header-row">
        <h1 class="product-title">{{ product.name }}</h1>
        <span class="product-price">{{ product.price }}</span>
      </div>

      <!-- Description -->
      <p class="description" style="white-space: pre-wrap;">
        {{ product.description }}
      </p>

      <!-- Color Selector -->
      <div class="color-section">
        <h3 class="section-title">Colour</h3>
        <div class="color-options">
          <button 
            v-for="color in colors" 
            :key="color.id"
            class="color-swatch"
            :style="{ backgroundColor: color.hex }"
            @click="selectColor(color.id)"
          >
            <!-- Checkmark icon for selected color -->
            <svg v-if="selectedColorId === color.id" class="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </button>
        </div>
      </div>

      <!-- Reviews Section -->
      <div class="reviews-section">
        <SectionHeader title="Reviews" @view-all="$emit('go-reviews')" />
        
        <div class="review-card">
          <div class="review-top">
            <div class="reviewer-info">
              <img :src="review.avatar" alt="Reviewer" class="avatar" />
              <div>
                <h4 class="reviewer-name">{{ review.author }}</h4>
                <span class="review-time">{{ review.time }}</span>
              </div>
            </div>
            <div class="star-rating">
              <span class="star filled">★</span>
              <span class="star filled">★</span>
              <span class="star filled">★</span>
              <span class="star filled">★</span>
              <span class="star empty">★</span>
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
          {{ hasConnected ? 'Reconnect' : 'Connect with Designer' }}
        </button>
      </div>
    </div>

  </div>
</template>

<style scoped>
.product-page {
  background-color: var(--bg-white);
  min-height: 100vh;
  color: var(--text-main);
  padding-bottom: 90px;
  position: relative;
}

/* Image Section */
.image-section {
  background-color: #F5F5F3;
  width: 100%;
  height: 380px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.top-bar {
  position: absolute;
  top: 20px;
  left: 20px;
  right: 20px;
  display: flex;
  justify-content: space-between;
  z-index: 10;
}

.icon-btn {
  background-color: var(--bg-white);
  box-shadow: var(--shadow-sm);
}

.main-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 40px;
}

/* Content Section */
.content-section {
  padding: 24px;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.product-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--secondary-brown);
}

.product-price {
  font-size: 18px;
  font-weight: 600;
  color: var(--primary-green);
}

.description {
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-main);
  margin-bottom: 24px;
}

.read-more {
  color: var(--primary-green);
  font-weight: 600;
  margin-left: 4px;
}

/* Color Selector */
.section-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: var(--secondary-brown);
}

.color-options {
  display: flex; gap: 12px; margin-bottom: 32px;
}

.color-swatch {
  width: 44px; height: 44px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center;
}

/* Reviews */
.reviews-section {
  margin-bottom: 24px;
}

.review-card {
  background: var(--bg-white);
}

.review-top {
  display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;
}

.reviewer-info {
  display: flex; align-items: center; gap: 12px;
}

.avatar {
  width: 40px; height: 40px; border-radius: var(--radius-full); object-fit: cover;
}

.reviewer-name {
  margin: 0 0 2px 0; font-size: 14px; font-weight: 600; color: var(--text-main);
}

.review-time {
  font-size: 12px; color: var(--text-muted);
}

.star-rating {
  display: flex; gap: 2px;
}

.star {
  font-size: 14px;
}

.star.filled {
  color: #FFC107;
}

.star.empty {
  color: #E0E0E0;
}

.review-text {
  font-size: 13px; line-height: 1.5; color: var(--text-muted);
}

/* Sticky Bottom Action */
.bottom-action {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 1200px;
  background: var(--bg-white);
  padding: 16px 24px 24px 24px;
  border-top: 1px solid #F0F0F0;
  z-index: 100;
}

.action-buttons {
  display: flex; gap: 12px;
}

.feedback-btn {
  flex: 1; background-color: var(--primary-tan); color: var(--secondary-brown); border: none; border-radius: 14px; padding: 16px; font-size: 14px; font-weight: 700; cursor: pointer;
}

.add-to-cart-btn {
  flex: 2; background-color: var(--primary-green); color: white; border: none; border-radius: 14px; padding: 16px; font-size: 16px; font-weight: 600; cursor: pointer;
}
</style>