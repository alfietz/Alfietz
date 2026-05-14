<!-------- (Login.vue) ./src/components/Login.vue ------------>
<script setup>
import { ref, onMounted, watch } from 'vue'

const props = defineProps({
  t: {
    type: Function,
    required: true
  }
})

const showPassword = ref(false)
const email = ref('')
const password = ref('')
const errorMessage = ref('')

const emit = defineEmits(['go-back', 'go-signup', 'go-forgot', 'login'])

const validateForm = () => {
  if (!email.value || !password.value) {
    errorMessage.value = 'Please enter both email and password.'
    return false
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) {
    errorMessage.value = 'Please enter a valid email address.'
    return false
  }
  errorMessage.value = ''
  return true
}

const handleLogin = () => {
  if (!validateForm()) return
  emit('login', { email: email.value, password: password.value })
}
</script>

<template>
  <div class="auth-page pattern-heritage animate-fade">
    <div class="top-nav">
      <button class="back-btn" @click="$emit('go-back')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>
    </div>

    <div class="logo-hero">
      <div class="logo-circle-large">
        <img src="../../assets/logo.png" alt="Alfie Logo" class="logo-img" />
        <div class="logo-glow"></div>
      </div>
    </div>

    <div class="welcome-text">
      <h1 class="tribe-title">{{ t('welcome') }}</h1>
      <h2 class="tribe-highlight">{{ t('theTribe') }}</h2>
    </div>

    <div class="form-container">
      <!-- Email Login -->
      <div class="input-group">
        <label>{{ t('emailAddress') }}</label>
        <input type="email" v-model="email" placeholder="johncharles@gmail.com" />
      </div>

      <div class="input-group">
        <label>{{ t('password') }}</label>
        <div class="pass-wrapper">
          <input :type="showPassword ? 'text' : 'password'" v-model="password" :placeholder="t('passwordPlaceholder')" />
          <button class="eye-btn" @click="showPassword = !showPassword">
            <svg v-if="!showPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/><path d="m3 3 18 18"/></svg>
            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
        </div>
      </div>

      <div class="forgot-link">
        <a href="#" @click.prevent="$emit('go-forgot')">{{ t('forgotPassword') }}</a>
      </div>

      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

      <button class="primary-btn" @click="handleLogin">{{ t('login') }}</button>

      <div class="bottom-text">
        <span>{{ t('newToHeritage') }} </span>
        <a href="#" class="join-link" @click.prevent="$emit('go-signup')">{{ t('joinUs') }}</a>
      </div>
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

.logo-hero {
  display: flex;
  justify-content: center;
  margin-bottom: 32px;
}

.logo-circle-large {
  position: relative;
  width: 100px;
  height: 100px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  border: 4px solid var(--accent-amber);
}

.logo-glow {
  position: absolute;
  inset: -10px;
  background: radial-gradient(circle, var(--accent-glow) 0%, transparent 70%);
  opacity: 0.3;
}

.welcome-text {
  text-align: center;
  margin-bottom: 40px;
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

.pass-wrapper {
  position: relative;
  width: 100%;
}

.eye-btn {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  transition: color 0.3s;
}

.eye-btn:hover {
  color: var(--accent-amber);
}

.error-message {
  color: #EF4444;
  font-size: 13px;
  font-weight: 600;
  text-align: center;
}

.forgot-link {
  text-align: right;
  margin-top: -8px;
}

.forgot-link a {
  color: var(--text-muted);
  font-size: 13px;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
}

.forgot-link a:hover {
  color: var(--accent-amber);
}

.bottom-text {
  text-align: center;
  font-size: 14px;
  color: var(--text-muted);
  margin-top: 24px;
}

.join-link {
  color: var(--text-amber);
  text-decoration: none;
  font-weight: 700;
  margin-left: 4px;
  border-bottom: 1px solid transparent;
  transition: all 0.3s;
}

.join-link:hover {
  border-color: var(--accent-amber);
  text-shadow: 0 0 10px var(--accent-glow);
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