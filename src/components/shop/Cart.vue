<!-------- (Cart.vue) ./src/components/shop/Cart.vue ------------>
<script setup>
import { computed } from 'vue'

const props = defineProps({
  cartItems: {
    type: Array,
    default: () => []
  },
  userData: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['go-back', 'remove-item', 'checkout', 'go-details'])

// Group cart items by tailor so we can checkout per tailor via WhatsApp
const cartByTailor = computed(() => {
  const groups = {}
  props.cartItems.forEach(item => {
    const tailorId = item.owner_id
    if (!groups[tailorId]) {
      groups[tailorId] = {
        tailorId: tailorId,
        tailorName: item.owner_username || 'Artisan',
        tailorPhone: item.sellerPhone || '',
        items: [],
        total: 0
      }
    }
    groups[tailorId].items.push(item)
    // Simple parsing to calculate a rough total if price is numeric-ish
    const priceNum = parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0
    groups[tailorId].total += priceNum
  })
  return Object.values(groups)
})
</script>

<template>
  <div class="cart-page pattern-heritage animate-fade">
    <div class="header-row">
      <button class="back-btn tap-active" @click="$emit('go-back')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <h1 class="title">Your Heritage Cart</h1>
    </div>

    <div v-if="cartItems.length === 0" class="empty-cart-state">
      <div class="empty-icon">🛒</div>
      <h2 class="empty-title">Your cart is empty</h2>
      <p class="empty-desc">Discover authentic heritage pieces from master artisans across the continent.</p>
      <button class="primary-btn-outline" @click="$emit('go-back')">Explore Heritage</button>
    </div>

    <div v-else class="cart-content">
      <div v-for="group in cartByTailor" :key="group.tailorId" class="tailor-group">
        <div class="tailor-header">
          <h3>Orders for {{ group.tailorName }}</h3>
        </div>
        
        <div class="items-list">
          <div v-for="item in group.items" :key="item.cartId" class="cart-item">
            <img :src="item.image" :alt="item.name" class="item-img" @click="$emit('go-details', item)" />
            <div class="item-info" @click="$emit('go-details', item)">
              <h4 class="item-name">{{ item.name }}</h4>
              <span class="item-price">{{ item.price }}</span>
              <div v-if="item.selectedSize || item.selectedColor" class="item-variants">
                <span v-if="item.selectedSize">Size: {{ item.selectedSize }}</span>
                <span v-if="item.selectedColor">Color: {{ item.selectedColor }}</span>
              </div>
            </div>
            <button class="remove-btn" @click="$emit('remove-item', item.cartId)" title="Remove item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
        </div>

        <div class="group-footer">
          <div class="group-total">
            <span>Estimated Total:</span>
            <span class="total-price">TSh {{ group.total.toLocaleString() }}</span>
          </div>
          <button class="checkout-btn" @click="$emit('checkout', group)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.79 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            Checkout via WhatsApp
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cart-page {
  background-color: var(--wood-deep);
  min-height: 100vh;
  padding: 40px 24px 100px;
  max-width: 800px;
  margin: 0 auto;
}

.header-row {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 32px;
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
  font-size: 24px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
}

.empty-cart-state {
  text-align: center;
  padding: 60px 20px;
  background: var(--wood-walnut);
  border-radius: 24px;
  border: 1px dashed var(--glass-border);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.8;
}

.empty-title {
  font-size: 20px;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.empty-desc {
  font-size: 14px;
  color: var(--text-muted);
  margin-bottom: 24px;
  line-height: 1.5;
}

.primary-btn-outline {
  background: transparent;
  color: var(--accent-amber);
  border: 1px solid var(--accent-amber);
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.primary-btn-outline:hover {
  background: var(--accent-amber);
  color: white;
}

.cart-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.tailor-group {
  background: var(--wood-walnut);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  overflow: hidden;
}

.tailor-header {
  padding: 16px 20px;
  background: rgba(0,0,0,0.2);
  border-bottom: 1px solid var(--glass-border);
}

.tailor-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 800;
  color: var(--text-amber);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.items-list {
  display: flex;
  flex-direction: column;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.cart-item:last-child {
  border-bottom: none;
}

.item-img {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  object-fit: cover;
  cursor: pointer;
}

.item-info {
  flex: 1;
  cursor: pointer;
}

.item-name {
  margin: 0 0 4px 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-price {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  font-weight: 700;
  color: var(--accent-amber);
  display: block;
  margin-bottom: 4px;
}

.item-variants {
  display: flex;
  gap: 8px;
  font-size: 11px;
  color: var(--text-muted);
}

.remove-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.remove-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #EF4444;
}

.group-footer {
  padding: 16px 20px;
  background: rgba(0,0,0,0.1);
  border-top: 1px solid var(--glass-border);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.group-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
}

.total-price {
  font-family: 'JetBrains Mono', monospace;
  color: var(--accent-amber);
  font-size: 16px;
}

.checkout-btn {
  background: linear-gradient(135deg, #166534, #15803d);
  color: white;
  border: none;
  padding: 14px;
  border-radius: 12px;
  font-weight: 800;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(22, 101, 52, 0.2);
}

.checkout-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(22, 101, 52, 0.4);
}
</style>