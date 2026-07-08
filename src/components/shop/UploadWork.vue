<script setup>
import { ref, onMounted, watch } from 'vue'
const props = defineProps({
  categories: {
    type: Array,
    default: () => []
  },
  editingProduct: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['go-back', 'upload'])

const IMGBB_API_KEY = '789903544b6554a772331b1ffe6e4cc4'

const productData = ref({
  id: null,
  name: '',
  price: '',
  category_id: '',
  description: '',
  material: '',
  status: 'In Stock',
  colors: [], // { hex: string, name: string, image: string, inStock: boolean, isUploading: boolean }
  image: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?q=80&w=800',
  gallery: [] // Array of image URLs
})

const populateForm = (p) => {
  if (!p) {
    productData.value = {
      id: null,
      name: '',
      price: '',
      category_id: '',
      description: '',
      material: '',
      status: 'In Stock',
      colors: [],
      image: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?q=80&w=800',
      gallery: []
    }
    return
  }

  // Parse price (remove currency prefix)
  const rawPrice = p.price ? p.price.replace(/[^0-9]/g, '') : ''

  // Parse description
  let material = p.material || ''
  let description = p.description || ''

  if (!material) {
    const matMatch = description.match(/Material:\s*(.*)/)
    if (matMatch) {
      material = matMatch[1]
    }
  }
  
  // Cleanup description from legacy markers
  description = description.replace(/Material:.*\n?/, '')
  description = description.replace(/Colors:.*\n?/, '')
  description = description.replace(/The Story:\n?/, '').trim()

  // Parse Variants
  let colors = []
  if (p.variants_json) {
    try {
      colors = JSON.parse(p.variants_json).map(c => ({
        ...c,
        isUploading: false
      }))
    } catch (e) {
      console.error('Failed to parse variants_json:', e)
    }
  }

  // Parse Gallery
  let gallery = []
  if (p.gallery_json) {
    try {
      gallery = JSON.parse(p.gallery_json)
    } catch (e) {
      console.error('Failed to parse gallery_json:', e)
    }
  }

  productData.value = {
    id: p.id,
    name: p.name || '',
    price: rawPrice,
    category_id: p.category_id || '',
    description: description,
    material: material,
    status: p.status || 'In Stock',
    colors: colors,
    image: p.image || 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?q=80&w=800',
    gallery: gallery
  }
}

onMounted(() => {
  populateForm(props.editingProduct)
})

watch(() => props.editingProduct, (newVal) => {
  populateForm(newVal)
}, { deep: true })

const colorInput = ref('#D97706')
const variantNameInput = ref('')
const errorMessage = ref('')
const isMainImageUploading = ref(false)
const uploadProgress = ref(0)
const totalToUpload = ref(0)

// Function to upload to ImgBB
const uploadToImgBB = async (file) => {
  const formData = new FormData()
  formData.append('image', file)
  
  try {
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: 'POST',
      body: formData
    })
    const result = await response.json()
    if (result.success) {
      return result.data.url
    } else {
      throw new Error(result.error?.message || 'Upload failed')
    }
  } catch (err) {
    console.error('ImgBB Upload Error:', err)
    errorMessage.value = 'Failed to upload image. Please check your internet or API key.'
    return null
  }
}

const handleMainImageUpload = async (event) => {
  const files = Array.from(event.target.files)
  if (files.length === 0) return
  
  isMainImageUploading.value = true
  errorMessage.value = ''
  uploadProgress.value = 0
  totalToUpload.value = files.length

  for (let i = 0; i < files.length; i++) {
    const url = await uploadToImgBB(files[i])
    if (url) {
      if (i === 0 && !productData.value.image.includes('unsplash')) {
        productData.value.gallery.push(url)
      } else if (i === 0) {
        productData.value.image = url
      } else {
        productData.value.gallery.push(url)
      }
    }
    uploadProgress.value = i + 1
  }
  
  isMainImageUploading.value = false
}

const removeGalleryImage = (index) => {
  productData.value.gallery.splice(index, 1)
}

const addColor = () => {
  if (!variantNameInput.value.trim()) {
    errorMessage.value = 'Please enter a name for the color variant.'
    return
  }
  
  productData.value.colors.push({ 
    hex: colorInput.value, 
    name: variantNameInput.value.trim(),
    image: '', 
    inStock: true,
    isUploading: false 
  })
  variantNameInput.value = ''
  errorMessage.value = ''
}

