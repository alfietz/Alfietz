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

const emit = defineEmits(['go-back', 'go-reviews', 'go-feedback', 'toggle-favorite', 'delete'])

// Hexagon SVG Component for Tech Vibe
const Hexagon = {
  template: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 2l8.66 5v10L12 22l-8.66-5V7L12 2z"/>
    </svg>
  `
}

const product = ref(null)
const reviews = ref([])
const loading = ref(true)
const error = ref(null)
const parsedColors = ref([])
const selectedSize = ref('')
const hasConnected = ref(false)
const isNegotiating = ref(false)
const offerAmount = ref('')
const selectedColorId = ref(null)
const specialInstructions = ref('')

const isOwner = computed(() => {
  return product.value && product.value.owner_id === props.currentUserId
})

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Custom Size']

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
    
    // Parse variants
    if (product.value.variants_json) {
      try {
        const variants = JSON.parse(product.value.variants_json)
        parsedColors.value = variants.map((v, i) => ({
          id: i,
          hex: v.hex,
          name: v.name,
          image: v.image,
          inStock: v.inStock !== undefined ? v.inStock : true
        }))
      } catch (e) {
        console.error('Failed to parse variants_json:', e)
      }
    }
    
    // Fallback to description parsing if no structured variants or parsing failed
    if (parsedColors.value.length === 0) {
      const desc = product.value.description || ''
      const colorMatch = desc.match(/Colors:\s*(.*)/i)
      if (colorMatch) {
        const colorStr = colorMatch[1].trim()
        if (colorStr.toLowerCase() === 'default') {
          parsedColors.value = [{ id: 'default', hex: '#795548', name: 'Default', inStock: true }]
        } else {
          const hexCodes = colorStr.match(/#[a-fA-F0-9]{3,6}/g)
          if (hexCodes) {
            parsedColors.value = hexCodes.map((hex, i) => ({ id: i, hex, name: hex, inStock: true }))
          }
        }
      } else {
        parsedColors.value = [{ id: 'default', hex: '#795548', name: 'Default', inStock: true }]
      }
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

const currentVariant = computed(() => {
  return parsedColors.value.find(c => c.id === selectedColorId.value) || parsedColors.value[0] || { inStock: false, name: 'None', hex: '' }
})

watch(parsedColors, (newColors) => {
  if (newColors.length > 0 && selectedColorId.value === null) {
    selectedColorId.value = newColors[0].id
  }
}, { immediate: true })

const selectColor = (id) => {
  selectedColorId.value = id
}

const connectToWhatsApp = (withOffer = false) => {
  if (!selectedSize.value) {
    alert("Please select a size first.")
    return
  }
  
  const variant = currentVariant.value
  if (!variant || !variant.inStock || product.value.status === 'Out of Stock') {
    alert("Sorry, this selection is currently out of stock.")
    return
  }

  let phoneNumber = product.value?.sellerPhone
  if (!phoneNumber) {
    alert("Designer contact not available")
    return
  }
  
  // Normalize Tanzania numbers
  let normalized = phoneNumber.startsWith('0') ? '+255' + phoneNumber.slice(1) : phoneNumber
  
  let message = `Hello! I'm interested in ordering:
Product: ${product.value.name}
Price: ${product.value.price}
Size: ${selectedSize.value}
Color: ${variant.name} (${variant.hex})`

  if (specialInstructions.value.trim()) {
    message += `\n\nSpecial Requirements: ${specialInstructions.value.trim()}`
  }
  
  if (withOffer && offerAmount.value) {
    message += `\n\nI'd like to make an offer of TSh ${offerAmount.value}. Would you consider this?`
  }

  const url = `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`
  window.open(url, '_blank')
  hasConnected.value = true
  isNegotiating.value = false
}

const handleDelete = () => {
  if (confirm('Are you sure you want to delete this heritage item? This action cannot be undone.')) {
    emit('delete', product.value.id)
  }
}
</script>

