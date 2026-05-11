<!-------- (WriteReview.vue) ./src/components/WriteReview.vue ------------>
<script setup>
import { ref, computed } from 'vue'

const reviewText = ref('')
const maxChars = 350

const remainingChars = computed(() => maxChars - reviewText.value.length)

defineEmits(['go-back', 'submit'])
</script>

<template>
  <div class="write-review-page">
    <div class="header-row">
      <button class="back-btn" @click="$emit('go-back')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <h1 class="title">Write a review</h1>
    </div>

    <div class="form-container">
      <textarea 
        v-model="reviewText" 
        :maxlength="maxChars"
        placeholder="Would you like write anything about..." 
        class="review-input"
      ></textarea>
      <div class="char-count">
        {{ remainingChars }} Characters remaining
      </div>
    </div>

    <div class="bottom-action">
      <button class="primary-btn" @click="$emit('submit')">Submit review</button>
    </div>
  </div>
</template>

<style scoped>
.write-review-page {
  background: var(--wood-deep);
  min-height: 100vh;
  font-family: 'Inter', -apple-system, sans-serif;
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
  background: var(--wood-polished);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-primary);
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
}

.review-input:focus {
  border-color: var(--text-amber);
}

.review-input::placeholder {
  color: var(--text-muted);
}

.char-count {
  text-align: right;
  font-size: 11px;
  color: var(--text-amber); /* App green color from design */
  margin-top: 8px;
}

.bottom-action {
  padding-top: 24px;
  padding-bottom: 24px;
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
}
</style>