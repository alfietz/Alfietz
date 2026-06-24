<!-------- (WriteReview.vue) ./src/components/communication/WriteReview.vue ------------>
<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  t: {
    type: Function,
    required: true
  }
})

const reviewText = ref('')
const rating = ref(5)
const maxChars = 350
const selectedTags = ref([])
const reviewImage = ref(null)
const isUploading = ref(false)

const tags = computed(() => [
  props.t('tags.excellentQuality'), 
  props.t('tags.perfectFit'), 
  props.t('tags.vibrantColors'), 
  props.t('tags.fastDelivery'), 
  props.t('tags.greatMaterial'), 
  props.t('tags.uniqueDesign'),
  props.t('tags.authentic'), 
  props.t('tags.highlyRecommend')
])

const remainingChars = computed(() => maxChars - reviewText.value.length)
// ... (rest of logic)
const toggleTag = (tag) => {
  if (selectedTags.value.includes(tag)) {
    selectedTags.value = selectedTags.value.filter(t => t !== tag)
    if (reviewText.value.includes(tag)) {
      reviewText.value = reviewText.value.replace(new RegExp(`\\s*#${tag.replace(/\s+/g, '')}`, 'g'), '').trim()
    }
  } else {
    selectedTags.value.push(tag)
    const tagText = ` #${tag.replace(/\s+/g, '')}`
    if (reviewText.value.length + tagText.length <= maxChars) {
      reviewText.value += (reviewText.value ? ' ' : '') + tagText
    }
  }
}

const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  isUploading.value = true
  const reader = new FileReader()
  reader.onload = (e) => {
    reviewImage.value = e.target.result
    isUploading.value = false
  }
  reader.readAsDataURL(file)
}

const removeImage = () => {
  reviewImage.value = null
}

defineEmits(['go-back', 'submit'])
</script>

<template>
  <div class="write-review-page pattern-heritage animate-fade">
    <div class="header-row">
      <button class="back-btn tap-active" @click="$emit('go-back')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <h1 class="title">{{ t('shareJourneyTitle') }}</h1>
    </div>

    <div class="form-container">
      <div class="rating-selection">
        <p class="rating-label">{{ t('heritageExpLabel') }}</p>
        <div class="stars">
          <button 
            v-for="star in 5" 
            :key="star" 
            class="star-btn"
            :class="{ active: star <= rating, 'pulse': star === rating }"
            @click="rating = star"
          >
            <svg width="40" height="40" viewBox="0 0 24 24" :fill="star <= rating ? 'var(--accent-amber)' : 'none'" :stroke="star <= rating ? 'var(--accent-amber)' : 'rgba(255,255,255,0.2)'" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </button>
        </div>
        <p class="rating-text-feedback">
          {{ [t('ratingText1'), t('ratingText2'), t('ratingText3'), t('ratingText4'), t('ratingText5')][rating - 1] }}
        </p>
      </div>

      <!-- Photo Upload Section -->
      <div class="input-group">
        <label class="group-label">{{ t('showTribeLabel') }}</label>
        <div class="photo-upload-area">
          <div v-if="reviewImage" class="preview-container">
            <img :src="reviewImage" class="image-preview" alt="Review preview" />
            <button class="remove-photo-btn" @click="removeImage">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <label v-else class="upload-placeholder tap-active">
            <input type="file" accept="image/*" class="hidden-input" @change="handleImageUpload" />
            <div class="upload-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            </div>
            <span>{{ t('addPhotoWearing') }}</span>
          </label>
        </div>
      </div>

      <div class="input-group">
        <label class="group-label">{{ t('quickTagsLabel') }}</label>
        <div class="tags-cloud">
          <button 
            v-for="tag in tags" 
            :key="tag"
            class="tag-pill"
            :class="{ active: selectedTags.includes(tag) }"
            @click="toggleTag(tag)"
          >
            {{ tag }}
          </button>
        </div>
      </div>

      <div class="input-group">
        <label class="group-label">{{ t('yourStoryLabel') }}</label>
        <div class="textarea-wrapper">
          <textarea 
            v-model="reviewText" 
            :maxlength="maxChars"
            :placeholder="t('storyPlaceholder')" 
            class="review-input"
          ></textarea>
          <div class="char-count" :class="{ 'warning': remainingChars < 50 }">
            {{ remainingChars }}
          </div>
        </div>
      </div>
    </div>

    <div class="bottom-action">
      <button 
        class="primary-btn" 
        :disabled="(!reviewText.trim() && rating === 0) || isUploading"
        @click="$emit('submit', { rating, text: reviewText, image: reviewImage })"
      >
        <span>{{ t('shareWithTribe') }}</span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.write-review-page {
  background-color: var(--wood-deep);
  min-height: 100vh;
  padding: var(--space-10) var(--space-6) var(--space-12);
  max-width: 800px;
  margin: 0 auto;
}