<template>
  <div v-if="loading" class="loading-container">
    <div class="spinner-outer">
      <div class="spinner-inner"></div>
      <Hexagon class="spinner-hex animate-spin-slow" />
    </div>
    <p class="loading-text">Deciphering Heritage...</p>
  </div>
  
  <div v-else-if="error" class="error-container">
    <div class="error-icon">⚠️</div>
    <p>{{ error }}</p>
    <button @click="$emit('go-back')" class="back-btn">Back to Home</button>
  </div>

  <div v-else-if="product" class="product-page animate-fade">
    <div class="layout-container">
      <!-- DETAILS SECTION (Left on PC) -->
      <div class="content-section">
        <!-- Move Top Bar here for mobile, but hide it if needed or handle it globally -->
        <div class="mobile-top-bar md-hidden">
          <button class="back-btn-float" @click="$emit('go-back')">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m15 18-6-6 6-6"/></svg>
          </button>
        </div>

        <div class="header-row">
          <div class="title-group">
            <h1 class="product-title">{{ product.name }}</h1>
            <div v-if="product.status === 'Out of Stock'" class="out-of-stock-tag">Out of Stock</div>
          </div>
          <div class="price-pill">
            <span class="price-value">{{ product.price }}</span>
          </div>
        </div>
        
        <div class="category-module">
          <span class="category-label">{{ product.categoryName }}</span>
        </div>
        
        <div class="specs-grid">
          <div class="spec-item">
            <span class="spec-label">Material</span>
            <span class="spec-value">{{ product.description.includes('Material:') ? product.description.split('\n')[0].replace('Material: ', '') : 'Silk, Premium Cotton' }}</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Availability</span>
            <span class="spec-value" :class="{ 'text-error': product.status === 'Out of Stock' }">{{ product.status }}</span>
          </div>
        </div>

        <div class="story-section">
          <h3 class="section-title">The Story</h3>
          <p class="description">{{ product.description.includes('\n\n') ? product.description.split('\n\n').slice(1).join('\n\n') : product.description }}</p>
        </div>

        <!-- Size Selection -->
        <div class="selection-section">
          <h3 class="section-title">Select Size</h3>
          <div class="size-options">
            <button 
              v-for="size in sizes" 
              :key="size"
              class="size-btn"
              :class="{ selected: selectedSize === size }"
              @click="selectedSize = size"
            >
              {{ size }}
            </button>
          </div>
        </div>

        <!-- Special Instructions -->
        <div class="selection-section">
          <h3 class="section-title">Special Requirements</h3>
          <textarea 
            v-model="specialInstructions" 
            placeholder="e.g. Extra baggy fit, specific length, or custom notes..."
            class="requirements-textarea"
          ></textarea>
        </div>

        <div v-if="parsedColors.length" class="color-section">
          <h3 class="section-title">Available Patterns & Colors</h3>
          <div class="color-options">
            <div 
              v-for="color in parsedColors" 
              :key="color.id"
              class="color-option-wrapper"
              @click="selectColor(color.id)"
            >
              <button 
                class="color-swatch"
                :style="{ backgroundColor: color.hex }"
                :class="{ selected: selectedColorId === color.id, 'out-of-stock': !color.inStock }"
              ></button>
              <span class="color-name-label">{{ color.name }}</span>
              <span v-if="!color.inStock" class="variant-oos">Sold Out</span>
            </div>
          </div>
        </div>

        <div class="reviews-section">
          <div class="section-header-row">
            <h3 class="section-title">Heritage Reviews</h3>
            <button class="view-all-link" @click="$emit('go-reviews')">
              View all →
            </button>
          </div>
          <p v-if="!reviews.length" class="no-reviews">
            No reviews yet. Be the first to share your heritage experience!
          </p>
          <div v-else class="review-list">
            <!-- Reviews mapping here if needed -->
          </div>
        </div>

        <!-- Padding for sticky bottom bar -->
        <div class="bottom-spacer"></div>
      </div>

      <!-- IMAGE SECTION (Right on PC) -->
      <div class="image-section">
        <div class="top-bar desktop-only">
          <button class="back-btn" @click="$emit('go-back')">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <div class="action-btns">
            <button v-if="isOwner" class="icon-btn delete-btn" @click="handleDelete">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C62828" stroke-width="2.5"><path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
            <button class="icon-btn fav-btn" @click="$emit('toggle-favorite', product)">
              <svg v-if="product.liked" width="20" height="20" viewBox="0 0 24 24" fill="var(--accent-amber)" stroke="var(--accent-amber)" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
            </button>
          </div>
        </div>
        <div class="main-image-container">
          <img :src="currentVariant.image || product.image" :alt="product.name" class="main-image" />
        </div>
      </div>
    </div>

    <!-- Fixed Bottom Action Bar -->
    <div class="bottom-action-bar">
      <!-- Negotiation Mode -->
      <div v-if="isNegotiating" class="negotiation-bar animate-fade">
        <div class="input-wrapper">
          <span class="currency-symbol">TSh</span>
          <input 
            type="number" 
            v-model="offerAmount" 
            placeholder="Your Offer" 
            class="offer-input"
          />
        </div>
        <button class="send-offer-btn" @click="connectToWhatsApp(true)">
          Send Offer
        </button>
        <button class="cancel-btn" @click="isNegotiating = false">✕</button>
      </div>

      <!-- Default Actions -->
      <div v-else class="action-grid animate-fade">
        <button class="negotiate-btn" @click="isNegotiating = true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg>
          Negotiate
        </button>
        <button 
          class="connect-btn" 
          :class="{ disabled: !currentVariant.inStock || product.status === 'Out of Stock' }"
          @click="connectToWhatsApp(false)"
        >
          {{ !currentVariant.inStock || product.status === 'Out of Stock' ? 'Currently Unavailable' : 'Order via WhatsApp' }}
          <svg v-if="currentVariant.inStock && product.status !== 'Out of Stock'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.79 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.title-group { display: flex; flex-direction: column; gap: 8px; }
