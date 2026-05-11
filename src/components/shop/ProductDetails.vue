<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import SectionHeader from '../layout/SectionHeader.vue'
import { db } from '../../db/client'

const props = defineProps({
  productId: {
    type: [String, Number],
    required: true
  },
  t: {
    type: Function,
    required: true
  },
  currentUserId: {
    type: String,
    required: true
  }
})

const product = ref(null)
const reviews = ref([])
const loading = ref(true)
const error = ref(null)
const parsedColors = ref([])

const isOwner = computed(() => {
  return product.value && product.value.owner_id === props.currentUserId
})

onMounted(async () => {
  try {
    loading.value = true
    
    // Fetch full product + seller info
    const prodRes = await db.execute({
      sql: `
        SELECT 
          p.*, 
          u.whatsapp as sellerPhone,
          u.username as sellerName,
          c.name as categoryName
        FROM products p 
        LEFT JOIN users u ON p.owner_id = u.id
        LEFT JOIN categories c ON p.category_id = c.id 
        WHERE p.id = ?
      `,
      args: [props.productId]
    })
    
    if (prodRes.rows.length === 0) {
      error.value = 'Product not found'
      return
    }
    
    product.value = {
      ...prodRes.rows[0],
      liked: false, // Will sync from global state
      isFavorite: false
    }
    
    // Parse colors from description (keep existing logic)
    const desc = product.value.description || ''
    const colorMatch = desc.match(/Colors:\s*(.*)/i)
    if (colorMatch) {
      const colorStr = colorMatch[1].trim()
      if (colorStr.toLowerCase() === 'default') {
        parsedColors.value = [{ id: 'default', hex: '#795548', name: 'Default' }]
      } else {
        const hexCodes = colorStr.match(/#[a-fA-F0-9]{3,6}/g)
        if (hexCodes) {
          parsedColors.value = hexCodes.map((hex, i) => ({ id: i, hex, name: hex }))
        }
      }
    } else {
      parsedColors.value = [{ id: 'default', hex: '#795548', name: 'Default' }]
    }
    
    // Fetch related reviews (using feedback table for now)
    const reviewRes = await db.execute({
      sql: `
        SELECT f.*, u.first_name, u.last_name, u.avatar 
        FROM feedback f 
        JOIN users u ON f.user_id = u.id 
        WHERE f.message LIKE ? 
        ORDER BY f.created_at DESC 
        LIMIT 5
      `,
      args: [`%${product.value.name}%`]
    })
    
    reviews.value = reviewRes.rows.map(r => ({
      id: r.id,
      author: `${r.first_name} ${r.last_name}`,
      avatar: r.avatar || 'https://i.pravatar.cc/150',
      rating: 5, // Default for now
      text: r.message,
      time: new Date(r.created_at).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    }))
    
  } catch (e) {
    console.error('ProductDetails DB fetch error:', e)
    error.value = 'Failed to load product details. Please try again.'
  } finally {
    loading.value = false
  }
})

const hasConnected = ref(false)
const selectedColorId = ref(parsedColors.value[0]?.id || 'default')

watch(parsedColors, (newColors) => {
  selectedColorId.value = newColors[0]?.id || 'default'
})

const selectColor = (id) => {
  selectedColorId.value = id
}

const connectToWhatsApp = () => {
  let phoneNumber = product.value?.sellerPhone
  if (!phoneNumber) {
    alert("Designer contact not available")
    return
  }
  
  // Normalize Tanzania numbers
  let normalized = phoneNumber.startsWith('0') ? '+255' + phoneNumber.slice(1) : phoneNumber
  const message = `Hello! I'm interested in "${product.value.name}" ($${product.value.price}). Color: ${selectedColorId.value}.`
  const url = `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`
  window.open(url, '_blank')
  hasConnected.value = true
}

const emit = defineEmits(['go-back', 'go-reviews', 'go-feedback', 'toggle-favorite', 'delete'])

const handleDelete = () => {
  if (confirm('Are you sure you want to delete this heritage item? This action cannot be undone.')) {
    emit('delete', product.value.id)
  }
}
</script>

<template>
  <div v-if="loading" class="loading-container">
    <div class="spinner"></div>
    <p>Loading heritage details...</p>
  </div>
  
  <div v-else-if="error" class="error-container">
    <div class="error-icon">⚠️</div>
    <p>{{ error }}</p>
    <button @click="$emit('go-back')" class="back-btn">Back to Home</button>
  </div>

  <div v-else-if="product" class="product-page">
    
    <div class="image-section">
      <div class="top-bar">
        <button class="icon-btn back-btn" @click="$emit('go-back')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div class="action-btns">
          <button v-if="isOwner" class="icon-btn delete-btn" @click="handleDelete">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C62828" stroke-width="2"><path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
          <button class="icon-btn fav-btn" @click="$emit('toggle-favorite', product)">
            <svg v-if="product.liked" width="20" height="20" viewBox="0 0 24 24" fill="#333" stroke="#333" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
          </button>
        </div>
      </div>
      <img :src="product.image" :alt="product.name" class="main-image" />
    </div>

    <div class="content-section">
      <div class="header-row">
        <h1 class="product-title">{{ product.name }}</h1>
        <span class="product-price">{{ product.price }}</span>
      </div>
      
      <div class="category-tag">{{ product.categoryName }}</div>
      
      <p class="description" style="white-space: pre-line;">{{ product.description }}</p>

      <div v-if="parsedColors.length" class="color-section">
        <h3 class="section-title">Available Colors</h3>
        <div class="color-options">
          <button 
            v-for="color in parsedColors" 
            :key="color.id"
            class="color-swatch"
            :style="{ backgroundColor: color.hex }"
            @click="selectColor(color.id)"
            :class="{ selected: selectedColorId === color.id }"
            :title="color.name"
          ></button>
        </div>
      </div>

      <div class="reviews-section">
        <SectionHeader title="Heritage Reviews" :count="reviews.length" @view-all="$emit('go-reviews')" />
        <div v-if="reviews.length" class="review-list">
          <div v-for="review in reviews.slice(0, 3)" :key="review.id" class="review-card">
            <div class="review-header">
              <img :src="review.avatar" class="review-avatar" />
              <div>
                <h4 class="review-author">{{ review.author }}</h4>
                <span class="review-time">{{ review.time }}</span>
              </div>
              <div class="stars">{{ '★'.repeat(review.rating) }} {{ '☆'.repeat(5 - review.rating) }}</div>
            </div>
            <p class="review-text">{{ review.text }}</p>
          </div>
        </div> <div v-else class="no-reviews">
          No reviews yet. Be the first to share your heritage experience!
        </div>
      </div>

      <div class="bottom-action">
        <button 
          v-if="hasConnected" 
          class="feedback-btn secondary" 
          @click="$emit('go-feedback')">
          💬 Give Feedback
        </button>
        <button class="whatsapp-btn primary" @click="connectToWhatsApp">
          {{ hasConnected ? 'Reconnect' : 'Connect Designer' }} 
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489"/>
          </svg>
        </button>
      </div>
    </div>
  </div> </template>

<style scoped>
.loading-container, .error-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px 20px;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--border-light);
  border-top: 4px solid var(--primary-green);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 24px;
}

