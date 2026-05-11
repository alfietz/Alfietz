<!-------- (UploadWork.vue) ./src/components/shop/UploadWork.vue ------------>
<script setup>
import { ref, onMounted, watch } from 'vue'

const props = defineProps({
  categories: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['go-back', 'upload'])

const IMGBB_API_KEY = '789903544b6554a772331b1ffe6e4cc4'
const STORAGE_KEY = 'alfie_draft_upload'

const productData = ref({
  name: '',
  price: '',
  category_id: '',
  description: '',
  material: '',
  status: 'In Stock',
  colors: [], // { hex: string, name: string, image: string, inStock: boolean, isUploading: boolean }
  image: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?q=80&w=800'
})

onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      // Migration for old drafts
      if (parsed.colors) {
        parsed.colors = parsed.colors.map(c => ({
          ...c,
          name: c.name || '',
          inStock: c.inStock !== undefined ? c.inStock : true
        }))
      }
      productData.value = { ...productData.value, ...parsed }
    } catch (e) {
      console.error('Failed to load draft:', e)
    }
  }
})

watch(productData, (val) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
}, { deep: true })

const colorInput = ref('#D97706')
const variantNameInput = ref('')
const errorMessage = ref('')
const isMainImageUploading = ref(false)

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
  const file = event.target.files[0]
  if (!file) return
  
  isMainImageUploading.value = true
  errorMessage.value = ''
  const url = await uploadToImgBB(file)
  if (url) {
    productData.value.image = url
  }
  isMainImageUploading.value = false
}

const addColor = () => {
  // Check if hex already exists or name is empty
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

  // For backward compatibility in description but also structured JSON
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
    variants_json: JSON.stringify(productData.value.colors)
  }
  
  // Clear draft on success
  localStorage.removeItem(STORAGE_KEY)
  emit('upload', formattedData)
}
</script>

<template>
  <div class="upload-page">
    <div class="header-row">
      <button class="back-btn" @click="$emit('go-back')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <h1 class="title">Upload Work</h1>
    </div>

    <div class="form-container">
      <!-- Main Product Image -->
      <div class="input-group">
        <label>Main Product Image</label>
        <div class="image-upload-wrapper">
          <div class="preview-box" :class="{ loading: isMainImageUploading }">
            <img :src="productData.image" alt="Preview" class="preview-img" />
            <div v-if="isMainImageUploading" class="upload-overlay">
              <span class="loader"></span>
            </div>
          </div>
          <input type="file" accept="image/*" @change="handleMainImageUpload" class="file-input" />
        </div>
      </div>

      <div class="input-row">
        <div class="input-group flex-2">
          <label>Trend Name</label>
          <input type="text" v-model="productData.name" placeholder="e.g. Royal Kente Blazer" />
        </div>
        <div class="input-group flex-1">
          <label>General Stock</label>
          <select v-model="productData.status" class="heritage-select">
            <option value="In Stock">In Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
        </div>
      </div>

      <div class="input-row">
        <div class="input-group">
          <label>Price (TSh)</label>
          <div class="price-input-wrapper">
            <span class="currency-prefix">TSh</span>
            <input type="number" v-model="productData.price" placeholder="50,000" class="price-input" />
          </div>
        </div>
        <div class="input-group">
          <label>Category</label>
          <select v-model="productData.category_id" class="heritage-select">
            <option value="" disabled selected>Select Category</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
              {{ cat.name }}
            </option>
          </select>
        </div>
      </div>

      <div class="input-group">
        <label>Material</label>
        <input type="text" v-model="productData.material" placeholder="e.g. 100% Cotton, Silk" />
      </div>

      <!-- Color Variants with Image Upload -->
      <div class="input-group">
        <label>Color Variants & Variant Images</label>
        <div class="variant-entry-row">
          <input type="color" v-model="colorInput" class="color-dot-input" />
          <input type="text" v-model="variantNameInput" placeholder="Color Name (e.g. Deep Sea Blue)" class="variant-name-input" />
          <button type="button" class="add-color-btn" @click="addColor">Add Variant</button>
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
              <div v-if="variant.image" class="variant-preview">
                <img :src="variant.image" alt="Variant" />
              </div>
              <div v-else-if="variant.isUploading" class="variant-loading">
                <span class="loader small"></span>
              </div>
              <input 
                type="file" 
                accept="image/*" 
                @change="handleVariantImageUpload(index, $event)" 
                class="file-input-small"
              />
            </div>

            <div class="variant-stock-toggle">
              <label class="toggle-switch">
                <input type="checkbox" v-model="variant.inStock" />
                <span class="slider"></span>
              </label>
              <span class="stock-label">{{ variant.inStock ? 'In' : 'Out' }}</span>
            </div>
            
            <button class="remove-variant" @click="removeColor(index)">&times;</button>
          </div>
        </div>
      </div>

      <div class="input-group textarea-group">
        <label>Craftsmanship Story</label>
        <textarea 
          v-model="productData.description" 
          placeholder="Describe the inspiration behind this piece..."
          class="heritage-textarea"
        ></textarea>
      </div>

      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </div>

    <div class="bottom-action">
      <button class="primary-btn" @click="handleSubmit">Publish to Heritage</button>
    </div>
  </div>
