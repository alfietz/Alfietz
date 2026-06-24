<script setup>
import { ref, computed, watch, h } from 'vue'
import ProductCard from './ProductCard.vue'
import SectionHeader from '../layout/SectionHeader.vue'
import BaseDialog from '../layout/BaseDialog.vue'
import { useRoute } from 'vue-router'
import { useProgressiveData } from '../../composables/useProgressiveData'

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
  },
  favoriteItems: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['go-back', 'go-reviews', 'go-feedback', 'toggle-favorite', 'delete', 'go-edit', 'order', 'negotiate', 'go-login', 'go-tailor'])

const route = useRoute()

const activeId = computed(() => route.params.id || props.productId)

const productData = useProgressiveData('get_product_details', { productId: activeId.value }, {
  cacheKey: `product_${activeId.value}`,
  ttl: 2 * 60 * 1000
})

const reviewsData = useProgressiveData('get_reviews', { productId: activeId.value }, {
  cacheKey: `reviews_${activeId.value}`,
  ttl: 2 * 60 * 1000,
  defer: true
})

const similarData = useProgressiveData('get_similar_products', { productId: activeId.value }, {
  cacheKey: `similar_${activeId.value}`,
  ttl: 2 * 60 * 1000,
  defer: true
})

const product = computed(() => {
  const raw = productData.data.value
  if (!raw) return null
  const isLiked = props.favoriteItems.some(fav => fav.id === raw.id)
  return { ...raw, liked: isLiked, isFavorite: isLiked }
})
const productError = computed(() => {
  const e = productData.error.value
  if (!e) return null
  return typeof e === 'string' ? e : (e?.message || 'Failed to load heritage item')
})
const reviews = computed(() => reviewsData.data.value || [])
const similarProducts = computed(() => similarData.data.value || [])

watch(activeId, (id) => {
  if (!id) return
  productData.setParams({ productId: id })
  productData.refresh()
  reviewsData.setParams({ productId: id })
  reviewsData.refresh()
  similarData.setParams({ productId: id })
  similarData.refresh()
}, { immediate: true })

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

const parsedColors = ref([])
const gallery = ref([])
const activeImage = ref('')

watch(() => productData.data.value, (val) => {
  if (val) activeImage.value = val.image || ''
}, { immediate: true })
const selectedSize = ref('')
const hasConnected = ref(false)
const isNegotiating = ref(false)
const offerAmount = ref('')
const selectedColorId = ref(null)
const specialInstructions = ref('')
const isStoryExpanded = ref(false)

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
  
  let cleaned = phoneNumber.replace(/[^0-9]/g, '')
  if (cleaned.startsWith('2550')) {
    cleaned = '255' + cleaned.slice(4)
  } else if (cleaned.startsWith('0')) {
    cleaned = '255' + cleaned.slice(1)
  }
  const normalized = cleaned
  
  const buyerName = props.userData.firstName || props.userData.username
  const sellerName = product.value.first_name || product.value.owner_username

  const sparkles = "✨"
  const heartEye = "😍"
  const diamond = "🔹"
  const memo = "📝"
  const bag = "💰"
  const truck = "🚚"
  const pen = "✍️"

  let message = `Habari ${sellerName}! ${sparkles}\n\n`
  message += `My name is ${buyerName}, and I'm absolutely in love with your piece *"${product.value.name}"* on Alfietz! ${heartEye}\n\n`
  message += `I'd like to place an order with these details:\n`
  message += `${diamond} *Product:* ${product.value.name}\n`
  message += `${diamond} *Price:* ${product.value.price}\n`
  message += `${diamond} *Size:* ${selectedSize.value}\n`
  message += `${diamond} *Color:* ${variant.name}\n`

  if (specialInstructions.value.trim()) {
    message += `\n${memo} *Special Requirements:* ${specialInstructions.value.trim()}\n`
  }
  
  if (withOffer && offerAmount.value) {
    message += `\n${bag} *My Offer:* TSh ${offerAmount.value}\n`
    message += `Would you be open to this offer? I'd love to make this heritage piece mine!\n`
  } else {
    message += `\nCould you please let me know how we can proceed with the payment and delivery? ${truck}\n`
  }

  message += `\nBest regards,\n${buyerName} ${pen}`

  // Save to database
  if (withOffer) {
    emit('negotiate', {
      itemName: product.value.name,
      tailorId: product.value.owner_id,
      offer: `TSh ${offerAmount.value.toLocaleString()}`,
      size: selectedSize.value,
      color: variant.name,
      notes: specialInstructions.value.trim(),
      image: variant.image || product.value.image
    });
  } else {
    emit('order', {
      itemName: product.value.name,
      tailorId: product.value.owner_id,
      price: product.value.price,
      size: selectedSize.value,
      color: variant.name,
      notes: specialInstructions.value.trim(),
      image: variant.image || product.value.image
    });
  }

  const url = `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`
  
  // Robust opening: location.href is better for mobile deep links
  if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    window.location.href = url
  } else {
    window.open(url, '_blank')
  }

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

