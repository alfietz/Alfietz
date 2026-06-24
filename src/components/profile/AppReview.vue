<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  t: {
    type: Function,
    required: true
  }
})

const emit = defineEmits(['go-back', 'submit-app-experience'])

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
  emit('submit-app-experience', {
    rating: rating.value,
    text: reviewText.value,
    image: imageBase64.value
  })
}
</script>

<template>
  <div class="app-review-page animate-fade">
    <div class="header-row">
      <button class="back-btn tap-active" @click="$emit('go-back')">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <h1 class="title">{{ t('appExperience') }}</h1>
    </div>

    <div class="form-container">
      <div class="rating-section-card">
        <p class="section-label">{{ t('howIsJourney') }}</p>
        <div class="stars-row">
          <button 
            v-for="star in 5" 
            :key="star" 
            class="star-btn-large"
            :class="{ active: star <= rating, 'pulse': star === rating }"
            @click="rating = star"
          >
            <svg width="44" height="44" viewBox="0 0 24 24" :fill="star <= rating ? 'var(--accent-amber)' : 'none'" :stroke="star <= rating ? 'var(--accent-amber)' : 'rgba(255,255,255,0.15)'" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </button>
        </div>
        <p class="rating-status-text">
          {{ [t('rating1'), t('rating2'), t('rating3'), t('rating4'), t('rating5')][rating - 1] }}
        </p>
      </div>

      <div class="input-group-modern">
        <label class="group-label">{{ t('feedbackLabel') }}</label>
        <div class="textarea-container">
          <textarea 
            v-model="reviewText" 
            :maxlength="maxChars"
            :placeholder="t('feedbackPlaceholder')" 
            class="review-textarea-modern"
          ></textarea>
          <div class="char-counter" :class="{ 'limit': remainingChars < 30 }">
            {{ remainingChars }}
          </div>
        </div>
      </div>

      <div class="image-upload-modern">
        <label class="group-label">{{ t('referenceImage') }}</label>
        <div v-if="!imagePreview" class="upload-zone" @click="$refs.fileInput.click()">
          <div class="upload-icon-circle">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          </div>
          <div class="upload-text">
            <span class="main-text">{{ t('clickToUpload') }}</span>
            <span class="sub-text">{{ t('pngJpgSize') }}</span>
          </div>
          <input type="file" ref="fileInput" hidden accept="image/*" @change="handleImageUpload" />
        </div>
        <div v-else class="preview-container-modern">
          <img :src="imagePreview" class="preview-img-modern" />
          <button class="remove-btn-overlay" @click="removeImage">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>
    </div>

    <div class="bottom-action-fixed">
      <button 
        class="submit-btn-modern" 
        :disabled="!reviewText.trim()"
        @click="handleSubmit"
      >
        <span>{{ t('submitExperience') }}</span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.app-review-page {
  background: var(--wood-deep);
  min-height: 100vh;
  padding: var(--space-6) var(--space-5) var(--space-12);
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
}

.header-row {
  display: flex;
  align-items: center;
  gap: var(--space-4);
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
  color: var(--text-amber);
  margin: 0;
  letter-spacing: -0.5px;
}

.form-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.rating-section-card {
  background: var(--wood-walnut);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: var(--space-8);
  text-align: center;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.section-label {
  display: block;
  font-size: var(--text-body-lg);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--space-6);
}

.stars-row {
  display: flex;
  justify-content: center;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.star-btn-large {
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--space-1);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.star-btn-large:hover {
  transform: scale(1.2);
}

.star-btn-large.active svg {
  filter: drop-shadow(0 0 10px var(--accent-glow));
}

.star-btn-large.pulse {
  animation: starPulse 0.5s ease;
}

@keyframes starPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}

.rating-status-text {
  font-size: var(--text-body);
  font-weight: 700;
  color: var(--accent-amber);
  margin: 0;
  min-height: 20px;
}

.input-group-modern {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.group-label {
  font-size: var(--text-body);
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 1.5px;
  padding-left: var(--space-1);
}

.textarea-container {
  position: relative;
}

.review-textarea-modern {
  width: 100%;
  min-height: 180px;
  background: var(--wood-walnut);
  border: 2px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  color: white;
  font-size: var(--text-body-lg);
  outline: none;
  resize: none;
  font-family: inherit;
  transition: all 0.3s;
}

.review-textarea-modern:focus {
  border-color: var(--accent-amber);
  box-shadow: 0 0 20px rgba(217, 164, 4, 0.1);
}

.char-counter {
  position: absolute;
  bottom: 16px;
  right: 20px;
  font-size: var(--text-caption);
  font-weight: 700;
  color: var(--text-muted);
  background: rgba(0,0,0,0.3);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
}

.char-counter.limit {
  color: #EF4444;
}

.upload-zone {
  width: 100%;
  height: 140px;
  background: var(--wood-walnut);
  border: 2px dashed var(--glass-border);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  padding: 0 var(--space-6);
  gap: var(--space-5);
  cursor: pointer;
  transition: all 0.3s;
}

.upload-zone:hover {
  border-color: var(--accent-amber);
  background: rgba(255,255,255,0.02);
}

.upload-icon-circle {
  width: 52px;
  height: 52px;
  background: rgba(217, 164, 4, 0.1);
  color: var(--accent-amber);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-text {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.main-text {
  font-size: var(--text-body-lg);
  font-weight: 700;
  color: var(--text-primary);
}

.sub-text {
  font-size: var(--text-caption);
  color: var(--text-muted);
}

.preview-container-modern {
  position: relative;
  width: 100%;
  height: 240px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 2px solid var(--accent-amber);
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

.preview-img-modern {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-btn-overlay {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(10px);
  color: white;
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.remove-btn-overlay:hover {
  background: #EF4444;
  border-color: #EF4444;
}

.bottom-action-fixed {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: var(--space-6) var(--space-5) var(--space-10);
  background: linear-gradient(to top, var(--wood-deep) 80%, transparent);
  z-index: 100;
  display: flex;
  justify-content: center;
}

.submit-btn-modern {
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

.submit-btn-modern:hover:not(:disabled) {
  transform: translateY(-4px);
  box-shadow: 0 15px 30px var(--accent-glow);
}

.submit-btn-modern:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.submit-btn-modern:active:not(:disabled) {
  transform: scale(0.95);
}
</style>
