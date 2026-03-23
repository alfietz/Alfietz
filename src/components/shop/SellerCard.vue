<!-------- (SellerCard.vue) ./src/components/shop/SellerCard.vue ------------>
<script setup>
defineProps({
  seller: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <div class="seller-card">
    <div class="avatar-wrapper">
      <img :src="seller.avatar" :alt="seller.name" class="seller-avatar" />
      <div v-if="seller.isVerified" class="verify-badge">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
      </div>
    </div>
    <div class="seller-info">
      <h4 class="seller-name">{{ seller.name }}</h4>
      <p class="seller-specialty">{{ seller.specialty }}</p>
      <div class="seller-rating">
        <span class="star">★</span>
        <span class="rating-value">{{ seller.rating }}</span>
        <span class="divider">•</span>
        <span class="likes-value">{{ seller.likesCount }} ❤️</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.seller-card {
  min-width: 140px;
  background: white;
  padding: 16px;
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: var(--shadow-sm);
  transition: transform 0.2s ease;
}

.seller-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.avatar-wrapper {
  position: relative;
  margin-bottom: 12px;
}

.seller-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--primary-tan);
}

.verify-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  background: var(--primary-green);
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
}

.seller-name {
  font-size: 14px;
  font-weight: 700;
  color: #5D4037; /* Consistent Dark Brown */
  margin: 0 0 4px 0;
}

.seller-specialty {
  font-size: 11px;
  color: #6D4C41; /* Consistent Muted Brown */
  margin: 0 0 8px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.seller-rating {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.star {
  color: var(--accent-gold);
  font-size: 12px;
}

.rating-value, .likes-value {
  font-size: 11px;
  font-weight: 600;
  color: #5D4037;
}

.divider {
  color: var(--text-muted);
  font-size: 10px;
  margin: 0 2px;
}

.likes-value {
  color: var(--primary-green);
}
</style>