@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.back-btn {
  background: var(--primary-green);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  font-weight: 600;
}

.product-page { min-height: 100vh; background: var(--bg-white); }

.image-section {
  position: relative;
  height: 380px;
  background: linear-gradient(135deg, #F5F5F3 0%, #EDEDED 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.top-bar {
  position: absolute;
  top: 24px;
  left: 24px;
  right: 24px;
  z-index: 10;
  display: flex;
  justify-content: space-between;
}

.action-btns {
  display: flex;
  gap: 12px;
}

.icon-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255,255,255,0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-btn {
  background: rgba(255, 255, 255, 0.9);
}

.delete-btn:hover {
  background: #FFEBEE;
}

.main-image {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
}

.content-section {
  padding: 32px 24px;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.product-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-dark);
  line-height: 1.2;
  margin: 0;
  max-width: 70%;
}

.product-price {
  font-size: 20px;
  font-weight: 700;
  color: var(--primary-green);
  background: rgba(93, 211, 116, 0.1);
  padding: 8px 16px;
  border-radius: 20px;
}

.category-tag {
  background: var(--primary-tan);
  color: var(--secondary-brown);
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 20px;
}

.description {
  font-size: 15px;
  line-height: 1.6;
  color: var(--text-main);
  margin-bottom: 32px;
}

.color-section h3, .reviews-section h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--text-dark);
}

.color-options {
  display: flex;
  gap: 12px;
  margin-bottom: 32px;
}

.color-swatch {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  border: 3px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.color-swatch:hover {
  transform: scale(1.05);
}

.color-swatch.selected {
  border-color: var(--primary-green);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.review-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.review-card {
  background: #FAFAFA;
  padding: 20px;
  border-radius: 16px;
  border-left: 4px solid var(--primary-green);
}

.review-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.review-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}

.review-author {
  margin: 0;
  font-weight: 600;
  font-size: 14px;
}

.review-time {
  color: var(--text-muted);
  font-size: 12px;
}

.stars {
  font-size: 16px;
  color: #FFC107;
}

.review-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
}

.no-reviews {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-light);
  font-style: italic;
}

.bottom-action {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(20px);
  padding: 20px;
  display: flex;
  gap: 12px;
  z-index: 100;
}

.feedback-btn.secondary {
  flex: 1;
  background: var(--primary-tan);
  color: var(--secondary-brown);
}

.whatsapp-btn.primary {
  flex: 2;
  background: linear-gradient(135deg, var(--primary-green), #4CAF50);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 600;
}

button:not(.icon-btn) {
  border: none;
  border-radius: 16px;
  padding: 16px 24px;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;
}

button:not(.icon-btn):hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}
</style>