const handleVariantImageUpload = async (index, event) => {
  const file = event.target.files[0]
  if (!file) return
  
  productData.value.colors[index].isUploading = true
  errorMessage.value = ''
  const url = await uploadToImgBB(file)
  if (url) {
    productData.value.colors[index].image = url
  }
  productData.value.colors[index].isUploading = false
}

const removeColor = (index) => {
  productData.value.colors.splice(index, 1)
}

const handleSubmit = () => {
  if (!productData.value.name || !productData.value.price || !productData.value.category_id) {
    errorMessage.value = 'Please fill in Name, Price, and Category.'
    return
  }
  
  if (productData.value.colors.some(c => c.isUploading) || isMainImageUploading.value) {
    errorMessage.value = 'Please wait for all images to finish uploading.'
    return
  }
  
  errorMessage.value = ''

  const colorList = productData.value.colors.length > 0 
    ? productData.value.colors.map(c => `${c.name} (${c.hex})`).join(', ') 
    : 'Default';
  
  const enrichedDescription = `
Material: ${productData.value.material || 'Standard Heritage Material'}
Colors: ${colorList}

The Story:
${productData.value.description}
  `.trim();

  const formattedData = {
    ...productData.value,
    price: `TSh ${Number(productData.value.price).toLocaleString()}`,
    description: enrichedDescription,
    variants_json: JSON.stringify(productData.value.colors),
    gallery_json: JSON.stringify(productData.value.gallery)
  }
  
  emit('upload', formattedData)
}
</script>

