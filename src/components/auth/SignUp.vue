<!-------- (SignUp.vue) ./src/components/SignUp.vue ------------>
<script setup>
import { ref, onMounted, watch } from 'vue'

const props = defineProps({
  t: {
    type: Function,
    required: true
  }
})

const STORAGE_KEY = 'alfie_signup_draft'

const showPassword = ref(false)
const firstName = ref('')
const lastName = ref('')
const username = ref('')
const email = ref('')
const whatsapp = ref('')
const password = ref('')
const userType = ref('buyer')
const errorMessage = ref('')

onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      const data = JSON.parse(saved)
      firstName.value = data.firstName || ''
      lastName.value = data.lastName || ''
      username.value = data.username || ''
      email.value = data.email || ''
      whatsapp.value = data.whatsapp || ''
      userType.value = data.userType || 'buyer'
    } catch (e) {
      console.error('Failed to load signup draft:', e)
    }
  }
})

watch([firstName, lastName, username, email, whatsapp, userType], () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    firstName: firstName.value,
    lastName: lastName.value,
    username: username.value,
    email: email.value,
    whatsapp: whatsapp.value,
    userType: userType.value
  }))
})

const emit = defineEmits(['go-back', 'go-login', 'signup'])

const validateForm = () => {
  if (!username.value || !firstName.value || !lastName.value || !email.value || !password.value) {
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
  errorMessage.value = ''
  return true
}

const handleSignUp = () => {
  if (!validateForm()) return

  // Clear draft on success
  localStorage.removeItem(STORAGE_KEY)

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
  <div class="auth-page">
    <button class="back-btn" @click="$emit('go-back')">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
    </button>
    <div class="logo-container" style="margin-top: 20px;">
      <img src="../../assets/logo.png" alt="Alfie Logo" class="logo-img" />
    </div>
    <h1 class="page-title" style="margin-top: 20px;">{{ t('joinTheHeritage') }}</h1>
    
    <div class="form-container">
      <div class="input-group">
        <label>{{ t('username') }}</label>
        <input type="text" v-model="username" placeholder="@unique_name" />
      </div>

      <div class="input-group">
        <label>{{ t('firstName') }}</label>
        <input type="text" v-model="firstName" placeholder="john" />
      </div>

      <div class="input-group">
        <label>{{ t('lastName') }}</label>
        <input type="text" v-model="lastName" placeholder="charles" />
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
        <label class="group-label">{{ t('userType') }}:</label>
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
        <div style="position: relative; display: flex; align-items: center; width: 100%;">
          <input :type="showPassword ? 'text' : 'password'" v-model="password" :placeholder="t('passwordPlaceholder')" style="padding-right: 48px;" />
          <button class="eye-btn" @click="showPassword = !showPassword">
            <svg v-if="!showPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A0A0A0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><path d="m3 3 18 18"/></svg>
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A0A0A0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
        </div>
      </div>

      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

      <button class="primary-btn" style="margin-top: 12px;" @click="handleSignUp">{{ t('signup') }}</button>

      <div class="bottom-text">
        <span>{{ t('alreadyHaveAccount') }} </span>
        <a href="#" class="link" @click.prevent="$emit('go-login')">{{ t('logIn') }}</a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.eye-btn { position: absolute; right: 16px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; padding: 0; display: flex; z-index: 5; }
.error-message { color: #E53935; font-size: 13px; font-weight: 500; margin: 8px 0; }
.bottom-text { text-align: center; font-size: 14px; color: var(--text-muted); margin-top: 32px; }
.bottom-text .link { color: var(--primary-green); text-decoration: none; font-weight: 600; }

.user-type-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}

.group-label {
  font-size: 13px;
  color: var(--text-muted);
  font-weight: 500;
}

.type-options {
  display: flex;
  gap: 12px;
}

.type-btn {
  flex: 1;
  padding: 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
  background: var(--bg-white);
  color: var(--text-muted);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.type-btn.active {
  background: var(--primary-green);
  color: white;
  border-color: var(--primary-green);
}
</style>