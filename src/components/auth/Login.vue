<!-------- (Login.vue) ./src/components/Login.vue ------------>
<script setup>
import { ref, onMounted, watch } from 'vue'

const props = defineProps({
  t: {
    type: Function,
    required: true
  }
})

const STORAGE_KEY = 'alfie_login_email'

const showPassword = ref(false)
const email = ref('')
const password = ref('')
const errorMessage = ref('')

onMounted(() => {
  const savedEmail = localStorage.getItem(STORAGE_KEY)
  if (savedEmail) email.value = savedEmail
})

watch(email, (val) => {
  localStorage.setItem(STORAGE_KEY, val)
})

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
  <div class="auth-page">
    <button class="back-btn" @click="$emit('go-back')">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
    </button>
    
    <div class="logo-container">
      <img src="../../assets/logo.png" alt="Alfie Logo" class="logo-img" />
    </div>

    <h1 class="page-title">{{ t('welcome') }}<br>{{ t('theTribe') }}</h1>
    
    <div class="form-container">
      <!-- Email Login -->
      <div class="input-group">
        <label>{{ t('emailAddress') }}</label>
        <input type="email" v-model="email" placeholder="johncharles@gmail.com" />
      </div>

      <div class="input-group">
        <label>{{ t('password') }}</label>
        <input :type="showPassword ? 'text' : 'password'" v-model="password" :placeholder="t('passwordPlaceholder')" />
        <button class="eye-btn" @click="showPassword = !showPassword">
          <svg v-if="!showPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A0A0A0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/><path d="m3 3 18 18"/></svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A0A0A0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
      </div>

      <div class="forgot-link">
        <a href="#" @click.prevent="$emit('go-forgot')">{{ t('forgotPassword') }}</a>
      </div>

      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

      <button class="primary-btn" @click="handleLogin">{{ t('login') }}</button>

      <!-- Divider
      <div class="divider">
        <span>{{ t('or') }}</span>
      </div> -->

      <!-- Google Login
      <button class="google-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        {{ t('continueWithGoogle') }}
      </button> -->

      <div class="bottom-text">
        <span>{{ t('newToHeritage') }} </span>
        <a href="#" class="link" @click.prevent="$emit('go-signup')">{{ t('joinUs') }}</a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.eye-btn { position: absolute; right: 16px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; padding: 0; display: flex; z-index: 5; }
.error-message { color: #E53935; font-size: 13px; font-weight: 500; margin: 8px 0; }
.forgot-link { text-align: right; margin-top: -8px; }
.forgot-link a { color: var(--primary-green); font-size: 13px; text-decoration: none; font-weight: 500; }
.divider { display: flex; align-items: center; text-align: center; margin: 8px 0; color: var(--text-light); font-size: 14px; }
.divider::before, .divider::after { content: ''; flex: 1; border-bottom: 1px solid var(--border-light); }
.divider span { padding: 0 16px; }
.google-btn { background: white; border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 16px; font-size: 16px; font-weight: 600; color: var(--text-main); display: flex; align-items: center; justify-content: center; gap: 12px; cursor: pointer; transition: background 0.2s; }
.google-btn:hover { background: var(--bg-input); }
.bottom-text { text-align: center; font-size: 14px; color: var(--text-muted); margin-top: 16px; }
.bottom-text .link { color: var(--primary-green); text-decoration: none; font-weight: 600; }
</style>