<template>
  <div class="upload-page">
    <div class="header-row">
      <button class="back-btn" @click="$emit('go-back')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <h1 class="title">{{ productData.id ? 'Edit Heritage Design' : 'Upload Work' }}</h1>
    </div>

    <div class="form-container">
      <!-- Primary Upload Section (Hero) -->
      <section class="form-section hero-upload">
        <label class="section-label">Heritage Visuals</label>
        <div class="image-upload-wrapper">
          <label class="upload-zone" :class="{ loading: isMainImageUploading, 'has-image': !productData.image.includes('unsplash') }">
            <input type="file" accept="image/*" multiple @change="handleMainImageUpload" class="hidden-input" />
            
            <div v-if="isMainImageUploading" class="upload-overlay">
              <div class="loader-container">
                <span class="loader large"></span>
                <span class="progress-text">{{ uploadProgress }} / {{ totalToUpload }}</span>
              </div>
              <p class="upload-status-text">Uploading Heritage...</p>
            </div>

            <div v-else-if="!productData.image.includes('unsplash')" class="preview-container">
              <img :src="productData.image" alt="Main Preview" class="preview-img" />
              <div class="edit-overlay">
                <div class="edit-icon-circle">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                </div>
                <span>Change Main Image</span>
              </div>
            </div>

            <div v-else class="empty-upload-state">
              <div class="upload-icon-wrapper">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
              <div class="upload-text-group">
                <span class="main-upload-text">Upload Heritage Images</span>
                <span class="sub-upload-text">Tap to select or drag and drop</span>
              </div>
            </div>
          </label>
          
          <div v-if="productData.gallery.length > 0" class="gallery-section">
            <div class="gallery-preview-grid">
              <div v-for="(img, idx) in productData.gallery" :key="idx" class="gallery-item">
                <img :src="img" alt="Gallery" />
                <button class="remove-gallery-img" @click.stop.prevent="removeGalleryImage(idx)">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
              <label class="add-gallery-item">
                <input type="file" accept="image/*" multiple @change="handleMainImageUpload" class="hidden-input" />
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              </label>
            </div>
          </div>
        </div>
      </section>

      <!-- Identity Section -->
      <section class="form-section">
        <label class="section-label">Trend Identity</label>
        <div class="input-row">
          <div class="input-group flex-2">
            <label>Name</label>
            <input type="text" v-model="productData.name" placeholder="e.g. Royal Kente Blazer" />
          </div>
          <div class="input-group flex-1">
            <label>Category</label>
            <select v-model="productData.category_id" class="heritage-select">
              <option value="" disabled selected>Select</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>
        </div>
      </section>

      <!-- Pricing & Status Section -->
      <section class="form-section">
        <label class="section-label">Status & Value</label>
        <div class="input-row">
          <div class="input-group flex-2">
            <label>Price (TSh)</label>
            <div class="price-input-wrapper">
              <span class="currency-prefix">TSh</span>
              <input type="number" v-model="productData.price" placeholder="50,000" class="price-input" />
            </div>
          </div>
          <div class="input-group flex-1">
            <label>Stock</label>
            <select v-model="productData.status" class="heritage-select">
              <option value="In Stock">In Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>
        </div>
      </section>

      <!-- Variants Section -->
      <section class="form-section">
        <label class="section-label">Craftsmanship Details</label>
        <div class="input-group">
          <label>Primary Material</label>
          <input type="text" v-model="productData.material" placeholder="e.g. 100% Cotton, Silk" />
        </div>

        <div class="input-group variant-management">
          <label>Color Variants</label>
          <div class="variant-entry-row">
            <div class="color-picker-wrapper">
              <input type="color" v-model="colorInput" class="color-dot-input" />
            </div>
            <input type="text" v-model="variantNameInput" placeholder="Variant Name (e.g. Midnight Blue)" class="variant-name-input" />
            <button type="button" class="add-color-btn" @click="addColor">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Add
            </button>
          </div>
          
          <div v-if="productData.colors.length > 0" class="variant-list">
            <div v-for="(variant, index) in productData.colors" :key="index" class="variant-row">
              <div class="variant-info">
                <span class="color-preview" :style="{ backgroundColor: variant.hex }"></span>
                <div class="variant-text">
                  <span class="variant-name-display">{{ variant.name }}</span>
                  <span class="color-hex">{{ variant.hex }}</span>
                </div>
              </div>
              
              <div class="variant-upload">
                <label class="variant-upload-btn" :class="{ 'has-image': variant.image }">
                  <input 
                    type="file" 
                    accept="image/*" 
                    @change="handleVariantImageUpload(index, $event)" 
                    class="hidden-input"
                  />
                  
                  <div v-if="variant.image" class="variant-preview-wrapper">
                    <img :src="variant.image" alt="Variant" class="variant-preview-img" />
                    <div class="upload-badge">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                    </div>
                  </div>
                  <div v-else-if="variant.isUploading" class="variant-loading">
                    <span class="loader small"></span>
                  </div>
                  <div v-else class="variant-placeholder">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  </div>
                </label>
              </div>

              <div class="variant-stock-toggle">
                <label class="toggle-switch">
                  <input type="checkbox" v-model="variant.inStock" />
                  <span class="slider"></span>
                </label>
                <span class="stock-label">{{ variant.inStock ? 'In' : 'Out' }}</span>
              </div>
              
              <button class="remove-variant" @click="removeColor(index)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Story Section -->
      <section class="form-section">
        <label class="section-label">The Story</label>
        <div class="input-group textarea-group">
          <label>Inspiration & Details</label>
          <textarea 
            v-model="productData.description" 
            placeholder="Describe the cultural inspiration behind this piece..."
            class="heritage-textarea"
          ></textarea>
        </div>
      </section>

      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </div>

    <div class="bottom-action-bar">
      <button class="primary-btn publish-btn" @click="handleSubmit">
        {{ productData.id ? 'Update Heritage Piece' : 'Publish to Heritage' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.upload-page {
  background-color: var(--wood-deep);
  min-height: 100vh;
  padding: 24px 20px 120px 20px;
  display: flex;
  flex-direction: column;
}

.header-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
}

.title {
  font-size: 22px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  flex: 1;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: #1a1410; /* Solid background for sections */
  padding: 24px;
  border-radius: 24px;
  border: 1px solid var(--glass-border);
  position: relative;
}

@media (max-width: 600px) {
  .form-section {
    padding: 16px;
    border-radius: 20px;
  }
  
  .input-row {
    flex-direction: column;
    gap: 24px;
  }
}

.section-label {
  font-size: 12px;
  font-weight: 800;
  color: var(--accent-amber);
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-bottom: 4px;
}

.hero-upload {
  background: transparent;
  padding: 0;
  border: none;
}

.hero-upload .section-label {
  margin-left: 12px;
}

.input-group {
  position: relative;
  display: flex;
  flex-direction: column;
}

.flex-1 { flex: 1; }
.flex-2 { flex: 2; }

.input-group label:not(.section-label):not(.toggle-switch):not(.variant-upload-btn):not(.add-gallery-item):not(.upload-zone) {
  position: absolute;
  top: -10px;
  left: 14px;
  background: #1a1410;
  padding: 0 6px;
  font-size: 11px;
  font-weight: 700;
  color: var(--text-light);
  z-index: 10;
  border-radius: 4px;
  line-height: 1;
}

.hero-upload .input-group label:not(.section-label) {
  background: #0D0805; /* Solid flat color matching the dark bg deep area */
}

.input-group input:not(.color-dot-input):not(.hidden-input) {
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 18px;
  font-size: 15px;
  color: var(--text-primary);
  background: var(--input-bg);
  outline: none;
  transition: all 0.2s ease;
  width: 100%; /* Ensure full width */
}

.input-group input:focus {
  border-color: var(--accent-amber);
  background: rgba(255, 255, 255, 0.01);
  box-shadow: 0 0 0 4px rgba(217, 119, 6, 0.1);
}

.price-input-wrapper {
  display: flex;
  align-items: center;
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  background: transparent;
  overflow: hidden;
  transition: all 0.2s ease;
}

.price-input-wrapper:focus-within {
  border-color: var(--accent-amber);
  box-shadow: 0 0 0 4px rgba(217, 119, 6, 0.1);
}

.currency-prefix {
  padding: 0 12px 0 18px;
  font-size: 14px;
  font-weight: 800;
  color: var(--accent-amber);
}

.price-input {
  border: none !important;
  padding-left: 0 !important;
  flex: 1;
}

.variant-management {
  margin-top: 8px;
}

.variant-entry-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 4px;
}