</template>

<style scoped>
.upload-page {
  background-color: var(--wood-deep);
  min-height: 100vh;
  padding: 24px 20px;
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

.error-message { color: #E53935; font-size: 13px; font-weight: 500; margin: 8px 0; text-align: center; }

.form-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 1;
}

.input-group {
  position: relative;
  display: flex;
  flex-direction: column;
}

.flex-1 { flex: 1; }
.flex-2 { flex: 2; }

.input-group label {
  position: absolute;
  top: -8px;
  left: 12px;
  background: var(--wood-deep);
  padding: 0 4px;
  font-size: 11px;
  color: var(--text-light);
  z-index: 1;
}

.input-group input:not(.color-dot-input):not(.file-input) {
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  padding: 16px;
  font-size: 15px;
  color: var(--text-primary);
  background: transparent;
  outline: none;
  transition: border-color 0.2s;
}

.input-group input:focus {
  border-color: var(--text-amber);
}

.price-input-wrapper {
  display: flex;
  align-items: center;
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  background: transparent;
  overflow: hidden;
}

.currency-prefix {
  padding: 0 12px 0 16px;
  font-size: 14px;
  font-weight: 700;
  color: var(--text-amber);
}

.price-input {
  border: none !important;
  padding-left: 0 !important;
  flex: 1;
}

/* Variant Entry Row */
.variant-entry-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 4px;
}

.variant-name-input {
  flex: 1;
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 14px;
  background: transparent;
  color: white;
  outline: none;
}

/* Variant List Styles */
.variant-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
}

.variant-row {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.03);
  padding: 12px;
  border-radius: 12px;
  border: 1px solid var(--glass-border);
}

.variant-info {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 120px;
}

.variant-text {
  display: flex;
  flex-direction: column;
}

.variant-name-display {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.variant-upload {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.variant-preview {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid var(--glass-border);
  flex-shrink: 0;
}

.variant-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.file-input-small {
  font-size: 10px;
  width: 100%;
  max-width: 120px;
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
  background: none;
  border: none;
  color: #EF4444;
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
}

/* Toggle Switch */
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

/* Loader */
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
  width: 16px;
  height: 16px;
  border-width: 2px;
}

@keyframes rotation {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Color Picker Styles */
.color-dot-input {
  width: 44px !important;
  height: 44px !important;
  padding: 0 !important;
  border-radius: 50% !important;
  cursor: pointer;
  border: 2px solid var(--glass-border) !important;
  background: transparent;
}

.add-color-btn {
  background: var(--wood-walnut);
  border: 1px solid var(--accent-amber);
  color: var(--text-amber);
  padding: 10px 16px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.color-preview {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.2);
  flex-shrink: 0;
}

.color-hex {
  font-size: 10px;
  font-family: monospace;
  color: var(--text-muted);
}

.input-row {
  display: flex;
  gap: 16px;
}

.input-row .input-group {
  flex: 1;
}

.heritage-select {
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  padding: 16px;
  font-size: 15px;
  color: var(--text-primary);
  background: transparent;
  width: 100%;
  outline: none;
  appearance: none;
  cursor: pointer;
}

.textarea-group {
  margin-top: 8px;
}

.heritage-textarea {
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  padding: 16px;
  font-size: 15px;
  color: var(--text-primary);
  background: transparent;
  outline: none;
  min-height: 120px;
  resize: vertical;
  font-family: inherit;
}

.heritage-textarea:focus, .heritage-select:focus {
  border-color: var(--text-amber);
}

.bottom-action {
  padding-top: 24px;
  padding-bottom: 24px;
}
</style>