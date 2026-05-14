<!-------- (ProductCard.vue) ./src/components/ProductCard.vue ------------>
<script setup>
// This allows the Home component to pass product data into this card
defineProps({
  product: {
    type: Object,
    required: true
  },
  loading: {
    type: String,
    default: 'eager'
  }
})

defineEmits(['toggle-like', 'click'])
</script>

<template>
  <div class="product-card group" @click="$emit('click')">
    <!-- Image Box -->
    <div class="image-wrapper">
      <img :src="product.image" :alt="'Photo of ' + product.name" class="product-img" :loading="loading" />

      <!-- Out of Stock Badge -->
      <div v-if="product.status === 'Out of Stock'" class="oos-badge">
        OUT OF STOCK
      </div>

      <!-- Floating Action Button -->
      <button 
        class="heart-btn" 
        :class="{ 'liked animate-pop': product.liked }" 
        @click.stop="$emit('toggle-like', product)"
        :aria-label="product.liked ? 'Remove from favorites' : 'Add to favorites'"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" :stroke="product.liked ? 'var(--accent-amber)' : 'currentColor'" stroke-width="2.5" :class="{ 'filled': product.liked }">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
        </svg>
      </button>

      <!-- Tech HUD overlay on image hover -->
      <div class="tech-hud-overlay"></div>
    </div>

    <!-- Details -->
    <div class="product-details">
      <h3 class="product-name">{{ product.name }}</h3>
      <div class="price-row">
        <span class="product-price">{{ product.price }}</span>
        <button class="add-btn">ADD</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.product-card {
  background-color: var(--wood-walnut);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  display: flex;
  flex-direction: row-reverse; /* Image Right, Details Left */
  height: 110px; /* Consistent compact height for mobile */
  align-items: stretch;
}

@media (min-width: 768px) {
  .product-card {
    height: 160px; /* Constant height for PC/Tablet */
  }
}

.product-card:hover {
  border-color: var(--accent-amber);
  background-color: var(--wood-polished);
  transform: translateY(-4px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

.image-wrapper {
  position: relative;
  width: 110px; /* Square image base for mobile */
  flex-shrink: 0;
  background-color: var(--wood-deep);
  overflow: hidden;
}

@media (min-width: 768px) {
  .image-wrapper {
    width: 160px; /* Square image base for PC/Tablet */
  }
}

.product-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.9;
  transition: all 0.5s ease;
}

.oos-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  background: #EF4444;
  color: white;
  font-size: 8px;
  font-weight: 800;
  padding: 3px 6px;
  border-radius: 4px;
  z-index: 5;
  box-shadow: 0 2px 10px rgba(0,0,0,0.3);
}

.product-card:hover .product-img {
  opacity: 1;
  transform: scale(1.05);
}

.heart-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px; /* Smaller for mobile compact */
  height: 32px; 
  background: rgba(13, 8, 5, 0.6);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  z-index: 5;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  -webkit-tap-highlight-color: transparent;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

@media (min-width: 768px) {
  .heart-btn {
    width: 40px;
    height: 40px;
    top: 12px;
    right: 12px;
  }
}

.heart-btn:active {
  transform: scale(0.9);
}

.heart-btn:hover {
  background: rgba(13, 8, 5, 0.8);
  border-color: var(--accent-amber);
}

.heart-btn.liked {
  background: rgba(217, 119, 6, 0.15);
  border-color: var(--accent-amber);
}

.heart-btn.liked svg {
  fill: var(--accent-amber);
  filter: drop-shadow(0 0 8px var(--accent-glow));
}

.tech-hud-overlay {
  position: absolute;
  inset: 6px;
  border: 1px solid var(--accent-amber);
  border-radius: var(--radius-sm);
  opacity: 0;
  pointer-events: none;
  transition: all 0.5s ease;
}

.product-card:hover .tech-hud-overlay {
  opacity: 0.2;
}

.product-details {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  justify-content: center;
}

@media (min-width: 768px) {
  .product-details {
    padding: 16px;
    gap: 8px;
    justify-content: space-between;
  }
}

.product-name {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-amber);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.3s ease;
  line-height: 1.3;
}

@media (min-width: 768px) {
  .product-name {
    font-size: 14px;
    line-height: 1.4;
  }
}

.product-card:hover .product-name {
  color: var(--accent-amber);
}

.price-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
}

.product-price {
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  font-size: 14px;
  font-weight: 700;
  color: var(--accent-amber);
  letter-spacing: -0.5px;
}

@media (min-width: 768px) {
  .product-price {
    font-size: 15px;
  }
}

.add-btn {
  font-size: 11px;
  font-weight: 800;
  color: var(--text-muted);
  background: rgba(217, 119, 6, 0.1);
  border: 1px solid rgba(217, 119, 6, 0.2);
  padding: 6px 12px;
  border-radius: 6px;
  transition: all 0.3s ease;
  -webkit-tap-highlight-color: transparent;
}

@media (min-width: 768px) {
  .add-btn {
    font-size: 12px;
    padding: 8px 16px;
    border-radius: 8px;
  }
}

.add-btn:active {
  background: var(--accent-amber);
  color: white;
  transform: scale(0.95);
}
</style>