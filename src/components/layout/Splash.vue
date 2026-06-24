<!-------- (Splash.vue) ./src/components/Splash.vue ------------>
<script setup>
import { onMounted, ref } from 'vue'

const props = defineProps({
  language: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['loaded', 'select-language'])
const showButtons = ref(false)

onMounted(() => {
  // Wait 1.5s for logo animation, then show buttons if language is not set
  setTimeout(() => {
    if (!props.language) {
      showButtons.value = true
    } else {
      // If language is already set, wait another 1.5s and proceed
      setTimeout(() => {
        emit('loaded')
      }, 1500)
    }
  }, 1500)
})

const selectLang = (lang) => {
  emit('select-language', lang)
  emit('loaded')
}
</script>

<template>
  <div class="splash-page">
    <div class="brand-container">
      
      <!-- User Logo -->
      <div class="logo-container splash-logo">
        <img src="../../assets/logo.png" alt="Tribe Design Logo" class="logo-img" />
      </div>

      <div class="tagline-container" v-if="!showButtons">
        <p class="tagline">Heritage in every stitch. Elegance in every trend.</p>
      </div>

      <div class="language-selection" v-else>
        <p class="select-text">Select Language / Chagua Lugha</p>
        <div class="lang-btns">
          <button @click="selectLang('en')" class="lang-btn en">English</button>
          <button @click="selectLang('sw')" class="lang-btn sw">Kiswahili</button>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.splash-page {
  background-color: var(--wood-deep); 
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.brand-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  animation: fadeIn 1s ease-in-out;
}

.logo-container.splash-logo {
  width: 160px;
  height: 160px;
  padding: var(--space-7);
  margin-bottom: var(--space-4);
  border: 4px solid var(--wood-walnut);
}

.tagline-container {
  text-align: center;
}

.tagline {
  color: var(--text-amber);
  font-size: var(--text-body-lg);
  font-weight: 500;
  margin: 0;
  font-style: italic;
}

.logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.language-selection {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  animation: slideUp 0.5s ease-out;
}

.select-text {
  color: var(--text-primary);
  font-weight: 600;
  font-size: var(--text-body);
}

.lang-btns {
  display: flex;
  gap: var(--space-3);
}

.lang-btn {
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-sm);
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid var(--wood-walnut);
  background: transparent;
  color: var(--text-amber);
}

.lang-btn:hover {
  background-color: var(--wood-walnut);
  color: white;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>