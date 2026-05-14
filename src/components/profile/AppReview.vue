<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  t: {
    type: Function,
    required: true
  }
})

const emit = defineEmits(['go-back', 'submit'])

const reviewText = ref('')
const rating = ref(5)
const maxChars = 500
const imagePreview = ref(null)
const imageBase64 = ref(null)

const remainingChars = computed(() => maxChars - reviewText.value.length)

const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target.result
      imageBase64.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const removeImage = () => {
  imagePreview.value = null
  imageBase64.value = null
}

const handleSubmit = () => {
  if (!reviewText.value.trim()) return
  emit('submit', {
    rating: rating.value,
    text: reviewText.value,
    image: imageBase64.value
  })
}
</script>

<template>
  <div class="app-review-page animate-fade">
    <div class="header-row">
      <button class="back-btn" @click="$emit('go-back')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <h1 class="title">App Review</h1>
    </div>

    <div class="form-container">
      <div class="rating-section">
        <p class="section-label">How is your experience with Alfie?</p>
        <div class="stars">
          <button 
            v-for="star in 5" 
            :key="star" 
            class="star-btn"
            :class="{ active: star <= rating }"
            @click="rating = star"
          >
            <svg width="36" height="36" viewBox="0 0 24 24" :fill="star <= rating ? 'var(--accent-amber)' : 'none'" stroke="var(--accent-amber)" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          </button>
        </div>
      </div>

      <div class="input-section">
        <label class="section-label">Your Feedback</label>
        <textarea 
          v-model="reviewText" 
          :maxlength="maxChars"
          placeholder="What do you love? What can we improve?" 
          class="review-textarea"
        ></textarea>
        <div class="char-count">{{ remainingChars }} characters remaining</div>
      </div>

      <div class="image-upload-section">
        <label class="section-label">Referencing Image (Optional)</label>
        <div v-if="!imagePreview" class="upload-placeholder" @click="$refs.fileInput.click()">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          <span>Upload Image</span>
          <input type="file" ref="fileInput" hidden accept="image/*" @change="handleImageUpload" />
        </div>
        <div v-else class="image-preview-container">
          <img :src="imagePreview" class="preview-img" />
          <button class="remove-img-btn" @click="removeImage">✕</button>
        </div>
      </div>
    </div>

    <div class="bottom-action">
      <button 
        class="primary-btn" 
        :disabled="!reviewText.trim()"
        @click="handleSubmit"
      >
        Submit App Review
      </button>
    </div>
  </div>
</template>

<style scoped>
.app-review-page {
  background: var(--wood-deep);
  min-height: 100vh;
  padding: 24px 20px 40px 20px;
  max-width: 800px;
  margin: 0 auto;
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
  font-weight: 700;
  color: var(--text-primary);
}

.form-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.section-label {
  display: block;
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-muted);
  margin-bottom: 12px;
}

.stars {
  display: flex;
  gap: 12px;
}

.star-btn {
  transition: transform 0.2s;
}

.star-btn:hover {
  transform: scale(1.1);
}

.review-textarea {
  width: 100%;
  min-height: 150px;
  background: var(--wood-walnut);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 16px;
  color: white;
  font-size: 15px;
  outline: none;
  resize: none;
}

.review-textarea:focus {
  border-color: var(--accent-amber);
}

.char-count {
  text-align: right;
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 8px;
}

.upload-placeholder {
  width: 100%;
  height: 120px;
  border: 2px dashed var(--glass-border);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.3s;
}

.upload-placeholder:hover {
  border-color: var(--accent-amber);
  color: var(--text-primary);
}

.image-preview-container {
  position: relative;
  width: 100%;
  height: 200px;
  border-radius: 16px;
  overflow: hidden;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-img-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  background: rgba(0,0,0,0.6);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bottom-action {
  margin-top: 40px;
}

.primary-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
