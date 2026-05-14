<!-------- (WriteReview.vue) ./src/components/WriteReview.vue ------------>
<script setup>
import { ref, computed } from 'vue'

const reviewText = ref('')
const rating = ref(5)
const maxChars = 350

const remainingChars = computed(() => maxChars - reviewText.value.length)

defineEmits(['go-back', 'submit'])
</script>

<template>
  <div class="write-review-page">
    <div class="header-row">
      <button class="back-btn tap-active" @click="$emit('go-back')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <h1 class="title">Write a review</h1>
    </div>

    <div class="form-container">
      <div class="rating-selection">
        <p class="rating-label">Rate your experience</p>
        <div class="stars">
          <button 
            v-for="star in 5" 
            :key="star" 
            class="star-btn"
            :class="{ active: star <= rating }"
            @click="rating = star"
          >
            <svg width="32" height="32" viewBox="0 0 24 24" :fill="star <= rating ? 'var(--accent-amber)' : 'none'" stroke="var(--accent-amber)" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          </button>
        </div>
      </div>

      <textarea 
        v-model="reviewText" 
        :maxlength="maxChars"
        placeholder="Share your thoughts about this heritage piece..." 
        class="review-input"
      ></textarea>
      <div class="char-count">
        {{ remainingChars }} Characters remaining
      </div>
    </div>

    <div class="bottom-action">
      <button class="primary-btn" @click="$emit('submit', { rating, text: reviewText })">Submit review</button>
    </div>
  </div>
</template>

<style scoped>
.write-review-page {
  background-color: var(--wood-deep);
  min-height: 100vh;
  padding: 24px 20px;
  max-width: 1200px;
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

.back-btn {
  background-color: var(--wood-walnut);
  border: 1px solid var(--glass-border);
  border-radius: 50%;
  width: 40px;
  height: 40px;
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
  font-size: 22px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.form-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.rating-selection {
  margin-bottom: 24px;
  text-align: center;
}

.rating-label {
  font-size: 14px;
  color: var(--text-muted);
  margin-bottom: 12px;
}

.stars {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.star-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  transition: transform 0.2s;
}

.star-btn:hover {
  transform: scale(1.2);
}

.review-input {
  width: 100%;
  height: 180px;
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  padding: 16px;
  font-size: 15px;
  color: var(--text-primary);
  outline: none;
  resize: none;
  font-family: inherit;
  box-sizing: border-box;
  background-color: var(--wood-walnut);
}

.review-input:focus {
  border-color: var(--accent-amber);
}

.review-input::placeholder {
  color: var(--input-placeholder);
}

.char-count {
  text-align: right;
  font-size: 11px;
  color: var(--text-amber);
  margin-top: 8px;
}

.bottom-action {
  padding: 24px 0;
}

.primary-btn {
  width: 100%;
  background: var(--accent-amber);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 16px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.primary-btn:active {
  transform: scale(0.98);
}
</style>
