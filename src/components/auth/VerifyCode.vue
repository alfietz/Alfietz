<!-------- (VerifyCode.vue) ./src/components/VerifyCode.vue ------------>
<script setup>
import { ref } from 'vue'
const pins = ref(['', '', '', ''])

defineEmits(['go-back', 'submit'])

// Simple auto-focus to next input
const handleInput = (index, event) => {
  if (event.target.value && index < 3) {
    document.getElementById(`pin-${index + 1}`).focus()
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="header-row">
      <button class="back-btn" @click="$emit('go-back')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <h1 class="title">Verify code</h1>
    </div>
    
    <p class="subtitle">
      The confirmation code was sent via email<br>
      <span class="email-highlight">johnabram@gmail.com</span>
    </p>
    
    <div class="form-container">
      <!-- Unique PinCode wrapper from design -->
      <div class="pin-group-wrapper">
        <label class="pin-group-label">PinCode</label>
        <div class="pin-inputs">
          <input 
            v-for="(pin, index) in pins" 
            :key="index"
            :id="`pin-${index}`"
            v-model="pins[index]"
            type="text" 
            maxlength="1" 
            class="pin-box"
            @input="handleInput(index, $event)"
          />
        </div>
      </div>

      <div class="resend-text">
        <span>Don't get the code? </span>
        <a href="#" class="link">Resend code</a>
      </div>

      <button class="primary-btn" @click="$emit('submit')">Verify now</button>
    </div>
  </div>
</template>

<style scoped>
.auth-page { padding: 24px 20px; font-family: 'Inter', sans-serif; background: var(--bg-white); min-height: 100vh; margin: 0 auto; }
.header-row { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
.title { font-size: 22px; font-weight: 600; color: var(--secondary-brown); margin: 0; }
.subtitle { color: var(--text-muted); font-size: 14px; line-height: 1.5; margin-bottom: 32px; }
.email-highlight { color: #5D8374; font-weight: 500; }
.form-container { display: flex; flex-direction: column; gap: 24px; }

/* Special PinCode Border logic */
.pin-group-wrapper {
  position: relative;
  border: 1px solid #E48F6D; /* Orange border from design */
  border-radius: 8px;
  padding: 24px 16px 16px 16px;
  margin-top: 10px;
}
.pin-group-label {
  position: absolute;
  top: -12px;
  left: -1px;
  background: #E48F6D; /* Orange badge */
  color: white;
  padding: 4px 8px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 4px;
}
.pin-inputs {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}
.pin-box {
  width: 100%;
  aspect-ratio: 1;
  max-width: 60px;
  border: 1px solid #E5E5E5;
  border-radius: 12px;
  text-align: center;
  font-size: 24px;
  font-weight: 600;
  color: #333;
  outline: none;
}
.pin-box:focus { border-color: #5D8374; }

.resend-text { text-align: center; font-size: 13px; color: #666; margin-top: -8px; }
.resend-text .link { color: #5D8374; text-decoration: none; font-weight: 500; }
.primary-btn { background: #5D8374; color: white; border: none; border-radius: 12px; padding: 16px; font-size: 16px; font-weight: 600; cursor: pointer; }
</style>