.out-of-stock-tag { background: #EF4444; color: white; padding: 4px 12px; border-radius: 8px; font-size: 12px; font-weight: 800; width: fit-content; text-transform: uppercase; margin-bottom: 8px; }

.selection-section { margin-bottom: 32px; }
.size-options { display: flex; flex-wrap: wrap; gap: 10px; }
.size-btn { background: var(--wood-walnut); border: 1px solid var(--glass-border); color: var(--text-muted); padding: 10px 16px; border-radius: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s; font-size: 13px; }
.size-btn.selected { background: var(--accent-amber); color: white; border-color: var(--accent-amber); box-shadow: 0 0 15px var(--accent-glow); }

.requirements-textarea {
  width: 100%;
  min-height: 80px;
  background: var(--wood-walnut);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  padding: 12px;
  color: white;
  font-size: 14px;
  outline: none;
  resize: vertical;
}

.requirements-textarea:focus {
  border-color: var(--accent-amber);
}

.color-section { margin-bottom: 40px; }
.color-options { display: flex; flex-wrap: wrap; gap: 20px; }
.color-option-wrapper { display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer; }
.color-name-label { font-size: 11px; color: var(--text-muted); font-weight: 600; max-width: 60px; text-align: center; line-height: 1.2; }
.variant-oos { font-size: 9px; color: #EF4444; font-weight: 800; text-transform: uppercase; }

.color-swatch { width: 48px; height: 48px; border-radius: 14px; border: 3px solid transparent; cursor: pointer; transition: all 0.3s; }
.color-swatch.selected { border-color: var(--accent-amber); box-shadow: 0 0 15px var(--accent-glow); transform: scale(1.1); }
.color-swatch.out-of-stock { opacity: 0.5; position: relative; }
.color-swatch.out-of-stock::after { content: ''; position: absolute; top: 50%; left: 0; width: 100%; height: 2px; background: #EF4444; transform: translateY(-50%) rotate(-45deg); }

.text-error { color: #EF4444 !important; }
.connect-btn.disabled { background: #4B5563 !important; cursor: not-allowed; opacity: 0.7; }

.loading-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
}

.spinner-outer {
  position: relative;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner-hex {
  width: 100%;
  height: 100%;
  color: var(--accent-amber);
  opacity: 0.8;
}

.loading-text {
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  letter-spacing: 2px;
  color: var(--text-muted);
}

.product-page { min-height: 100vh; background: transparent; }

.layout-container {
  display: flex;
  flex-direction: column;
}

@media (min-width: 768px) {
  .layout-container {
    flex-direction: row;
    height: 100vh;
    overflow: hidden;
  }
}

.image-section {
  position: relative;
  height: 50vh;
  background: var(--wood-deep);
  border-radius: 0 0 40px 40px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 30px rgba(0,0,0,0.4);
}

@media (min-width: 768px) {
  .image-section {
    flex: 0 0 45%; /* Constant size: 45% of width */
    max-width: 600px;
    height: 100%;
    border-radius: 0;
    order: 2; /* Product on Right */
  }
}

.top-bar {
  position: absolute;
  top: 24px;
  left: 20px;
  right: 24px;
  z-index: 10;
  display: flex;
  justify-content: space-between;
}

.mobile-top-bar {
  margin-bottom: 24px;
}

.back-btn-float {
  background: var(--wood-walnut);
  border: 1px solid var(--glass-border);
  border-radius: 50%;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
}

.desktop-only { display: none; }
@media (min-width: 768px) {
  .desktop-only { display: flex; }
  .md-hidden { display: none; }
}

.action-btns {
  display: flex;
  gap: 12px;
}

.main-image-container {
  width: 100%;
  height: 100%;
  padding: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.main-image {
  max-width: 100%;
  max-height: 80%; /* Constant relative size */
  object-fit: contain;
  transition: transform 0.5s ease;
}

.content-section {
  padding: 40px 24px;
  max-width: 800px;
  margin: 0 auto;
}

@media (min-width: 768px) {
  .content-section {
    flex: 1;
    height: 100%;
    overflow-y: auto;
    padding: 60px 60px;
    margin: 0;
    max-width: none;
    order: 1; /* Details on Left */
  }
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  gap: 16px;
}

.product-title {
  font-size: 32px;
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1.1;
  background: linear-gradient(to right, var(--text-primary), var(--accent-amber));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.price-pill {
  background: var(--price-bg);
  border: 1px solid var(--price-border);
  padding: 10px 20px;
  border-radius: 30px;
  box-shadow: 0 0 20px rgba(74, 222, 128, 0.1);
}

.price-value {
  font-family: 'JetBrains Mono', monospace;
  font-weight: 800;
  color: var(--price-text);
  font-size: 18px;
}

.category-module {
  margin-bottom: 32px;
}

.category-label {
  display: inline-block;
  padding: 6px 16px;
  background: var(--wood-walnut);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  font-size: 13px;
  font-weight: 700;
  color: var(--text-amber);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.specs-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 40px;
}

.spec-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.spec-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--text-muted);
  letter-spacing: 1px;
}

.spec-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.description {
  font-size: 15px;
  line-height: 1.7;
  color: var(--text-muted);
}

.section-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.view-all-link {
  font-size: 13px;
  font-weight: 600;
  color: var(--accent-amber);
  background: none;
  border: none;
  cursor: pointer;
}

.no-reviews {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-muted);
  font-style: italic;
  font-size: 14px;
  background: var(--wood-walnut);
  border: 1px dashed var(--glass-border);
  border-radius: 20px;
}

.bottom-spacer {
  height: 120px;
}

.bottom-action-bar {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 1440px;
  padding: 24px;
  background: var(--glass-bg);
  backdrop-filter: blur(30px);
  border-top: 1px solid var(--glass-border);
  z-index: 1000;
  box-shadow: 0 -10px 30px rgba(0,0,0,0.5);
}

.action-grid {
  display: grid;
  grid-template-columns: 1fr 2.5fr;
  gap: 16px;
}

.negotiate-btn {
  background: var(--wood-walnut);
  border: 1px solid var(--glass-border);
  color: var(--text-amber);
  border-radius: 18px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 18px;
  transition: all 0.3s;
}

.connect-btn {
  background: linear-gradient(135deg, #166534, #15803d);
  color: white;
  border: none;
  border-radius: 18px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 18px;
  box-shadow: 0 0 20px rgba(22, 101, 52, 0.3);
  transition: all 0.3s;
}

.negotiation-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.input-wrapper {
  position: relative;
  flex: 1;
}

.currency-symbol {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  font-weight: 800;
  color: var(--accent-amber);
}

.offer-input {
  width: 100%;
  background: var(--input-bg);
  border: 1px solid var(--accent-amber);
  border-radius: 18px;
  padding: 18px 20px 18px 40px;
  color: white;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 700;
  outline: none;
}

.send-offer-btn {
  background: var(--accent-amber);
  color: white;
  padding: 18px 24px;
  border-radius: 18px;
  font-weight: 800;
  box-shadow: 0 0 20px var(--accent-glow);
}

.cancel-btn {
  width: 56px;
  height: 56px;
  background: var(--wood-walnut);
  border: 1px solid var(--glass-border);
  border-radius: 50%;
  color: var(--text-muted);
  font-size: 18px;
}
</style>