@media (max-width: 480px) {
  .variant-entry-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .add-color-btn {
    width: 100%;
    justify-content: center;
  }
}

.color-picker-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--glass-border);
  flex-shrink: 0;
}

.color-dot-input {
  width: 140% !important;
  height: 140% !important;
  transform: translate(-15%, -15%);
  border: none !important;
  cursor: pointer;
  background: transparent;
}

.variant-name-input {
  flex: 1;
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 14px 18px;
  font-size: 14px;
  background: transparent;
  color: white;
  outline: none;
  transition: all 0.2s;
}

.variant-name-input:focus {
  border-color: var(--accent-amber);
}

.add-color-btn {
  background: var(--accent-amber);
  border: none;
  color: white;
  padding: 0 20px;
  height: 48px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.add-color-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(217, 119, 6, 0.3);
}

.variant-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 20px;
}

.variant-row {
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(255, 255, 255, 0.03);
  padding: 12px 16px;
  border-radius: 16px;
  border: 1px solid var(--glass-border);
}

@media (max-width: 600px) {
  .variant-row {
    flex-wrap: wrap;
    gap: 12px;
  }
  
  .variant-info {
    min-width: 100%;
  }
  
  .variant-upload {
    flex: 1;
  }
}

.variant-info {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 140px;
}

.variant-text {
  display: flex;
  flex-direction: column;
}

.variant-name-display {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
}

.variant-upload {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.variant-upload-btn {
  width: 100%;
  max-width: 100px;
  height: 44px;
  border: 1px dashed var(--glass-border);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.02);
}

.variant-upload-btn:hover {
  border-color: var(--accent-amber);
  background: rgba(217, 119, 6, 0.05);
}

.variant-upload-btn.has-image {
  border-style: solid;
  border-color: var(--glass-border);
}

.variant-preview-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

