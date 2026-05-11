<!-------- (ProductCard.vue) ./src/components/ProductCard.vue ------------>
<script setup>
// This allows the Home component to pass product data into this card
defineProps({
  product: {
    type: Object,
    required: true
  }
})

defineEmits(['toggle-like', 'click'])
</script>

<template>
  <div class="product-card group" @click="$emit('click')">
    <!-- Image Box -->
    <div class="image-wrapper">
      <img :src="product.image" :alt="product.name" class="product-img" />

      <!-- Out of Stock Badge -->
      <div v-if="product.status === 'Out of Stock'" class="oos-badge">
        OUT OF STOCK
      </div>

      <!-- Floating Action Button -->
      <button 
        class="heart-btn" 
        :class="{ 'liked animate-pop': product.liked }" 
        @click.stop="$emit('toggle-like', product)"
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
  flex-direction: column;
}

@media (min-width: 768px) {
  .product-card {
    flex-direction: row-reverse; /* Image Right, Details Left */
    height: 160px; /* Constant height for PC/Tablet */
    align-items: stretch;
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
  aspect-ratio: 1;
  background-color: var(--wood-deep);
  overflow: hidden;
}

@media (min-width: 768px) {
  .image-wrapper {
    width: 160px; /* Constant width for PC/Tablet */
    aspect-ratio: auto;
    flex-shrink: 0;
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
  top: 12px;
  left: 12px;
  background: #EF4444;
  color: white;
  font-size: 9px;
  font-weight: 800;
  padding: 4px 8px;
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
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  z-index: 5;
  transition: all 0.3s ease;
}

.heart-btn:hover {
  background: rgba(0,0,0,0.7);
  color: var(--accent-amber);
}

.heart-btn.liked svg {
  fill: var(--accent-amber);
}

.tech-hud-overlay {
  position: absolute;
  inset: 10px;
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
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  justify-content: space-between;
}

.product-name {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  /* Remove white-space: nowrap for better multiline support in horizontal mode */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.3s ease;
}

.product-card:hover .product-name {
  color: var(--text-amber);
}

.price-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
}

.product-price {
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  font-size: 14px;
  font-weight: 700;
  color: var(--accent-amber);
  letter-spacing: -0.5px;
}

.add-btn {
  font-size: 10px;
  font-weight: 800;
  color: var(--text-muted);
  background: rgba(217, 119, 6, 0.1);
  border: 1px solid rgba(217, 119, 6, 0.2);
  padding: 4px 10px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.product-card:hover .add-btn {
  background: var(--accent-amber);
  color: white;
  border-color: var(--accent-amber);
}
</style>