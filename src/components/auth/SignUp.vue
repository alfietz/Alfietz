<!-------- (SignUp.vue) ./src/components/SignUp.vue ------------>
<script setup>
import { ref, onMounted, watch } from 'vue'

const props = defineProps({
  t: {
    type: Function,
    required: true
  }
})

const showPassword = ref(false)
const firstName = ref('')
const lastName = ref('')
const username = ref('')
const email = ref('')
const whatsapp = ref('')
const password = ref('')
const confirmPassword = ref('')
const userType = ref('buyer')
const errorMessage = ref('')

const emit = defineEmits(['go-back', 'go-login', 'signup'])

const validateForm = () => {
  if (!username.value || !firstName.value || !lastName.value || !email.value || !password.value || !confirmPassword.value) {
    errorMessage.value = 'Please fill in all required fields.'
    return false
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) {
    errorMessage.value = 'Please enter a valid email address.'
    return false
  }
  if (password.value.length < 6) {
    errorMessage.value = 'Password must be at least 6 characters long.'
    return false
  }
  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match.'
    return false
  }
  errorMessage.value = ''
  return true
}

const handleSignUp = () => {
  console.log('[SignUp.vue] handleSignUp called');
  if (!validateForm()) {
    console.log('[SignUp.vue] Validation failed:', errorMessage.value);
    return;
  }

  console.log('[SignUp.vue] Emitting signup event');
  emit('signup', {
    firstName: firstName.value,
    lastName: lastName.value,
    username: username.value,
    email: email.value,
    password: password.value,
    whatsapp: whatsapp.value,
    avatar: 'https://i.pravatar.cc/150?u=' + email.value,
    userType: userType.value,
    needs: '',
    gives: ''
  })
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
      <h1 class="tribe-title">Join The</h1>
      <h2 class="tribe-highlight">Heritage</h2>
    </div>

    <div class="form-container">
      <div class="input-row">
        <div class="input-group">
          <label>{{ t('firstName') }}</label>
          <input type="text" v-model="firstName" placeholder="John" />
        </div>
        <div class="input-group">
          <label>{{ t('lastName') }}</label>
          <input type="text" v-model="lastName" placeholder="Charles" />
        </div>
      </div>

      <div class="input-group">
        <label>{{ t('username') }}</label>
        <input type="text" v-model="username" placeholder="@unique_name" />
      </div>

      <div class="input-group">
        <label>{{ t('emailAddress') }}</label>
        <input type="email" v-model="email" placeholder="johncharles@gmail.com" />
      </div>

      <div class="input-group">
        <label>{{ t('whatsapp') }}</label>
        <input type="tel" v-model="whatsapp" placeholder="+255..." />
      </div>

      <div class="user-type-group">
        <label class="group-label">{{ t('userType') }}</label>
        <div class="type-options">
          <button 
            type="button" 
            class="type-btn" 
            :class="{ active: userType === 'buyer' }"
            @click="userType = 'buyer'"
          >
            {{ t('buyer') }}
          </button>
          <button 
            type="button" 
            class="type-btn" 
            :class="{ active: userType === 'supplier' }"
            @click="userType = 'supplier'"
          >
            {{ t('seller') }}
          </button>
        </div>
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

      <div class="input-group">
        <label>{{ t('confirmPassword') }}</label>
        <div class="pass-wrapper">
          <input :type="showPassword ? 'text' : 'password'" v-model="confirmPassword" :placeholder="t('confirmPasswordPlaceholder')" />
        </div>
      </div>

      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

      <button class="primary-btn" @click="handleSignUp">{{ t('signup') }}</button>

      <div class="bottom-text">
        <span>{{ t('alreadyHaveAccount') }} </span>
        <a href="#" class="login-link" @click.prevent="$emit('go-login')">{{ t('logIn') }}</a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  padding: 40px 24px;
  max-width: 600px;
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

.logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
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

.input-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

@media (max-width: 480px) {
  .input-row {
    grid-template-columns: 1fr;
  }
}

.user-type-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.group-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: var(--text-muted);
  margin-left: 4px;
}

.type-options {
  display: flex;
  gap: 12px;
}

.type-btn {
  flex: 1;
  padding: 16px;
  border-radius: var(--radius-md);
  border: 2px solid var(--input-border);
  background: var(--input-bg);
  color: var(--text-muted);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.type-btn.active {
  background: linear-gradient(135deg, var(--accent-amber), #B45309);
  color: white;
  border-color: var(--accent-amber);
  box-shadow: 0 4px 15px var(--accent-glow);
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
}

.error-message {
  color: #EF4444;
  font-size: 13px;
  font-weight: 600;
  text-align: center;
}

.bottom-text {
  text-align: center;
  font-size: 14px;
  color: var(--text-muted);
  margin-top: 24px;
}

.login-link {
  color: var(--text-amber);
  text-decoration: none;
  font-weight: 700;
  margin-left: 4px;
  border-bottom: 1px solid transparent;
  transition: all 0.3s;
}

.login-link:hover {
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