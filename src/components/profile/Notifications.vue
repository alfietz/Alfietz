<!-------- (Notifications.vue) ./src/components/Notifications.vue ------------>
<script setup>
// Define props so the parent component can pass dynamic notification data
const props = defineProps({
  notifications: {
    type: Array,
    required: true,
    default: () => []
  }
})

// Define emits so we can tell the parent when the back button is clicked
defineEmits(['go-back'])

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)

  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  return date.toLocaleDateString()
}
const getEmoji = (message) => {
  const msg = message.toLowerCase()
  if (msg.includes('order')) return '📦'
  if (msg.includes('negotiation') || msg.includes('offer')) return '💰'
  if (msg.includes('message') || msg.includes('whisper') || msg.includes('chat')) return '💬'
  if (msg.includes('review')) return '✨'
  if (msg.includes('shipped') || msg.includes('delivery')) return '🚚'
  if (msg.includes('kente') || msg.includes('ankara')) return '🧵'
  return '🔔'
}
</script>

<template>
  <div class="notifications-page">
    <!-- Header with Back Button -->
    <header class="header">
      <!-- Emit 'go-back' event when clicked -->
      <button class="back-btn" @click="$emit('go-back')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m15 18-6-6 6-6"/>
        </svg>
      </button>
      <h1 class="title">Notifications</h1>
    </header>

    <!-- List of Notifications -->
    <div class="list-container">
      <div 
        v-for="item in notifications" 
        :key="item.id" 
        class="notification-card"
        :class="{ 'is-unread': item.is_unread }"
      >
        <div class="icon-circle">
          <span class="notification-emoji">{{ getEmoji(item.message) }}</span>
        </div>
        <div class="text-content">
          <span class="item-name">{{ item.message }}</span>
          <span class="item-time">{{ formatTime(item.created_at) }}</span>
        </div>
      </div>
      
      <!-- Show a dynamic fallback if the notifications array is empty -->
      <div v-if="notifications.length === 0" class="empty-state">
        You have no new notifications.
      </div>
    </div>
  </div>
</template>

<style scoped>
.notifications-page {
  background-color: var(--wood-deep);
  min-height: 100vh;
  padding: 24px 20px;
}

/* Header Styles */
.header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
}

.title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
}

/* List Styles */
.list-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.notification-card {
  background-color: var(--wood-walnut);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: transform 0.2s, background-color 0.2s;
}

.notification-card:hover {
  transform: translateY(-2px);
  opacity: 0.9;
}

/* Text Content Container */
.text-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* --- Read State (Default) --- */
.icon-circle {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background-color: var(--wood-walnut);
  border: 1px solid var(--glass-border);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 20px;
}

.item-name {
  font-weight: 600;
  font-size: 14px;
  color: var(--text-muted);
}

.item-time {
  font-size: 13px;
  color: var(--text-light);
}

/* --- Unread State Overrides --- */
.is-unread .icon-circle {
  background-color: var(--text-amber);
}

.is-unread .item-name {
  color: var(--text-primary);
}

.is-unread .item-time {
  color: var(--text-muted);
}

/* --- Empty State --- */
.empty-state {
  text-align: center;
  color: var(--text-light);
  padding: 40px 0;
  font-size: 14px;
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