.header-row {
  display: flex;
  align-items: center;
  gap: var(--space-5);
  margin-bottom: var(--space-10);
}

.back-btn {
  background-color: var(--wood-walnut);
  border: 1px solid var(--glass-border);
  border-radius: 50%;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-primary);
  transition: all 0.2s ease;
}

.back-btn:hover {
  background-color: var(--wood-polished);
  border-color: var(--accent-amber);
}

.title {
  font-size: var(--text-h1);
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-10);
}

.rating-selection {
  text-align: center;
  background: var(--wood-walnut);
  padding: var(--space-10) var(--space-5);
  border-radius: var(--radius-lg);
  border: 1px solid var(--glass-border);
}

.rating-label {
  font-size: var(--text-body-lg);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--space-6);
}

.stars {
  display: flex;
  justify-content: center;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.star-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--space-1);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.star-btn:hover { transform: scale(1.2); }
.star-btn.active svg { filter: drop-shadow(0 0 8px var(--accent-glow)); }

.rating-text-feedback {
  font-size: var(--text-body);
  font-weight: 800;
  color: var(--accent-amber);
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.group-label {
  font-size: var(--text-caption);
  font-weight: 800;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 1.5px;
}

.photo-upload-area {
  width: 100%;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  height: 120px;
  background: var(--wood-walnut);
  border: 2px dashed var(--glass-border);
  border-radius: var(--radius-lg);
  color: var(--text-muted);
  font-size: var(--text-body);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.upload-placeholder:hover {
  border-color: var(--accent-amber);
  background: var(--wood-polished);
  color: var(--text-primary);
}

.upload-icon-box {
  width: 44px;
  height: 44px;
  background: var(--wood-deep);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-amber);
}

.hidden-input { display: none; }

.preview-container {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 2px solid var(--accent-amber);
  box-shadow: 0 8px 20px rgba(0,0,0,0.3);
}

.image-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-photo-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0,0,0,0.7);
  border: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.tags-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.tag-pill {
  background: var(--wood-walnut);
  border: 1px solid var(--glass-border);
  color: var(--text-muted);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-size: var(--text-body);
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.tag-pill:hover { border-color: var(--accent-amber); color: var(--text-primary); }
.tag-pill.active {
  background: var(--accent-amber);
  color: white;
  border-color: var(--accent-amber);
  box-shadow: 0 4px 12px var(--accent-glow);
}

.textarea-wrapper { position: relative; }

.review-input {
  width: 100%;
  height: 160px;
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  font-size: var(--text-body-lg);
  color: var(--text-primary);
  outline: none;
  resize: none;
  font-family: inherit;
  background-color: var(--wood-walnut);
  transition: all 0.3s;
}

.review-input:focus {
  border-color: var(--accent-amber);
  background: var(--wood-polished);
}

.char-count {
  position: absolute;
  bottom: 20px;
  right: 24px;
  font-size: var(--text-caption);
  font-weight: 800;
  color: var(--text-muted);
  opacity: 0.5;
}

.bottom-action {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: var(--space-6) var(--space-5) var(--space-10);
  background: linear-gradient(to top, var(--wood-deep) 80%, transparent);
  z-index: 10;
  display: flex;
  justify-content: center;
}

.primary-btn {
  width: 100%;
  max-width: 400px;
  background: var(--accent-amber);
  color: white;
  border: none;
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  font-size: var(--text-body-lg);
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  box-shadow: 0 10px 25px var(--accent-glow);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.primary-btn:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
