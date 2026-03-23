<!-------- (ResetPassword.vue) ./src/components/ResetPassword.vue ------------>
<script setup>
import { ref } from 'vue'

const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

defineEmits(['go-back', 'submit'])
</script>

<template>
  <div class="auth-page">
    <div class="header-row">
      <button class="back-btn" @click="$emit('go-back')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <h1 class="title">Reset password</h1>
    </div>
    
    <p class="subtitle">Create your new password to log in</p>
    
    <div class="form-container">
      <div class="input-group">
        <label>New password</label>
        <input :type="showNewPassword ? 'text' : 'password'" placeholder="New password" />
        <button class="eye-btn" @click="showNewPassword = !showNewPassword">
          <svg v-if="!showNewPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A0A0A0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><path d="m3 3 18 18"/></svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A0A0A0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
      </div>

      <div class="input-group">
        <label>Confirm password</label>
        <input :type="showConfirmPassword ? 'text' : 'password'" placeholder="Confirm password" />
        <button class="eye-btn" @click="showConfirmPassword = !showConfirmPassword">
          <svg v-if="!showConfirmPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A0A0A0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><path d="m3 3 18 18"/></svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A0A0A0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
      </div>

      <button class="primary-btn" @click="$emit('submit')">Reset password</button>
    </div>
  </div>
</template>

<style scoped>
.auth-page { padding: 24px 20px; font-family: 'Inter', sans-serif; background: var(--bg-white); min-height: 100vh; margin: 0 auto; }
.header-row { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
.title { font-size: 22px; font-weight: 600; color: var(--secondary-brown); margin: 0; }
.subtitle { color: var(--text-muted); font-size: 14px; line-height: 1.5; margin-bottom: 32px; }
.form-container { display: flex; flex-direction: column; gap: 24px; }
.input-group { position: relative; display: flex; flex-direction: column; }
.input-group label { position: absolute; top: -8px; left: 12px; background: white; padding: 0 4px; font-size: 11px; color: #A0A0A0; z-index: 1; }
.input-group input { border: 1px solid #E5E5E5; border-radius: 12px; padding: 16px; font-size: 15px; color: #333; outline: none; }
.eye-btn { position: absolute; right: 16px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; padding: 0; display: flex; }
.primary-btn { background: #5D8374; color: white; border: none; border-radius: 12px; padding: 16px; font-size: 16px; font-weight: 600; cursor: pointer; margin-top: 8px;}
</style>