const shareToWhatsApp = () => {
  const text = `Check out this incredible heritage piece: "${product.value.name}" on Alfietz! ✨\n\n${window.location.href}`
  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`
  
  if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    window.location.href = url
  } else {
    window.open(url, '_blank')
  }
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
  <div v-if="product" class="product-page animate-fade">
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

        <!-- Artisan Section -->
        <div class="artisan-section-mini" @click="$emit('go-tailor', { id: product.owner_id, username: product.owner_username, first_name: product.first_name, avatar: product.owner_avatar })">
          <img :src="product.owner_avatar" class="artisan-avatar-mini" />
          <div class="artisan-info-mini">
            <span class="artisan-label">Sold by</span>
            <span class="artisan-name">{{ product.first_name || product.owner_username }}</span>
          </div>
          <button class="view-artisan-btn">
            View Profile
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m9 18 6-6-6-6"/></svg>
          </button>
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
            <div class="section-title-group">
              <h3 class="section-title">Heritage Reviews</h3>
              <div v-if="reviews.length > 0" class="rating-badge-summary">
                <span class="avg-val">{{ (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) }}</span>
                <span class="star-mini">★</span>
                <span class="count-val">({{ reviews.length }})</span>
              </div>
            </div>
            <button v-if="reviews.length > 0" class="view-all-link" @click="$emit('go-reviews')">
              See all reviews →
            </button>
          </div>
          
          <div v-if="!reviews.length" class="no-reviews-box">
            <div class="empty-icon-mini">✨</div>
            <p class="no-reviews-text">No reviews yet. Be the first to share your experience!</p>
            <button class="write-first-btn" @click="$emit('go-write-review')">Write a Review</button>
          </div>
          
          <div v-else class="review-preview-list">
            <div v-for="review in reviews.slice(0, 3)" :key="review.id" class="review-item-modern">
              <div class="review-item-header">
                <img :src="review.avatar || 'https://i.pravatar.cc/150?u=' + review.author" class="review-avatar-modern" />
                <div class="review-info-modern">
                  <div class="author-row-modern">
                    <span class="review-author-modern">{{ review.author }}</span>
                    <span class="verified-dot"></span>
                  </div>
                  <div class="star-rating mini-modern">
                    <span v-for="n in 5" :key="n" class="star" :class="n <= review.rating ? 'filled' : 'empty'">★</span>
                  </div>
                </div>
                <span class="review-date-modern">{{ review.time }}</span>
              </div>
              <p class="review-text-modern">{{ review.text }}</p>
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
              @select="$emit('go-details', item)"
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
            <button class="icon-btn delete-btn" @click="handleDelete">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C62828" stroke-width="2.5"><path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
            <button class="icon-btn wa-share-btn" @click="shareToWhatsApp" title="Share to WhatsApp">
              <i class="fab fa-whatsapp"></i>
            </button>
            <button class="icon-btn fav-btn" @click="$emit('toggle-favorite', product)">

              <svg v-if="product.liked" width="20" height="20" viewBox="0 0 24 24" fill="var(--accent-amber)" stroke="var(--accent-amber)" stroke-width="2" class="filled"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-amber)" stroke-width="2.5" class="unfilled"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
            </button>
          </div>
        </div>
        <div class="main-image-container">
          <img :src="currentVariant.image || activeImage" :alt="product.name" class="main-image" />
          
          <!-- Image Gallery Thumbnails -->
          <div v-if="gallery.length > 0" class="image-gallery-nav">
            <div 
              class="thumb-wrapper" 
              :class="{ active: (currentVariant.image || activeImage) === activeImage }"
              @click="activeImage = product.image; selectedColorId = null"
            >
              <img :src="product.image" class="thumb-img" />
            </div>
            <div 
              v-for="(img, idx) in gallery" 
              :key="idx" 
              class="thumb-wrapper"
              @click="activeImage = img; selectedColorId = null"
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
            class="add-cart-btn" 
            :class="{ disabled: !currentVariant.inStock || product.status === 'Out of Stock' }"
            @click="!(!currentVariant.inStock || product.status === 'Out of Stock') && $emit('add-to-cart', product, { size: selectedSize, color: currentVariant.name })"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          </button>
          <button 
            class="connect-btn" 
            :class="{ disabled: !currentVariant.inStock || product.status === 'Out of Stock' }"
            @click="connectToWhatsApp(false)"
          >
            Order
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

  <div v-else-if="productError" class="error-container">
    <div class="error-icon">⚠️</div>
    <p>{{ productError }}</p>
    <button @click="$emit('go-back')" class="back-btn">Back to Home</button>
  </div>

  <div v-else class="product-page skeleton-mode">
    <!-- Floating Heritage Status -->
    <div class="heritage-status-overlay">
      <div class="status-badge">
        <div class="status-icon-pulse">🧩</div>
        <span class="status-text">Deciphering Heritage...</span>
      </div>
    </div>

    <div class="layout-container">
      <div class="content-section">
        <div class="header-row">
          <div class="skeleton-title-large"></div>
          <div class="skeleton-pill"></div>
        </div>
        
        <div class="skeleton-color-section">
          <div class="skeleton-label-small"></div>
          <div class="skeleton-swatches">
            <div v-for="i in 4" :key="i" class="skeleton-swatch"></div>
          </div>
        </div>

        <div class="skeleton-specs">
          <div v-for="i in 2" :key="i" class="skeleton-spec-item">
            <div class="skeleton-label-mini"></div>
            <div class="skeleton-value"></div>
          </div>
        </div>

        <div class="skeleton-selection">
          <div class="skeleton-label-small"></div>
          <div class="skeleton-sizes">
            <div v-for="i in 6" :key="i" class="skeleton-size"></div>
          </div>
        </div>

        <div class="skeleton-story">
          <div class="skeleton-label-small"></div>
          <div class="skeleton-text-block"></div>
          <div class="skeleton-text-block short"></div>
        </div>
      </div>
      
      <div class="image-section skeleton-image-area">
        <div class="skeleton-top-bar">
          <div class="skeleton-back-btn"></div>
          <div class="skeleton-actions">
            <div class="skeleton-action-icon"></div>
            <div class="skeleton-action-icon"></div>
          </div>
        </div>
        <div class="skeleton-main-img"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Heritage Status Overlay */
.heritage-status-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  pointer-events: none;
}

.status-badge {
  background: rgba(13, 8, 5, 0.8);
  backdrop-filter: blur(12px);
  padding: var(--space-4) var(--space-6);
  border-radius: 100px;
  border: 1px solid var(--accent-amber);
  display: flex;
  align-items: center;
  gap: var(--space-3);
  box-shadow: var(--shadow-lg), 0 0 20px var(--accent-glow);
  animation: badgePop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.status-icon-pulse {
  font-size: var(--text-h2);
  animation: iconPulse 1.5s ease-in-out infinite;
}

.status-text {
  font-family: 'JetBrains Mono', monospace;
  font-size: var(--text-body);
  font-weight: 700;
  color: var(--text-amber);
  letter-spacing: 1px;
}

@keyframes badgePop {
  from { transform: scale(0.8) translateY(20px); opacity: 0; }
  to { transform: scale(1) translateY(0); opacity: 1; }
}

@keyframes iconPulse {
  0% { transform: scale(1); filter: drop-shadow(0 0 0px var(--accent-amber)); }
  50% { transform: scale(1.2); filter: drop-shadow(0 0 10px var(--accent-amber)); }
  100% { transform: scale(1); filter: drop-shadow(0 0 0px var(--accent-amber)); }
}

/* Skeleton Loading Animation */
.skeleton-mode {
  pointer-events: none;
  background: var(--wood-deep);
}

.skeleton-title-large { width: 60%; height: 32px; background: var(--wood-walnut); border-radius: 8px; }
.skeleton-pill { width: 100px; height: 40px; background: var(--wood-walnut); border-radius: 20px; }

.skeleton-color-section { margin-top: var(--space-8); }
.skeleton-label-small { width: 150px; height: 16px; background: var(--wood-walnut); border-radius: var(--radius-sm); margin-bottom: var(--space-4); }
.skeleton-swatches { display: flex; gap: var(--space-3); }
.skeleton-swatch { width: 48px; height: 48px; border-radius: var(--radius-sm); background: var(--wood-walnut); }

.skeleton-specs { display: flex; gap: var(--space-10); margin-top: var(--space-8); }
.skeleton-spec-item { flex: 1; }
.skeleton-label-mini { width: 60px; height: 10px; background: var(--wood-walnut); border-radius: 2px; margin-bottom: var(--space-2); }
.skeleton-value { width: 100%; height: 16px; background: var(--wood-walnut); border-radius: var(--radius-sm); }

.skeleton-selection { margin-top: var(--space-8); }
.skeleton-sizes { display: flex; flex-wrap: wrap; gap: var(--space-2); }
.skeleton-size { width: 50px; height: 36px; border-radius: var(--radius-sm); background: var(--wood-walnut); }

.skeleton-story { margin-top: var(--space-8); }
.skeleton-text-block { width: 100%; height: 14px; background: var(--wood-walnut); border-radius: var(--radius-sm); margin-bottom: var(--space-2); }
.skeleton-text-block.short { width: 70%; }

.skeleton-image-area { background: var(--wood-deep) !important; display: flex; flex-direction: column; }
.skeleton-top-bar { position: absolute; top: var(--space-6); left: var(--space-6); right: var(--space-6); display: flex; justify-content: space-between; z-index: 10; }
.skeleton-back-btn { width: 44px; height: 44px; border-radius: 50%; background: var(--wood-walnut); }
.skeleton-actions { display: flex; gap: var(--space-3); }
.skeleton-action-icon { width: 44px; height: 44px; border-radius: 50%; background: var(--wood-walnut); }
.skeleton-main-img { width: 70%; height: 60%; background: var(--wood-walnut); border-radius: var(--radius-lg); margin: auto; }

/* Shimmer Effect */
.skeleton-mode [class*="skeleton-"] {
  position: relative;
  overflow: hidden;
  background-color: rgba(255, 255, 255, 0.03) !important;
}

.skeleton-mode [class*="skeleton-"]::after {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  transform: translateX(-100%);
  background-image: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0,
    rgba(255, 255, 255, 0.05) 20%,
    rgba(255, 255, 255, 0.1) 60%,
    rgba(255, 255, 255, 0)
  );
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}

.title-group { display: flex; flex-direction: column; gap: var(--space-2); }
.out-of-stock-tag { background: #EF4444; color: white; padding: var(--space-1) var(--space-3); border-radius: var(--radius-sm); font-size: var(--text-caption); font-weight: 800; width: fit-content; text-transform: uppercase; margin-bottom: var(--space-2); }

.selection-section { margin-bottom: var(--space-6); }
.size-options { display: flex; flex-wrap: wrap; gap: var(--space-2); }
.size-btn { 
  background: var(--wood-walnut); 
  border: 1px solid var(--glass-border); 
  color: var(--text-muted); 
  padding: var(--space-2) var(--space-4); 
  border-radius: var(--radius-sm); 
  font-weight: 700; 
  cursor: pointer; 
  transition: all 0.2s; 
  font-size: var(--text-caption);
  min-width: 44px;
  text-align: center;
}
.size-btn.selected { background: var(--accent-amber); color: white; border-color: var(--accent-amber); box-shadow: 0 0 10px var(--accent-glow); }

.requirements-textarea {
  width: 100%;
  min-height: 100px;
  background: var(--input-bg);
  border: 2px solid var(--input-border);
  border-radius: var(--radius-sm);
  padding: var(--space-4);
  color: var(--input-text);
  font-size: var(--text-body-lg);
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

.color-section { margin-bottom: var(--space-10); }
.color-options { display: flex; flex-wrap: wrap; gap: var(--space-5); }
.color-option-wrapper { display: flex; flex-direction: column; align-items: center; gap: var(--space-2); cursor: pointer; }
.color-name-label { font-size: var(--text-caption); color: var(--text-muted); font-weight: 600; max-width: 60px; text-align: center; line-height: var(--leading-tight); }
.variant-oos { font-size: var(--text-micro); color: #EF4444; font-weight: 800; text-transform: uppercase; }

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
  margin-bottom: var(--space-6); 
}

.story-label {
  font-size: var(--text-body);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 var(--space-2) 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.more-btn {
  background: none;
  border: none;
  color: var(--accent-amber);
  font-weight: 700;
  font-size: var(--text-body);
  cursor: pointer;
  padding: 0 var(--space-1);
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
  gap: var(--space-6);
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
  font-size: var(--text-body);
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
  gap: var(--space-3);
}

.main-image-container {
  width: 100%;
  height: 100%;
  padding: var(--space-10);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-6);
}

.image-gallery-nav {
  display: flex;
  gap: var(--space-3);
  overflow-x: auto;
  padding: var(--space-2);
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
  padding: var(--space-8) var(--space-6) 140px var(--space-6);
  max-width: 800px;
  margin: 0 auto;
}

@media (min-width: 768px) {
  .content-section {
    flex: 1;
    height: 100%;
    overflow-y: auto;
    padding: var(--space-12) var(--space-12);
    margin: 0;
    max-width: none;
    order: 1;
  }
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-6);
  gap: var(--space-4);
}

.product-title {
  font-size: var(--text-h1);
  font-weight: 800;
  color: var(--text-amber);
  line-height: var(--leading-tight);
}

.price-pill {
  background: var(--price-bg);
  border: 1px solid var(--price-border);
  padding: var(--space-3) var(--space-4);
  border-radius: 30px;
  box-shadow: 0 0 20px rgba(74, 222, 128, 0.1);
}

.price-value {
  font-family: 'JetBrains Mono', monospace;
  font-weight: 800;
  color: var(--price-text);
  font-size: var(--text-body-lg);
}

.category-module {
  margin-bottom: var(--space-8);
}

.category-label {
  display: inline-block;
  padding: var(--space-2) var(--space-4);
  background: var(--wood-walnut);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-sm);
  font-size: var(--text-caption);
  font-weight: 700;
  color: var(--text-amber);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.artisan-section-mini {
  background: var(--wood-walnut);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4);
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-8);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.artisan-section-mini:hover {
  border-color: var(--accent-amber);
  background: var(--wood-polished);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.3);
}

.artisan-avatar-mini {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  object-fit: cover;
  border: 1.5px solid var(--glass-border);
}

.artisan-info-mini {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.artisan-label {
  font-size: var(--text-micro);
  font-weight: 800;
  text-transform: uppercase;
  color: var(--text-muted);
  letter-spacing: 0.5px;
}

.artisan-name {
  font-size: var(--text-body-lg);
  font-weight: 700;
  color: var(--text-primary);
}

.view-artisan-btn {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  background: rgba(217, 164, 4, 0.1);
  border: 1px solid rgba(217, 164, 4, 0.2);
  color: var(--accent-amber);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
  font-size: var(--text-caption);
  font-weight: 700;
  cursor: pointer;
}

.view-artisan-btn:hover {
  background: var(--accent-amber);
  color: white;
}

.specs-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-5);
  margin-bottom: var(--space-10);
}

.spec-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.spec-label {
  font-size: var(--text-micro);
  font-weight: 700;
  text-transform: uppercase;
  color: var(--text-muted);
  letter-spacing: 1px;
}

.spec-value {
  font-size: var(--text-body);
  font-weight: 600;
  color: var(--text-primary);
}

.section-title {
  font-size: var(--text-h3);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--space-4);
}

.section-title.small {
  font-size: var(--text-body);
  margin-bottom: var(--space-3);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.compact-colors {
  margin-bottom: var(--space-6);
}

.description {
  font-size: var(--text-body-lg);
  line-height: var(--leading-relaxed);
  color: var(--text-muted);
}

.section-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-6);
}

.section-title-group {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.rating-badge-summary {
  background: rgba(217, 164, 4, 0.1);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  gap: var(--space-1);
  border: 1px solid rgba(217, 164, 4, 0.2);
}

.avg-val {
  font-size: var(--text-body);
  font-weight: 800;
  color: var(--accent-amber);
}

.star-mini {
  color: var(--accent-amber);
  font-size: var(--text-caption);
}

.count-val {
  font-size: var(--text-caption);
  font-weight: 600;
  color: var(--text-muted);
}

.view-all-link {
  font-size: var(--text-body);
  font-weight: 700;
  color: var(--accent-amber);
  background: none;
  border: none;
  cursor: pointer;
}

.no-reviews-box {
  background: var(--wood-walnut);
  border: 1px dashed var(--glass-border);
  border-radius: var(--radius-lg);
  padding: var(--space-10) var(--space-6);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
}

.empty-icon-mini {
  font-size: var(--text-h1);
  opacity: 0.8;
}

.no-reviews-text {
  font-size: var(--text-body);
  color: var(--text-muted);
  font-style: italic;
  margin: 0;
}

.write-first-btn {
  background: var(--wood-deep);
  border: 1px solid var(--accent-amber);
  color: var(--accent-amber);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-sm);
  font-size: var(--text-body);
  font-weight: 700;
  cursor: pointer;
  margin-top: var(--space-2);
  transition: all 0.2s;
}

.write-first-btn:hover {
  background: var(--accent-amber);
  color: white;
}

.review-preview-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.review-item-modern {
  background: var(--wood-walnut);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  transition: transform 0.2s;
}

.review-item-modern:hover {
  border-color: rgba(217, 164, 4, 0.2);
}

.review-item-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
}

.review-avatar-modern {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  object-fit: cover;
  border: 1.5px solid var(--glass-border);
}

.review-info-modern {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.author-row-modern {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.review-author-modern {
  font-size: var(--text-body);
  font-weight: 700;
  color: var(--text-primary);
}

.verified-dot {
  width: 6px;
  height: 6px;
  background: #10B981;
  border-radius: 50%;
}

.star-rating.mini-modern .star {
  font-size: var(--text-caption);
}

.star.filled { color: var(--accent-amber); }
.star.empty { color: rgba(255, 255, 255, 0.1); }

.review-date-modern {
  font-size: var(--text-caption);
  font-weight: 600;
  color: var(--text-muted);
}

.review-text-modern {
  font-size: var(--text-body);
  color: var(--text-muted);
  line-height: var(--leading-snug);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.similar-products-section {
  margin-top: var(--space-12);
}

.similar-scroll-container {
  display: flex;
  gap: var(--space-4);
  overflow-x: auto;
  padding: var(--space-1) var(--space-1) var(--space-6) var(--space-1);
  margin: 0 calc(var(--space-1) * -1);
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}

.similar-scroll-container::-webkit-scrollbar {
  display: none;
}

.similar-card {
  width: 180px;
  flex-shrink: 0;
  height: auto;
  border-radius: 24px;
}

.similar-card :deep(.image-wrapper) {
  width: 100%;
  height: 180px;
  border-radius: 24px 24px 0 0;
}

.similar-card :deep(.product-details) {
  padding: var(--space-4);
  gap: var(--space-3);
}

.similar-card :deep(.product-name) {
  font-size: var(--text-h3);
  -webkit-line-clamp: 1;
}

.similar-card :deep(.price-row) {
  margin-top: 0;
}

.similar-card :deep(.add-btn) {
  display: none; /* Simplify for similar items */
}

.bottom-spacer {
  height: 120px;
}

.bottom-action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: var(--space-4) var(--space-5) var(--space-8) var(--space-5);
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
  grid-template-columns: 0.8fr 1fr 0.8fr 1.5fr;
  gap: var(--space-2);
  width: 100%;
  max-width: 800px;
}

@media (min-width: 768px) {
  .action-grid {
    gap: var(--space-3);
  }
}

.chat-btn-action, .add-cart-btn {
  background: var(--wood-walnut);
  border: 1px solid var(--glass-border);
  color: var(--text-primary);
  border-radius: var(--radius-md);
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-4);
  min-height: 56px;
  font-size: var(--text-body);
  -webkit-tap-highlight-color: transparent;
}

.add-cart-btn {
  color: var(--accent-amber);
}

.add-cart-btn.disabled {
  background: #4B5563 !important; 
  cursor: not-allowed; 
  opacity: 0.7; 
  color: var(--text-muted);
}

.negotiate-btn {
  background: var(--wood-walnut);
  border: 1px solid var(--glass-border);
  color: var(--text-amber);
  border-radius: var(--radius-md);
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-4);
  min-height: 56px;
  font-size: var(--text-body);
  -webkit-tap-highlight-color: transparent;
}

.connect-btn {
  background: linear-gradient(135deg, #166534, #15803d);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  padding: var(--space-4);
  min-height: 56px;
  font-size: var(--text-body-lg);
  box-shadow: 0 0 20px rgba(22, 101, 52, 0.3);
  -webkit-tap-highlight-color: transparent;
}

.negotiation-bar {
  display: flex;
  align-items: center;
  gap: var(--space-3);
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
  border-radius: var(--radius-md);
  padding: var(--space-4) var(--space-5) var(--space-4) var(--space-12);
  color: white;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 700;
  outline: none;
  min-height: 56px;
  font-size: var(--text-body-lg);
}

.send-offer-btn {
  background: var(--accent-amber);
  color: white;
  padding: 0 var(--space-6);
  height: 56px;
  border-radius: var(--radius-md);
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
  font-size: var(--text-h3);
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
  border-radius: var(--radius-md);
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  padding: var(--space-4);
  min-height: 56px;
  font-size: var(--text-body-lg);
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

.fav-btn svg.unfilled {
  filter: drop-shadow(0 0 4px var(--accent-glow));
}

.fav-btn svg.filled {
  filter: drop-shadow(0 0 8px var(--accent-glow));
}
</style>
