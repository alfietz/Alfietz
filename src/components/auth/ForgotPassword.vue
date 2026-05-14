<!-------- (ForgotPassword.vue) ./src/components/ForgotPassword.vue ------------>
<script setup>
import { ref } from 'vue'

const email = ref('')
const errorMessage = ref('')

const emit = defineEmits(['go-back', 'submit'])

const handleSubmit = () => {
  if (!email.value) {
    errorMessage.value = 'Please enter your email address.'
    return
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) {
    errorMessage.value = 'Please enter a valid email address.'
    return
  }
  errorMessage.value = ''
  emit('submit', email.value)
}
</script>

<template>
  <div class="auth-page pattern-heritage animate-fade">
    <div class="top-nav">
      <button class="back-btn" @click="$emit('go-back')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>
    </div>

    <div class="welcome-text">
      <h1 class="tribe-title">Forgot</h1>
      <h2 class="tribe-highlight">Password</h2>
    </div>
    
    <p class="subtitle">Type your email, we will send you verification code via email</p>
    
    <div class="form-container">
      <div class="input-group">
        <label>Email address</label>
        <input type="email" v-model="email" placeholder="johncharles@gmail.com" />
      </div>

      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

      <button class="primary-btn" @click="handleSubmit">Continue</button>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  padding: 40px 24px;
  max-width: 500px;
  margin: 0 auto;
  position: relative;
  overflow-x: hidden;
}

.top-nav {
  margin-bottom: 40px;
}

.welcome-text {
  text-align: center;
  margin-bottom: 24px;
}

.tribe-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 4px;
  margin-bottom: 8px;
}

.tribe-highlight {
  font-size: 48px;
  font-weight: 800;
  background: linear-gradient(to right, var(--text-primary), var(--accent-amber));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 1px;
}

.subtitle {
  color: var(--text-muted);
  font-size: 15px;
  line-height: 1.6;
  text-align: center;
  margin-bottom: 40px;
  max-width: 300px;
  margin-left: auto;
  margin-right: auto;
}

.error-message {
  color: #EF4444;
  font-size: 13px;
  font-weight: 600;
  text-align: center;
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
</style>