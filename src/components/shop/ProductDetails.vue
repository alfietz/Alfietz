<script setup>
import { ref, computed, watch, onMounted, h } from 'vue'
import ProductCard from './ProductCard.vue'
import SectionHeader from '../layout/SectionHeader.vue'
import BaseDialog from '../layout/BaseDialog.vue'
import { db } from '../../db/client'
import { useRoute } from 'vue-router'

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
  },
  userData: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['go-back', 'go-reviews', 'go-feedback', 'toggle-favorite', 'delete', 'go-edit'])

const route = useRoute()

// Dialog State
const dialog = ref({
  show: false,
  title: '',
  message: '',
  type: 'info',
  isConfirm: false,
  confirmText: 'OK',
  onConfirm: null
})

const showDialog = (options) => {
  dialog.value = {
    show: true,
    title: options.title || '',
    message: options.message || '',
    type: options.type || 'info',
    isConfirm: options.isConfirm || false,
    confirmText: options.confirmText || 'OK',
    onConfirm: options.onConfirm || null
  }
}

const handleDialogConfirm = () => {
  if (dialog.value.onConfirm) {
    dialog.value.onConfirm()
  }
  dialog.value.show = false
}

// Hexagon SVG Component for Tech Vibe
const Hexagon = {
  render() {
    return h('svg', {
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '1.5',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round'
    }, [
      h('path', { d: 'M12 2l8.66 5v10L12 22l-8.66-5V7L12 2z' })
    ])
  }
}

const product = ref(null)
const reviews = ref([])
const loading = ref(true)
const error = ref(null)
const parsedColors = ref([])
const gallery = ref([])
const selectedSize = ref('')
const hasConnected = ref(false)
const isNegotiating = ref(false)
const offerAmount = ref('')
const selectedColorId = ref(null)
const specialInstructions = ref('')
const isStoryExpanded = ref(false)
const similarProducts = ref([])

const isOwner = computed(() => {
  return product.value && product.value.owner_id === props.currentUserId
})

const storyText = computed(() => {
  if (!product.value || !product.value.description) return ''
  return product.value.description.includes('\n\n') 
    ? product.value.description.split('\n\n').slice(1).join('\n\n') 
    : product.value.description
})

const truncatedStory = computed(() => {
  const words = storyText.value.split(/\s+/)
  if (words.length <= 10 || isStoryExpanded.value) return storyText.value
  return words.slice(0, 10).join(' ') + '...'
})

const showMoreButton = computed(() => {
  const words = storyText.value.split(/\s+/)
  return words.length > 10
})

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Custom Size']

