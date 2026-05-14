<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import { db } from '../../db/client'
import { useRoute } from 'vue-router'

const props = defineProps({
  userData: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['go-back'])
const route = useRoute()

const otherUser = ref(null)
const messages = ref([])
const newMessage = ref('')
const loading = ref(true)
const messagesContainer = ref(null)

const otherUserId = route.params.userId

onMounted(async () => {
  await fetchUserDetails()
  await fetchMessages()
  scrollToBottom()
  
  // Mark as read
  await markAsRead()
})

const fetchUserDetails = async () => {
  try {
    const res = await db.execute({
      sql: "SELECT * FROM users WHERE id = ?",
      args: [otherUserId]
    })
    if (res.rows.length > 0) {
      otherUser.value = res.rows[0]
    }
  } catch (e) {
    console.error("Error fetching user details:", e)
  }
}

const fetchMessages = async () => {
  try {
    loading.value = true
    const res = await db.execute({
      sql: `
        SELECT * FROM messages 
        WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
        ORDER BY created_at ASC
      `,
      args: [props.userData.id, otherUserId, otherUserId, props.userData.id]
    })
    messages.value = res.rows
  } catch (e) {
    console.error("Error fetching messages:", e)
  } finally {
    loading.value = false
  }
}

const sendMessage = async () => {
  if (!newMessage.value.trim()) return
  
  const content = newMessage.value.trim()
  newMessage.value = ''
  
  try {
    await db.execute({
      sql: "INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)",
      args: [props.userData.id, otherUserId, content]
    })
    
    // Add to local list for immediate feedback
    messages.value.push({
      id: Date.now(),
      sender_id: props.userData.id,
      receiver_id: otherUserId,
      content: content,
      created_at: new Date().toISOString()
    })
    
    await nextTick()
    scrollToBottom()
  } catch (e) {
    console.error("Error sending message:", e)
  }
}

const markAsRead = async () => {
  try {
    await db.execute({
      sql: "UPDATE messages SET is_read = 1 WHERE sender_id = ? AND receiver_id = ?",
      args: [otherUserId, props.userData.id]
    })
  } catch (e) {
    console.error("Error marking as read:", e)
  }
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

watch(messages, () => {
  nextTick(() => scrollToBottom())
}, { deep: true })
</script>

<template>
  <div class="chat-detail-page">
    <div class="chat-header">
      <button class="back-btn" @click="$emit('go-back')">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <div v-if="otherUser" class="user-info">
        <img :src="otherUser.avatar || 'https://i.pravatar.cc/150'" alt="Avatar" class="header-avatar" />
        <div class="header-text">
          <h2 class="header-name">{{ otherUser.first_name }} {{ otherUser.last_name }}</h2>
          <span class="online-status">Online</span>
        </div>
      </div>
    </div>

    <div class="messages-container" ref="messagesContainer">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
      </div>
      <div v-else-if="messages.length === 0" class="empty-chat">
        <div class="heritage-icon">🏺</div>
        <p>Start a new conversation with this artisan.</p>
      </div>
      <div v-else class="messages-list">
        <div 
          v-for="msg in messages" 
          :key="msg.id" 
          class="message-wrapper"
          :class="{ 'sent': msg.sender_id === props.userData.id, 'received': msg.sender_id !== props.userData.id }"
        >
          <div class="message-bubble">
            <p class="message-content">{{ msg.content }}</p>
            <span class="message-time">
              {{ new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="chat-input-area">
      <div class="input-wrapper">
        <textarea 
          v-model="newMessage" 
          placeholder="Type your message..." 
          @keydown.enter.prevent="sendMessage"
          rows="1"
        ></textarea>
        <button class="send-btn" @click="sendMessage" :disabled="!newMessage.trim()">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-detail-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--wood-deep);
}

.chat-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: var(--wood-walnut);
  border-bottom: 1px solid var(--glass-border);
  z-index: 10;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid var(--glass-border);
}

.header-text {
  display: flex;
  flex-direction: column;
}

.header-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.online-status {
  font-size: 11px;
  color: #10B981;
  font-weight: 600;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.empty-chat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
}

.heritage-icon { font-size: 40px; margin-bottom: 16px; }

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-wrapper {
  display: flex;
  width: 100%;
}

.message-wrapper.sent { justify-content: flex-end; }
.message-wrapper.received { justify-content: flex-start; }

.message-bubble {
  max-width: 75%;
  padding: 12px 16px;
  border-radius: 20px;
  position: relative;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.sent .message-bubble {
  background: var(--accent-amber);
  color: white;
  border-bottom-right-radius: 4px;
}

.received .message-bubble {
  background: var(--wood-walnut);
  color: var(--text-primary);
  border-bottom-left-radius: 4px;
  border: 1px solid var(--glass-border);
}

.message-content {
  margin: 0;
  font-size: 15px;
  line-height: 1.4;
}

.message-time {
  font-size: 10px;
  opacity: 0.7;
  display: block;
  text-align: right;
  margin-top: 4px;
}

.chat-input-area {
  padding: 20px;
  background: var(--wood-walnut);
  border-top: 1px solid var(--glass-border);
}

.input-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  background: var(--wood-deep);
  border: 1px solid var(--glass-border);
  border-radius: 24px;
  padding: 8px 16px;
}

.input-wrapper textarea {
  flex: 1;
  background: transparent;
  border: none;
  color: white;
  padding: 8px 0;
  font-size: 15px;
  outline: none;
  resize: none;
  max-height: 120px;
}

.send-btn {
  background: none;
  border: none;
  color: var(--accent-amber);
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.send-btn:disabled {
  color: var(--text-muted);
  cursor: not-allowed;
}

.send-btn:not(:disabled):hover {
  transform: scale(1.1);
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
