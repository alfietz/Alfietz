<!-------- (Feedback.vue) ./src/components/Feedback.vue ------------>
<script setup>
import { ref } from 'vue'

const feedbackText = ref('')
defineEmits(['go-back', 'submit'])
</script>

<template>
  <div class="feedback-page">
    <div class="header-row">
      <button class="back-btn" @click="$emit('go-back')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <h1 class="title">Feedback</h1>
    </div>

    <div class="form-container">
      <textarea 
        v-model="feedbackText" 
        placeholder="Write your feedback..." 
        class="feedback-input"
      ></textarea>
    </div>

    <div class="bottom-action">
      <button class="primary-btn" @click="$emit('submit', feedbackText)">Submit</button>
    </div>
  </div>
</template>

<style scoped>
.feedback-page {
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
  flex: 1;
}

.feedback-input {
  width: 100%;
  height: 200px;
  border: 1px solid var(--border-light);
  border-radius: 12px;
  padding: 16px;
  font-size: 15px;
  color: var(--text-main);
  background: transparent;
  outline: none;
  resize: none;
  font-family: inherit;
}

.feedback-input:focus {
  border-color: var(--primary-green);
}

.feedback-input::placeholder {
  color: var(--text-muted);
}

.bottom-action {
  padding-top: 24px;
  padding-bottom: 24px;
}

.primary-btn {
  width: 100%;
  background: #5D8374;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 16px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}
</style>