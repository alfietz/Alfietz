<!-------- (SellerCard.vue) ./src/components/shop/SellerCard.vue ------------>
<script setup>
defineProps({
  seller: {
    type: Object,
    required: true
  },
  loading: {
    type: String,
    default: 'eager'
  }
})

defineEmits(['select'])
</script>

<template>
  <div class="seller-card" @click="$emit('select', seller)">
    <div class="avatar-wrapper">
      <img :src="seller.avatar" :alt="seller.name" class="seller-avatar" :loading="loading" />
      <div v-if="seller.isVerified" class="verify-badge" title="Physical Shop Verified">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
      </div>
    </div>
    <div class="seller-info">
      <div class="name-badge-row">
        <h4 class="seller-name">{{ seller.name }}</h4>
      </div>
      <div v-if="seller.isVerified" class="shop-verified-tag">Physical Shop</div>
      <div class="seller-rating">
        <span class="star">★</span>
        <span class="rating-value">{{ seller.rating || '0.0' }}</span>
        <span class="divider">•</span>
        <span class="likes-value">{{ seller.likesCount || 0 }} ❤️</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.seller-card {
  min-width: 150px;
  background: var(--wood-walnut);
  padding: 20px 16px;
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
  border: 1px solid var(--glass-border);
  -webkit-tap-highlight-color: transparent;
  cursor: pointer;
}

.seller-card:active {
  transform: scale(0.95);
  background: var(--wood-polished);
}

.avatar-wrapper {
  position: relative;
  margin-bottom: 16px;
}

.seller-avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--wood-deep);
  box-shadow: 0 4px 10px rgba(0,0,0,0.3);
}

.verify-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  background: var(--accent-amber);
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--wood-deep);
}

.seller-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.shop-verified-tag {
  font-size: 9px;
  font-weight: 800;
  color: var(--accent-amber);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
  opacity: 0.8;
}

.seller-rating {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: var(--wood-deep);
  padding: 4px 10px;
  border-radius: 20px;
}

.star {
  color: var(--text-amber);
  font-size: 14px;
}

.rating-value, .likes-value {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-primary);
}

.divider {
  color: var(--text-muted);
  opacity: 0.5;
}

.likes-value {
  color: var(--text-amber);
}
</style>