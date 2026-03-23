<!-------- (UploadWork.vue) ./src/components/shop/UploadWork.vue ------------>
<script setup>
import { ref } from 'vue'

const props = defineProps({
  categories: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['go-back', 'upload'])

const productData = ref({
  name: '',
  price: '',
  category_id: '',
  description: '',
  material: '',
  size: '',
  image: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?q=80&w=800' // Default placeholder
})

const handleSubmit = () => {
  if (!productData.value.name || !productData.value.price || !productData.value.category_id) {
    window.alert('Please fill in the essential heritage details.')
    return
  }
  
  // Combine extra fields into description for display if needed, 
  // or just send them as part of the object.
  // The user said "include the uploads to the product description"
  const fullDescription = `
Material: ${productData.value.material}
Size: ${productData.value.size}

Story:
${productData.value.description}

Image Link: ${productData.value.image}
  `.trim();

  emit('upload', { 
    ...productData.value,
    description: fullDescription
  })
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
      <div class="input-group">
        <label>Trend Name</label>
        <input type="text" v-model="productData.name" placeholder="e.g. Royal Kente Blazer" />
      </div>

      <div class="input-row">
        <div class="input-group">
          <label>Price</label>
          <input type="text" v-model="productData.price" placeholder="e.g. $150.00" />
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

      <div class="input-row">
        <div class="input-group">
          <label>Material</label>
          <input type="text" v-model="productData.material" placeholder="e.g. 100% Cotton" />
        </div>
        <div class="input-group">
          <label>Size / Dimensions</label>
          <input type="text" v-model="productData.size" placeholder="e.g. Medium / 40x40" />
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

      <div class="input-group">
        <label>Image URL</label>
        <input type="text" v-model="productData.image" placeholder="https://..." />
      </div>
    </div>

    <div class="bottom-action">
      <button class="primary-btn" @click="handleSubmit">Publish to Heritage</button>
    </div>
  </div>
</template>

<style scoped>
.upload-page {
  background-color: var(--bg-white);
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
  color: var(--secondary-brown);
  margin: 0;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 1;
}

.input-row {
  display: flex;
  gap: 16px;
}

.input-row .input-group {
  flex: 1;
}

.heritage-select {
  border: 1px solid var(--border-light);
  border-radius: 12px;
  padding: 16px;
  font-size: 15px;
  color: var(--text-main);
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
  border: 1px solid var(--border-light);
  border-radius: 12px;
  padding: 16px;
  font-size: 15px;
  color: var(--text-main);
  background: transparent;
  outline: none;
  min-height: 120px;
  resize: vertical;
  font-family: inherit;
}

.heritage-textarea:focus, .heritage-select:focus {
  border-color: var(--primary-green);
}

.bottom-action {
  padding-top: 24px;
  padding-bottom: 24px;
}
</style>