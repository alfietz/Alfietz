<!-------- (ResetPassword.vue) ./src/components/ResetPassword.vue ------------>
<script setup>
import { ref } from 'vue'

const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const newPassword = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')

const emit = defineEmits(['go-back', 'submit'])

const handleSubmit = () => {
  if (!newPassword.value || !confirmPassword.value) {
    errorMessage.value = 'Please fill in both fields.'
    return
  }
  if (newPassword.value.length < 6) {
    errorMessage.value = 'Password must be at least 6 characters long.'
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match.'
    return
  }
  errorMessage.value = ''
  emit('submit', newPassword.value)
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
      <h1 class="tribe-title">Reset</h1>
      <h2 class="tribe-highlight">Password</h2>
    </div>
    
    <p class="subtitle">Create your new password to log in</p>
    
    <div class="form-container">
      <div class="input-group">
        <label>New password</label>
        <div class="pass-wrapper">
          <input :type="showNewPassword ? 'text' : 'password'" v-model="newPassword" placeholder="New password" />
          <button class="eye-btn" @click="showNewPassword = !showNewPassword">
            <svg v-if="!showNewPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/><path d="m3 3 18 18"/></svg>
            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
        </div>
      </div>

      <div class="input-group">
        <label>Confirm password</label>
        <div class="pass-wrapper">
          <input :type="showConfirmPassword ? 'text' : 'password'" v-model="confirmPassword" placeholder="Confirm password" />
          <button class="eye-btn" @click="showConfirmPassword = !showConfirmPassword">
            <svg v-if="!showConfirmPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/><path d="m3 3 18 18"/></svg>
            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
        </div>
      </div>

      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

      <button class="primary-btn" @click="handleSubmit">Reset password</button>
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