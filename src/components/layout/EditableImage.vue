<script setup>
import { ref } from 'vue'

const props = defineProps({
  src: {
    type: String,
    default: ''
  },
  isEditable: {
    type: Boolean,
    default: false
  },
  aspectRatio: {
    type: String,
    default: '1/1'
  },
  label: {
    type: String,
    default: 'Change Image'
  }
})

const emit = defineEmits(['change'])
const fileInput = ref(null)

const triggerUpload = () => {
  if (props.isEditable) {
    fileInput.value?.click()
  }
}

const handleFile = (e) => {
  const file = e.target.files[0]
  if (file) {
    // In a real app, we'd upload to a server. 
    // Here we'll just create a local preview URL.
    const reader = new FileReader()
    reader.onload = (event) => {
      emit('change', event.target.result)
    }
    reader.readAsDataURL(file)
  }
}
</script>

<template>
  <div 
    class="editable-image-container" 
    :class="{ 'is-editable': isEditable }"
    :style="{ aspectRatio: aspectRatio }"
    @click="triggerUpload"
  >
    <img :src="src" class="display-image" />
    
    <div v-if="isEditable" class="edit-overlay">
      <div class="overlay-content">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
        </svg>
        <span class="overlay-label">{{ label }}</span>
      </div>
    </div>
    
    <input 
      v-if="isEditable"
      ref="fileInput"
      type="file" 
      accept="image/*" 
      class="hidden-input" 
      @change="handleFile"
    />
  </div>
</template>

<style scoped>
.editable-image-container {
  position: relative;
  width: 100%;
  overflow: hidden;
  cursor: default;
  background: var(--wood-deep);
}

.is-editable {
  cursor: pointer;
}

.display-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.edit-overlay {
  position: absolute;
  inset: 0;
  background: rgba(13, 8, 5, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.editable-image-container:hover .edit-overlay {
  opacity: 1;
}

.editable-image-container:hover .display-image {
  transform: scale(1.05);
}

.overlay-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  color: var(--accent-amber);
}

.overlay-label {
  font-size: var(--text-caption);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.hidden-input {
  display: none;
}
</style>