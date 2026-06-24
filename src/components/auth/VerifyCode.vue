<!-------- (VerifyCode.vue) ./src/components/VerifyCode.vue ------------>
<script setup>
import { ref, onMounted } from 'vue'
const pins = ref(['', '', '', '', '', ''])
const errorMessage = ref('')

const emit = defineEmits(['go-back', 'submit'])

const onInput = (index, event) => {
  const val = event.target.value
  // Only allow numbers
  if (!/^\d*$/.test(val)) {
    pins.value[index] = ''
    return
  }
  
  if (val && index < 5) {
    const nextEl = document.getElementById(`pin-${index + 1}`)
    if (nextEl) nextEl.focus()
  }
}

const onKeyDown = (index, event) => {
  if (event.key === 'Backspace' && !pins.value[index] && index > 0) {
    const prevEl = document.getElementById(`pin-${index - 1}`)
    if (prevEl) {
      prevEl.focus()
      // Optional: clear previous field on backspace if currently empty
      // pins.value[index - 1] = '' 
    }
  }
}

const onPaste = (event) => {
  event.preventDefault()
  const pastedData = event.clipboardData.getData('text').trim().slice(0, 6).split('')
  pastedData.forEach((char, i) => {
    if (i < 6 && /^\d$/.test(char)) {
      pins.value[i] = char
    }
  })
  // Focus last filled or next empty
  const lastIdx = Math.min(pastedData.length, 5)
  const el = document.getElementById(`pin-${lastIdx}`)
  if (el) el.focus()
}

const handleSubmit = () => {
  const code = pins.value.join('')
  if (code.length < 6) {
    errorMessage.value = 'Please enter the full 6-digit code.'
    return
  }
  errorMessage.value = ''
  emit('submit', code)
}

onMounted(() => {
  const firstEl = document.getElementById('pin-0')
  if (firstEl) firstEl.focus()
})
</script>

<template>
  <div class="auth-page pattern-heritage animate-fade">
    <div class="top-nav">
      <button class="back-btn" @click="$emit('go-back')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>
    </div>

    <div class="welcome-text">
      <h1 class="tribe-title">Verify</h1>
      <h2 class="tribe-highlight">Code</h2>
    </div>
    
    <p class="subtitle">
      The confirmation code was sent via email<br>
      <span class="email-highlight">johnabram@gmail.com</span>
    </p>
    
    <div class="form-container">
      <div class="pin-group-wrapper">
        <label class="pin-group-label">PinCode</label>
        <div class="pin-inputs" @paste="onPaste">
          <input 
            v-for="(pin, index) in pins" 
            :key="index"
            :id="`pin-${index}`"
            v-model="pins[index]"
            type="text" 
            inputmode="numeric"
            maxlength="1" 
            class="pin-box"
            @input="onInput(index, $event)"
            @keydown="onKeyDown(index, $event)"
          />
        </div>
      </div>

      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

      <div class="resend-text">
        <span>Don't get the code? </span>
        <a href="#" class="link">Resend code</a>
      </div>

      <button class="primary-btn" @click="handleSubmit">Verify now</button>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  padding: var(--space-10) var(--space-6);
  max-width: 500px;
  margin: 0 auto;
  position: relative;
  overflow-x: hidden;
}

.top-nav {
  margin-bottom: var(--space-10);
}

.welcome-text {
  text-align: center;
  margin-bottom: var(--space-6);
}

.tribe-title {
  font-size: var(--text-h1);
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 4px;
  margin-bottom: var(--space-2);
}

.tribe-highlight {
  font-size: var(--text-display);
  font-weight: 800;
  background: linear-gradient(to right, var(--text-primary), var(--accent-amber));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 1px;
}

.subtitle {
  color: var(--text-muted);
  font-size: var(--text-body-lg);
  line-height: var(--leading-relaxed);
  text-align: center;
  margin-bottom: var(--space-10);
}

.email-highlight {
  color: var(--accent-amber);
  font-weight: 700;
}

.pin-group-wrapper {
  position: relative;
  border: 2px solid var(--accent-amber);
  border-radius: var(--radius-md);
  padding: var(--space-8) var(--space-4) var(--space-5) var(--space-4);
  margin-top: var(--space-3);
  background: var(--input-bg);
  box-shadow: 0 4px 15px var(--accent-glow);
}

.pin-group-label {
  position: absolute;
  top: -12px;
  left: 20px;
  background: var(--accent-amber);
  color: white;
  padding: var(--space-1) var(--space-3);
  font-size: var(--text-caption);
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-radius: 4px;
}

.pin-inputs {
  display: flex;
  justify-content: space-between;
  gap: var(--space-2);
}

.pin-box {
  width: 100%;
  aspect-ratio: 1;
  max-width: 50px;
  border: 2px solid var(--input-border);
  border-radius: var(--radius-sm);
  background: var(--wood-walnut);
  text-align: center;
  font-size: var(--text-h2);
  font-weight: 800;
  color: var(--text-primary);
  outline: none;
  transition: all 0.3s ease;
}

.pin-box:focus {
  border-color: var(--accent-amber);
  box-shadow: 0 0 10px var(--accent-glow);
  transform: translateY(-2px);
}

.error-message {
  color: #EF4444;
  font-size: var(--text-body);
  font-weight: 600;
  text-align: center;
}

.resend-text {
  text-align: center;
  font-size: var(--text-body);
  color: var(--text-muted);
}

.resend-text .link {
  color: var(--accent-amber);
  text-decoration: none;
  font-weight: 700;
  margin-left: var(--space-1);
}

.resend-text .link:hover {
  text-decoration: underline;
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