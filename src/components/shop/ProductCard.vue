<!-------- (ProductCard.vue) ./src/components/ProductCard.vue ------------>
<script setup>
// This allows the Home component to pass product data into this card
defineProps({
  product: {
    type: Object,
    required: true
  }
})

defineEmits(['toggle-like'])
</script>

<template>
  <div class="product-card" :style="{ backgroundImage: `url(${product.image})` }">
    <button class="heart-btn" :class="{ 'liked': product.liked }" @click.stop="$emit('toggle-like', product)">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" :stroke="product.liked ? 'var(--accent-clay)' : '#666'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="{ 'filled': product.liked }">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
      </svg>
    </button>
    <div class="product-info">
      <p class="product-name">{{ product.name }}</p>
      <p class="product-price">{{ product.price }}</p>
    </div>
  </div>
</template>

<style scoped>
.product-card {
  min-width: 160px;
  height: 220px;
  background-color: var(--primary-tan);
  background-size: cover;
  background-position: center;
  border-radius: 16px;
  position: relative;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 16px;
  transition: transform 0.2s;
  cursor: pointer;
  overflow: hidden;
}

.product-card:hover {
  transform: translateY(-4px);
}

.heart-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  background: white;
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.heart-btn svg.filled {
  fill: var(--accent-clay);
}

.product-info {
  background: rgba(255, 255, 255, 0.7);
  padding: 8px;
  border-radius: 8px;
  backdrop-filter: blur(4px);
}

.product-name {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #5D4037; /* Consistent Dark Brown */
}

.product-price {
  margin: 4px 0 0 0;
  font-size: 12px;
  color: #6D4C41; /* Consistent Muted Brown */
}
</style>