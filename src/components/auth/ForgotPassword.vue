<!-------- (ForgotPassword.vue) ./src/components/ForgotPassword.vue ------------>
<script setup>
defineEmits(['go-back', 'submit'])
</script>

<template>
  <div class="auth-page">
    <div class="header-row">
      <button class="back-btn" @click="$emit('go-back')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <h1 class="title">Forgot password</h1>
    </div>
    
    <p class="subtitle">Type your email, we will send you verification code via email</p>
    
    <div class="form-container">
      <div class="input-group">
        <label>Email address</label>
        <input type="email" placeholder="Email address" />
      </div>

      <button class="primary-btn" @click="$emit('submit')">Continue</button>
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
.primary-btn { background: #5D8374; color: white; border: none; border-radius: 12px; padding: 16px; font-size: 16px; font-weight: 600; cursor: pointer; }
</style>