.variant-preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-badge {
  position: absolute;
  bottom: 2px;
  right: 2px;
  background: var(--accent-amber);
  color: white;
  width: 16px;
  height: 16px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.variant-placeholder {
  color: var(--text-muted);
  opacity: 0.5;
}

.variant-stock-toggle {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stock-label {
  font-size: 10px;
  font-weight: 800;
  color: var(--text-muted);
}

.remove-variant {
  background: rgba(239, 68, 68, 0.1);
  border: none;
  color: #EF4444;
  width: 32px;
  height: 32px;
  cursor: pointer;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.remove-variant:hover {
  background: #EF4444;
  color: white;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 34px;
  height: 20px;
}

.toggle-switch input { opacity: 0; width: 0; height: 0; }

.slider {
  position: absolute;
  cursor: pointer;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: #4B5563;
  transition: .4s;
  border-radius: 20px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 14px; width: 14px;
  left: 3px; bottom: 3px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider { background-color: #10B981; }
input:checked + .slider:before { transform: translateX(14px); }

.heritage-select {
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 18px;
  font-size: 15px;
  color: var(--text-primary);
  background: var(--input-bg);
  width: 100%;
  outline: none;
  appearance: none;
  cursor: pointer;
}

.heritage-textarea {
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 18px;
  font-size: 15px;
  color: var(--text-primary);
  background: var(--input-bg);
  outline: none;
  min-height: 160px;
  resize: vertical;
  font-family: inherit;
  line-height: 1.6;
}

.heritage-textarea:focus, .heritage-select:focus {
  border-color: var(--accent-amber);
}

.image-upload-wrapper {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 8px;
}

.upload-zone {
  width: 100%;
  min-height: 320px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 28px;
  border: 2px dashed var(--glass-border);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

@media (max-width: 600px) {
  .upload-zone {
    min-height: 240px;
    border-radius: 20px;
  }
}

.upload-zone:hover {
  border-color: var(--accent-amber);
  background: rgba(217, 119, 6, 0.05);
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
}

.upload-zone.has-image {
  border-style: solid;
  border-color: var(--glass-border);
}

.preview-container {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-img {
  max-width: 100%;
  max-height: 320px;
  object-fit: contain;
  transition: transform 0.5s ease;
}

.upload-zone:hover .preview-img {
  transform: scale(1.02);
}

.edit-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  opacity: 0;
  transition: opacity 0.3s ease;
  color: white;
  font-weight: 700;
  font-size: 14px;
}

.upload-zone:hover .edit-overlay {
  opacity: 1;
}

.edit-icon-circle {
  width: 56px;
  height: 56px;
  background: var(--accent-amber);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);
}

.empty-upload-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 40px;
  text-align: center;
}

.upload-icon-wrapper {
  width: 100px;
  height: 100px;
  background: var(--wood-walnut);
  border-radius: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-amber);
  transition: all 0.3s ease;
}

.upload-zone:hover .upload-icon-wrapper {
  background: var(--accent-amber);
  color: white;
  transform: scale(1.1) rotate(5deg);
}

.upload-text-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.main-upload-text {
  font-size: 20px;
  font-weight: 800;
  color: var(--text-primary);
}

.sub-upload-text {
  font-size: 14px;
  color: var(--text-muted);
  opacity: 0.8;
}

.gallery-preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(88px, 1fr));
  gap: 16px;
}

.gallery-item {
  position: relative;
  height: 88px;
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid var(--glass-border);
  transition: all 0.3s ease;
}

.gallery-item:hover {
  transform: scale(1.05);
  border-color: var(--accent-amber);
  z-index: 2;
  box-shadow: 0 8px 20px rgba(0,0,0,0.3);
}

.gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-gallery-img {
  position: absolute;
  top: 6px;
  right: 6px;
  background: #EF4444;
  color: white;
  border: none;
  border-radius: 8px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.2s ease;
}

.gallery-item:hover .remove-gallery-img {
  opacity: 1;
  transform: scale(1);
}

.add-gallery-item {
  height: 88px;
  border: 2px dashed var(--glass-border);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-gallery-item:hover {
  border-color: var(--accent-amber);
  color: var(--accent-amber);
  background: rgba(217, 119, 6, 0.05);
}

.loader.large {
  width: 80px;
  height: 80px;
  border-width: 4px;
}

.error-message {
  background: rgba(239, 68, 68, 0.1);
  color: #EF4444;
  padding: 16px;
  border-radius: 16px;
  border: 1px solid rgba(239, 68, 68, 0.2);
  font-size: 14px;
  font-weight: 600;
  text-align: center;
}

.input-row {
  display: flex;
  gap: 16px;
}

.bottom-action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  border-top: 1px solid var(--glass-border);
  padding: 20px 24px 32px;
  z-index: 100;
  display: flex;
  justify-content: center;
}

.publish-btn {
  max-width: 600px;
  width: 100%;
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

.loader {
  width: 24px;
  height: 24px;
  border: 3px solid var(--accent-amber);
  border-bottom-color: transparent;
  border-radius: 50%;
  display: inline-block;
  animation: rotation 1s linear infinite;
}

.loader.small {
  width: 20px;
  height: 20px;
  border-width: 2px;
}

.loader-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-text {
  position: absolute;
  color: white;
  font-size: 14px;
  font-weight: 800;
}

.upload-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  z-index: 10;
}

.upload-status-text {
  color: var(--accent-amber);
  font-weight: 700;
  font-size: 15px;
  letter-spacing: 1px;
  text-transform: uppercase;
}

@keyframes rotation {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.hidden-input {
  display: none;
}
</style>