const loadProductData = async (activeId) => {
  try {
    loading.value = true
    error.value = null
    
    if (!activeId) {
      error.value = 'Product ID missing'
      return
    }

    // Fetch full product + seller info
    const prodRes = await db.execute({
      sql: `
        SELECT 
          p.*, 
          u.whatsapp as sellerPhone,
          u.username as sellerName,
          u.first_name as sellerFirstName,
          c.name as categoryName
        FROM products p 
        LEFT JOIN users u ON p.owner_id = u.id
        LEFT JOIN categories c ON p.category_id = c.id 
        WHERE p.id = ?
      `,
      args: [activeId]
    })
    
    if (prodRes.rows.length === 0) {
      error.value = 'Product not found'
      return
    }
    
    product.value = {
      ...prodRes.rows[0],
      liked: false, 
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

    // Parse gallery
    if (product.value.gallery_json) {
      try {
        gallery.value = JSON.parse(product.value.gallery_json)
      } catch (e) {
        console.error('Failed to parse gallery_json:', e)
        gallery.value = []
      }
    }
    
    // Fallback to description parsing if no structured variants or parsing failed
    if (parsedColors.value.length === 0) {
      const desc = product.value.description || ''
      const colorMatch = desc.match(/Colors:\s*(.*)/i)
      if (colorMatch && colorMatch[1]) {
        const parts = colorMatch[1].split(',').map(s => s.trim())
        parsedColors.value = parts.map((p, i) => {
          const match = p.match(/(.*)\s+\((.*)\)/)
          return {
            id: i,
            name: match ? match[1] : p,
            hex: match ? match[2] : '#8B4513',
            inStock: true,
            image: ''
          }
        })
      }
    }

    // Initial variant selection
    if (parsedColors.value.length > 0) {
      selectedColorId.value = parsedColors.value[0].id
    }

    // Fetch reviews
    const revRes = await db.execute({
      sql: `
        SELECT r.*, u.first_name, u.last_name, u.avatar 
        FROM reviews r 
        JOIN users u ON r.user_id = u.id 
        WHERE r.product_id = ?
        ORDER BY r.created_at DESC
      `,
      args: [activeId]
    })
    reviews.value = revRes.rows.map(r => ({
      id: r.id,
      author: `${r.first_name} ${r.last_name}`,
      rating: r.rating,
      text: r.text,
      time: 'Recently',
      avatar: r.avatar
    }))

    // Fetch similar products
    const similarRes = await db.execute({
      sql: "SELECT * FROM products WHERE category_id = ? AND id != ? LIMIT 4",
      args: [product.value.category_id, activeId]
    })
    similarProducts.value = similarRes.rows
    
  } catch (e) {
    console.error('Fetch error:', e)
    error.value = 'Failed to load heritage item'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  const activeId = route.params.id || props.productId
  await loadProductData(activeId)
})

watch(() => route.params.id, async (newId) => {
  if (newId) {
    await loadProductData(newId)
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
    showDialog({
      title: 'Size Required',
      message: 'Please select a size first.',
      type: 'warning'
    })
    return
  }
  
  const variant = currentVariant.value
  if (!variant || !variant.inStock || product.value.status === 'Out of Stock') {
    showDialog({
      title: 'Out of Stock',
      message: 'Sorry, this selection is currently out of stock.',
      type: 'error'
    })
    return
  }

  let phoneNumber = product.value?.sellerPhone
  if (!phoneNumber) {
    showDialog({
      title: 'Contact Error',
      message: 'Designer contact not available',
      type: 'error'
    })
    return
  }
  
  // Normalize Tanzania numbers
  let normalized = phoneNumber.startsWith('0') ? '255' + phoneNumber.slice(1) : phoneNumber.replace('+', '')
  
  const buyerName = props.userData.firstName || props.userData.username
  const sellerName = product.value.sellerFirstName || product.value.sellerName

  let message = `Jambo ${sellerName}! ✨\n\n`
  message += `My name is ${buyerName}, and I'm absolutely in love with your piece "${product.value.name}" on Alfietz! 😍\n\n`
  message += `I'd like to place an order with these details:\n`
  message += `🔹 Product: ${product.value.name}\n`
  message += `🔹 Price: ${product.value.price}\n`
  message += `🔹 Size: ${selectedSize.value}\n`
  message += `🔹 Color: ${variant.name}\n`

  if (specialInstructions.value.trim()) {
    message += `\n📝 Special Requirements: ${specialInstructions.value.trim()}\n`
  }
  
  if (withOffer && offerAmount.value) {
    message += `\n💰 My Offer: TSh ${offerAmount.value}\n`
    message += `Would you be open to this offer? I'd love to make this heritage piece mine!\n`
  } else {
    message += `\nCould you please let me know how we can proceed with the payment and delivery? 🚚\n`
  }

  message += `\nBest regards,\n${buyerName} ✍️`

  const url = `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`
  window.open(url, '_blank')
  hasConnected.value = true
  isNegotiating.value = false
}

const handleDelete = () => {
  showDialog({
    title: 'Delete Item',
    message: 'Are you sure you want to delete this heritage item? This action cannot be undone.',
    type: 'warning',
    isConfirm: true,
    confirmText: 'Delete',
    onConfirm: () => {
      emit('delete', product.value.id)
    }
  })
}

const shareProduct = async () => {
  const shareData = {
    title: `Alfietz - ${product.value.name}`,
    text: `Check out this incredible heritage piece: "${product.value.name}" on Alfietz!`,
    url: window.location.href
  }

  try {
    if (navigator.share) {
      await navigator.share(shareData)
    } else {
      await navigator.clipboard.writeText(window.location.href)
      showDialog({
        title: 'Link Copied',
        message: 'Link copied to heritage clipboard! Share it with your tribe.',
        type: 'success'
      })
    }
  } catch (err) {
    console.error('Sharing failed:', err)
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
        <div class="header-row">
          <div class="title-group">
            <h1 class="product-title">{{ product.name }}</h1>
            <div v-if="product.status === 'Out of Stock'" class="out-of-stock-tag">Out of Stock</div>
          </div>
          <div class="price-pill">
            <span class="price-value">{{ product.price }}</span>
          </div>
        </div>

        <!-- Color Section (Moved up) -->
        <div v-if="parsedColors.length" class="color-section compact-colors">
          <h3 class="section-title small">Available Patterns & Colors</h3>
          <div class="color-options">
            <div 
              v-for="color in parsedColors" 
              :key="color.id"
              class="color-option-wrapper"
              @click="selectColor(color.id)"
            >
              <div 
                class="color-swatch"
                :class="{ selected: selectedColorId === color.id, 'out-of-stock': !color.inStock, 'has-image': color.image }"
                :style="!color.image ? { backgroundColor: color.hex } : {}"
              >
                <img v-if="color.image" :src="color.image" :alt="color.name" class="variant-img" />
              </div>
              <span class="color-name-label">{{ color.name }}</span>
              <span v-if="!color.inStock" class="variant-oos">Sold Out</span>
            </div>
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

        <!-- The Story (Moved here) -->
        <div class="story-section compact">
          <h4 class="story-label">The Story</h4>
          <p class="description">
            {{ truncatedStory }}
            <button 
              v-if="showMoreButton" 
              class="more-btn" 
              @click="isStoryExpanded = !isStoryExpanded"
            >
              {{ isStoryExpanded ? 'less' : 'more' }}
            </button>
          </p>
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

        <div class="reviews-section">
          <div class="section-header-row">
            <h3 class="section-title">Heritage Reviews</h3>
            <button v-if="reviews.length > 0" class="view-all-link" @click="$emit('go-reviews')">
              View all →
            </button>
          </div>
          <p v-if="!reviews.length" class="no-reviews">
            No reviews yet. Be the first to share your heritage experience!
          </p>
          <div v-else class="review-preview-list">
            <div v-for="review in reviews.slice(0, 2)" :key="review.id" class="review-item">
              <div class="review-item-header">
                <img :src="review.avatar" class="review-avatar" />
                <div class="review-info">
                  <span class="review-author">{{ review.author }}</span>
                  <div class="star-rating mini">
                    <span v-for="n in 5" :key="n" class="star" :class="n <= review.rating ? 'filled' : 'empty'">★</span>
                  </div>
                </div>
              </div>
              <p class="review-item-text">{{ review.text }}</p>
            </div>
          </div>
        </div>

        <!-- Similar Products Section -->
        <div v-if="similarProducts.length > 0" class="similar-products-section">
          <h3 class="section-title">Similar Heritage</h3>
          <div class="similar-scroll-container">
            <ProductCard 
              v-for="item in similarProducts" 
              :key="item.id" 
              :product="item" 
              loading="lazy"
              class="similar-card"
              @click="$emit('go-details', item)"
              @toggle-like="(p) => $emit('toggle-favorite', p)"
            />
          </div>
        </div>

        <!-- Padding for sticky bottom bar -->
        <div class="bottom-spacer"></div>
      </div>

      <!-- IMAGE SECTION (Right on PC) -->
      <div class="image-section">
        <div class="top-bar">
          <button class="back-btn" @click="$emit('go-back')">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <div class="action-btns">
            <button v-if="isOwner" class="icon-btn edit-btn-top" @click="$emit('go-edit', product)">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-amber)" stroke-width="2.5"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button v-if="isOwner" class="icon-btn delete-btn" @click="handleDelete">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C62828" stroke-width="2.5"><path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
            <button class="icon-btn fav-btn" @click="$emit('toggle-favorite', product)">
              <svg v-if="product.liked" width="20" height="20" viewBox="0 0 24 24" fill="var(--accent-amber)" stroke="var(--accent-amber)" stroke-width="2" class="filled"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
            </button>
          </div>
        </div>
        <div class="main-image-container">
          <img :src="currentVariant.image || product.image" :alt="product.name" class="main-image" />
          
          <!-- Image Gallery Thumbnails -->
          <div v-if="gallery.length > 0" class="image-gallery-nav">
            <div 
              class="thumb-wrapper" 
              :class="{ active: (currentVariant.image || product.image) === product.image }"
              @click="selectedColorId = null"
            >
              <img :src="product.image" class="thumb-img" />
            </div>
            <div 
              v-for="(img, idx) in gallery" 
              :key="idx" 
              class="thumb-wrapper"
              @click="product.image = img; selectedColorId = null"
            >
              <img :src="img" class="thumb-img" />
            </div>
          </div>
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
      <div v-else class="action-wrapper animate-fade">
        <div v-if="currentUserId === 'guest'" class="guest-action-box">
          <button class="join-tribe-cta" @click="$emit('go-login')">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            Join the Tribe to Connect
          </button>
        </div>
        <div v-else class="action-grid">
          <button class="chat-btn-action" @click="$emit('go-chat', product.owner_id)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-13.4 8.38 8.38 0 0 1 3.8.9L21 3z"/></svg>
            Chat
          </button>
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

    <!-- Heritage Share & Delete Dialog -->
    <div class="share-trigger-overlay md-hidden">
       <button class="fab-btn share-fab" @click="shareProduct">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
       </button>
    </div>

    <!-- Custom Global Dialog -->
    <BaseDialog 
      :show="dialog.show"
      :title="dialog.title"
      :message="dialog.message"
      :type="dialog.type"
      :is-confirm="dialog.isConfirm"
      :confirm-text="dialog.confirmText"
      @close="dialog.show = false"
      @confirm="handleDialogConfirm"
      @cancel="dialog.show = false"
    />
  </div>
</template>

<style scoped>
.title-group { display: flex; flex-direction: column; gap: 8px; }
.out-of-stock-tag { background: #EF4444; color: white; padding: 4px 12px; border-radius: 8px; font-size: 12px; font-weight: 800; width: fit-content; text-transform: uppercase; margin-bottom: 8px; }

.selection-section { margin-bottom: 24px; }
.size-options { display: flex; flex-wrap: wrap; gap: 8px; }
.size-btn { 
  background: var(--wood-walnut); 
  border: 1px solid var(--glass-border); 
  color: var(--text-muted); 
  padding: 8px 14px; 
  border-radius: 10px; 
  font-weight: 700; 
  cursor: pointer; 
  transition: all 0.2s; 
  font-size: 12px;
  min-width: 44px;
  text-align: center;
}
.size-btn.selected { background: var(--accent-amber); color: white; border-color: var(--accent-amber); box-shadow: 0 0 10px var(--accent-glow); }

.requirements-textarea {
  width: 100%;
  min-height: 100px;
  background: var(--input-bg);
  border: 2px solid var(--input-border);
  border-radius: 12px;
  padding: 16px;
  color: var(--input-text);
  font-size: 15px;
  outline: none;
  resize: vertical;
  transition: all 0.3s ease;
}

.requirements-textarea::placeholder {
  color: var(--input-placeholder);
}

.requirements-textarea:focus {
  border-color: var(--accent-amber);
  box-shadow: 0 0 15px var(--accent-glow);
}

.color-section { margin-bottom: 40px; }
.color-options { display: flex; flex-wrap: wrap; gap: 20px; }
.color-option-wrapper { display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer; }
.color-name-label { font-size: 11px; color: var(--text-muted); font-weight: 600; max-width: 60px; text-align: center; line-height: 1.2; }
.variant-oos { font-size: 9px; color: #EF4444; font-weight: 800; text-transform: uppercase; }

.color-swatch { 
  width: 48px; 
  height: 48px; 
  border-radius: 14px; 
  border: 3px solid transparent; 
  cursor: pointer; 
  transition: all 0.3s; 
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.color-swatch.selected { border-color: var(--accent-amber); box-shadow: 0 0 15px var(--accent-glow); transform: scale(1.1); }
.color-swatch.out-of-stock { opacity: 0.5; position: relative; }
.color-swatch.out-of-stock::after { content: ''; position: absolute; top: 50%; left: 0; width: 100%; height: 2px; background: #EF4444; transform: translateY(-50%) rotate(-45deg); }
.color-swatch.has-image { border-width: 2px; }

.variant-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.story-section.compact { 
  margin-bottom: 24px; 
}

.story-label {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 8px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.more-btn {
  background: none;
  border: none;
  color: var(--accent-amber);
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  padding: 0 4px;
  text-transform: lowercase;
}

.more-btn:hover {
  text-decoration: underline;
}

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
  flex-direction: column-reverse; /* Image on top for mobile */
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
  height: 60vh; /* Taller for mobile impact */
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
    flex: 0 0 45%; 
    max-width: 600px;
    height: 100%;
    border-radius: 0;
    order: 2; /* Product on Right on Desktop */
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
  -webkit-tap-highlight-color: transparent;
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
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
}

.image-gallery-nav {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 8px;
  width: 100%;
  justify-content: center;
  scrollbar-width: none;
}

.image-gallery-nav::-webkit-scrollbar { display: none; }

.thumb-wrapper {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid transparent;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s;
  -webkit-tap-highlight-color: transparent;
}

.thumb-wrapper.active {
  border-color: var(--accent-amber);
  box-shadow: 0 0 10px var(--accent-glow);
}

.thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.main-image {
  max-width: 100%;
  max-height: 80%; 
  object-fit: contain;
  transition: transform 0.5s ease;
}

.content-section {
  padding: 32px 24px 140px 24px; /* Space for sticky bar */
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
    order: 1; /* Details on Left on Desktop */
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
  font-size: 24px;
  font-weight: 800;
  color: var(--text-amber);
  line-height: 1.2;
}

.price-pill {
  background: var(--price-bg);
  border: 1px solid var(--price-border);
  padding: 10px 16px;
  border-radius: 30px;
  box-shadow: 0 0 20px rgba(74, 222, 128, 0.1);
}

.price-value {
  font-family: 'JetBrains Mono', monospace;
  font-weight: 800;
  color: var(--price-text);
  font-size: 16px;
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
  font-size: 12px;
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
  font-size: 10px;
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

.section-title.small {
  font-size: 14px;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.compact-colors {
  margin-bottom: 24px;
}

.description {
  font-size: 15px;
  line-height: 1.8;
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

.review-preview-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.review-item {
  background: var(--wood-walnut);
  padding: 16px;
  border-radius: 16px;
  border: 1px solid var(--glass-border);
}

.review-item-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.review-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}

.review-info {
  display: flex;
  flex-direction: column;
}

.review-author {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
}

.star-rating.mini .star {
  font-size: 12px;
}

.star.filled { color: #FFC107; }
.star.empty { color: #E0E0E0; }

.review-item-text {
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.5;
  margin: 0;
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

.similar-products-section {
  margin-top: 48px;
}

.similar-scroll-container {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding: 4px 4px 24px 4px;
  margin: 0 -4px;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}

.similar-scroll-container::-webkit-scrollbar {
  display: none;
}

.similar-card {
  width: 180px;
  flex-shrink: 0;
  flex-direction: column !important;
  height: auto !important;
  border-radius: 24px !important;
}

.similar-card :deep(.image-wrapper) {
  width: 100% !important;
  height: 180px !important;
  border-radius: 24px 24px 0 0 !important;
}

.similar-card :deep(.product-details) {
  padding: 16px !important;
  gap: 12px !important;
}

.similar-card :deep(.product-name) {
  font-size: 13px !important;
  -webkit-line-clamp: 1 !important;
}

.similar-card :deep(.price-row) {
  margin-top: 0 !important;
}

.similar-card :deep(.add-btn) {
  display: none !important; /* Simplify for similar items */
}

.bottom-spacer {
  height: 120px;
}

.bottom-action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 16px 20px 32px 20px; /* Safe area padding */
  background: var(--glass-bg);
  backdrop-filter: blur(40px);
  border-top: 1px solid var(--glass-border);
  z-index: 1000;
  box-shadow: 0 -10px 30px rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
}

.action-grid {
  display: grid;
  grid-template-columns: 0.8fr 1fr 1.5fr;
  gap: 12px;
  width: 100%;
  max-width: 800px;
}

.chat-btn-action {
  background: var(--wood-walnut);
  border: 1px solid var(--glass-border);
  color: var(--text-primary);
  border-radius: 20px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  min-height: 56px;
  font-size: 14px;
  -webkit-tap-highlight-color: transparent;
}

.negotiate-btn {
  background: var(--wood-walnut);
  border: 1px solid var(--glass-border);
  color: var(--text-amber);
  border-radius: 20px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  min-height: 56px;
  font-size: 14px;
  -webkit-tap-highlight-color: transparent;
}

.connect-btn {
  background: linear-gradient(135deg, #166534, #15803d);
  color: white;
  border: none;
  border-radius: 20px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px;
  min-height: 56px;
  font-size: 15px;
  box-shadow: 0 0 20px rgba(22, 101, 52, 0.3);
  -webkit-tap-highlight-color: transparent;
}

.negotiation-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  max-width: 600px;
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
  border-radius: 20px;
  padding: 16px 20px 16px 48px;
  color: white;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 700;
  outline: none;
  min-height: 56px;
  font-size: 16px; /* No zoom */
}

.send-offer-btn {
  background: var(--accent-amber);
  color: white;
  padding: 0 24px;
  height: 56px;
  border-radius: 20px;
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
  display: flex;
  align-items: center;
  justify-content: center;
}

.guest-action-box {
  width: 100%;
  max-width: 600px;
  display: flex;
  justify-content: center;
}

.join-tribe-cta {
  width: 100%;
  background: linear-gradient(135deg, var(--wood-walnut), var(--wood-deep));
  border: 1px solid var(--accent-amber);
  color: var(--text-amber);
  border-radius: 20px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px;
  min-height: 56px;
  font-size: 16px;
  box-shadow: 0 8px 25px rgba(0,0,0,0.4);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.join-tribe-cta:hover {
  transform: translateY(-2px);
  background: linear-gradient(135deg, var(--wood-polished), var(--wood-walnut));
  box-shadow: 0 12px 30px rgba(0,0,0,0.5);
  border-color: var(--text-amber);
}

.join-tribe-cta:active {
  transform: translateY(0);
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

.icon-btn.fav-btn {
  background: rgba(13, 8, 5, 0.6) !important;
  backdrop-filter: blur(8px) !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
}

.icon-btn.fav-btn:hover {
  background: rgba(13, 8, 5, 0.8) !important;
  border-color: var(--accent-amber) !important;
}

.fav-btn svg.filled {
  filter: drop-shadow(0 0 8px var(--accent-glow));
}
</style>
