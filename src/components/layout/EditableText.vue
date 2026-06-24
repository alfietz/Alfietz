<script setup>
import { ref, nextTick, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  isEditable: {
    type: Boolean,
    default: false
  },
  multiline: {
    type: Boolean,
    default: false
  },
  placeholder: {
    type: String,
    default: 'Click to edit...'
  },
  tagName: {
    type: String,
    default: 'span'
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const isEditing = ref(false)
const editValue = ref(props.modelValue)
const inputRef = ref(null)

const startEdit = () => {
  if (!props.isEditable) return
  editValue.ref = props.modelValue
  isEditing.value = true
  nextTick(() => {
    inputRef.value?.focus()
  })
}

const saveEdit = () => {
  if (!isEditing.value) return
  isEditing.value = false
  if (editValue.value !== props.modelValue) {
    emit('update:modelValue', editValue.value)
    emit('change', editValue.value)
  }
}

const cancelEdit = () => {
  isEditing.value = false
  editValue.value = props.modelValue
}

watch(() => props.modelValue, (newVal) => {
  editValue.value = newVal
})
</script>

<template>
  <div class="editable-text-container" :class="{ 'is-editable': isEditable, 'is-editing': isEditing }">
    <template v-if="isEditing">
      <textarea
        v-if="multiline"
        ref="inputRef"
        v-model="editValue"
        class="edit-input multiline"
        @blur="saveEdit"
        @keydown.enter.ctrl="saveEdit"
        @keydown.esc="cancelEdit"
        :placeholder="placeholder"
      ></textarea>
      <input
        v-else
        ref="inputRef"
        v-model="editValue"
        class="edit-input"
        @blur="saveEdit"
        @keydown.enter="saveEdit"
        @keydown.esc="cancelEdit"
        :placeholder="placeholder"
      />
    </template>
    <component
      :is="tagName"
      v-else
      class="display-text"
      @click="startEdit"
    >
      <slot v-if="$slots.default"></slot>
      <template v-else>
        {{ modelValue || placeholder }}
      </template>
      
      <!-- Subtle Edit Indicator for Owner -->
      <span v-if="isEditable" class="edit-indicator">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 9.5-9.5z"/>
        </svg>
      </span>
    </component>
  </div>
</template>

<style scoped>
.editable-text-container {
  display: inline-block;
  position: relative;
  width: 100%;
}

.is-editable .display-text {
  cursor: pointer;
  transition: all 0.2s ease;
  padding: var(--space-1) var(--space-1);
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
}

.is-editable .display-text:hover {
  background: rgba(212, 175, 55, 0.05);
  border-color: rgba(212, 175, 55, 0.2);
}

.edit-indicator {
  display: inline-flex;
  margin-left: 8px;
  opacity: 0;
  transition: opacity 0.2s ease;
  color: var(--accent-amber);
}

.is-editable .display-text:hover .edit-indicator {
  opacity: 0.6;
}

.edit-input {
  width: 100%;
  background: var(--wood-walnut);
  border: 1px solid var(--accent-amber);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  padding: var(--space-1) var(--space-2);
  font-family: inherit;
  font-size: inherit;
  font-weight: inherit;
  line-height: inherit;
  outline: none;
  box-shadow: 0 0 10px var(--accent-glow);
}

.edit-input.multiline {
  min-height: 80px;
  resize: vertical;
}

.display-text {
  display: inline-block;
  width: 100%;
  word-break: break-word;
}
</style>