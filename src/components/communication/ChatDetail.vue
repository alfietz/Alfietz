<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import { db } from '../../db/client'
import { useRoute } from 'vue-router'

const props = defineProps({
  userData: {
    type: Object,
    required: true
  },
  t: {
    type: Function,
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

const otherUserId = ref(route.params.userId)

const initChat = async () => {
  try {
    loading.value = true
    await fetchUserDetails()
    await fetchMessages(false, 'initChat') // Don't set loading inside fetchMessages to avoid double spinner
    await markAsRead()
  } catch (e) {
    console.error("Chat Init Error:", e)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await initChat()
})

watch(() => route.params.userId, async (newId) => {
  if (newId && newId !== otherUserId.value) {
    otherUserId.value = newId
    messages.value = []
    await initChat()
  }
})

const fetchUserDetails = async () => {
  try {
    const res = await db.runAction('get_user_by_id', { userId: otherUserId.value });
    if (res.rows && res.rows.length > 0) {
      otherUser.value = res.rows[0]
    }
  } catch (e) {
    console.error("Error fetching user details:", e)
  }
}

const fetchMessages = async (showLoading = false, reason = 'unknown') => {
  console.log(`[ChatDetail] Fetching messages. Reason: ${reason}, showLoading: ${showLoading}`);
  try {
    if (showLoading) loading.value = true
    const res = await db.runAction('get_messages', { 
      userId: props.userData.id, 
      otherId: otherUserId.value 
    });
    
    // Only update if data changed
    if (JSON.stringify(res.rows) !== JSON.stringify(messages.value)) {
      messages.value = res.rows
      await markAsRead()
    }
  } catch (e) {
    console.error("Error fetching messages:", e)
  } finally {
    if (showLoading) loading.value = false
  }
}

const sendMessage = async () => {
  if (!newMessage.value.trim()) return
  
  const content = newMessage.value.trim()
  newMessage.value = ''
  
  try {
    await db.runAction('send_message', { 
      senderId: props.userData.id, 
      receiverId: otherUserId.value, 
      content 
    });
    
    // Refresh the message list after sending
    await fetchMessages(false, 'sendMessage')
    
    await nextTick()
    scrollToBottom()
  } catch (e) {
    console.error("Error sending message:", e)
  }
}

const markAsRead = async () => {
  try {
    await db.runAction('mark_messages_read', { 
      senderId: otherUserId.value, 
      receiverId: props.userData.id 
    });
  } catch (e) {
    console.error("Error marking as read:", e)
  }
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const addEmoji = (emoji) => {
  newMessage.value += emoji
}

watch(messages, () => {
  nextTick(() => scrollToBottom())
}, { deep: true })
</script>

<template>
  <div class="chat-detail-page animate-fade">
    <!-- Header -->
    <div class="chat-header">
      <button class="back-btn tap-active" @click="$emit('go-back')">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      
      <div v-if="otherUser" class="user-info">
        <div class="avatar-wrapper-mini">
          <img :src="otherUser.avatar || 'https://i.pravatar.cc/150'" alt="Avatar" class="header-avatar" />
          <div class="online-indicator"></div>
        </div>
        <div class="header-text">
          <h2 class="header-name">
            {{ (otherUser.first_name || otherUser.firstName) ? `${otherUser.first_name || otherUser.firstName} ${otherUser.last_name || otherUser.lastName || ''}`.trim() : (otherUser.username || 'Artisan') }}
          </h2>
          <span class="online-status">Online</span>
        </div>
      </div>

      <button class="refresh-btn" @click="fetchMessages(true, 'manualRefresh')" :disabled="loading" title="Refresh messages">
        <svg :class="{ 'spinning': loading }" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
      </button>
    </div>

    <!-- Messages -->
    <div class="messages-container" ref="messagesContainer">
      <!-- Loading State -->
      <div v-if="loading && messages.length === 0" class="loading-state">
        <div class="skeleton-messages">
          <div v-for="n in 4" :key="n" class="skeleton-msg" :class="n % 2 === 0 ? 'sent' : 'received'">
            <div class="skeleton-bubble"></div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="messages.length === 0" class="empty-chat animate-fade-in">
        <div class="empty-chat-hero">
          <div class="hero-avatar-wrapper">
            <img :src="otherUser?.avatar || 'https://i.pravatar.cc/150'" class="hero-avatar" />
            <div class="pulse-ring"></div>
          </div>
          <h2 class="hero-name">{{ (otherUser?.first_name || otherUser?.firstName) ? (otherUser.first_name || otherUser.firstName) : (otherUser?.username || 'Artisan') }}</h2>
          <p class="hero-subtitle">{{ t('whispersOfHeritage') }}</p>
        </div>
      </div>

      <!-- Messages List -->
      <div v-else class="messages-list">
        <div 
          v-for="msg in messages" 
          :key="msg.id" 
          class="message-wrapper"
          :class="{ 'sent': msg.sender_id === props.userData.id, 'received': msg.sender_id !== props.userData.id }"
        >
          <img v-if="msg.sender_id !== props.userData.id" :src="otherUser?.avatar || 'https://i.pravatar.cc/150'" class="bubble-avatar" />
          <div class="message-bubble">
            <p class="message-content">{{ msg.content }}</p>
            <span class="message-time">
              {{ new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Input Area -->
    <div class="chat-input-area">
      <div class="quick-emojis">
        <button 
          v-for="emoji in ['🏺', '✨', '🎨', '🧵', '💰', '📦', '🤝', '🦁', '🌍', '🔥']" 
          :key="emoji"
          class="emoji-btn tap-active"
          @click="addEmoji(emoji)"
        >
          {{ emoji }}
        </button>
      </div>
      <div class="input-wrapper">
        <textarea 
          v-model="newMessage" 
          placeholder="Type your message..." 
          @keydown.enter.prevent="sendMessage"
          rows="1"
        ></textarea>
        <button class="send-btn tap-active" @click="sendMessage" :disabled="!newMessage.trim()">
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
  gap: var(--space-4);
  padding: var(--space-4) var(--space-5);
  background: var(--wood-walnut);
  border-bottom: 1px solid var(--glass-border);
  z-index: 10;
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.avatar-wrapper-mini {
  position: relative;
  width: 40px;
  height: 40px;
}

.header-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 1.5px solid var(--glass-border);
  object-fit: cover;
}

.online-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  background: #10B981;
  border: 2px solid var(--wood-walnut);
  border-radius: 50%;
}

.header-text {
  display: flex;
  flex-direction: column;
}

.header-name {
  font-size: var(--text-body-lg);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.online-status {
  font-size: var(--text-caption);
  color: #10B981;
  font-weight: 600;
}

.refresh-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: var(--space-2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
  transition: all 0.3s;
}

.refresh-btn:hover:not(:disabled) {
  color: var(--accent-amber);
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
}

.skeleton-messages {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  width: 100%;
}

.skeleton-msg {
  display: flex;
  width: 100%;
}

.skeleton-msg.sent { justify-content: flex-end; }
.skeleton-msg.received { justify-content: flex-start; }

.skeleton-bubble {
  height: 44px;
  width: 60%;
  background: var(--wood-walnut);
  border-radius: var(--radius-md);
  position: relative;
  overflow: hidden;
  border: 1px solid var(--glass-border);
}

.skeleton-bubble::after {
  content: "";
  position: absolute;
  top: 0; right: 0; bottom: 0; left: 0;
  transform: translateX(-100%);
  background-image: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  100% { transform: translateX(100%); }
}

.empty-chat-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  text-align: center;
  margin-top: var(--space-10);
}

.hero-avatar-wrapper {
  position: relative;
  width: 80px;
  height: 80px;
}

.hero-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--accent-amber);
}

.pulse-ring {
  position: absolute;
  top: -4px; left: -4px; right: -4px; bottom: -4px;
  border-radius: 50%;
  border: 2px solid var(--accent-amber);
  animation: avatar-pulse 2s infinite;
}

@keyframes avatar-pulse {
  0% { transform: scale(1); opacity: 0.5; }
  100% { transform: scale(1.3); opacity: 0; }
}

.hero-name {
  font-size: var(--text-h2);
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
}

.hero-subtitle {
  font-family: 'JetBrains Mono', monospace;
  font-size: var(--text-caption);
  color: var(--text-amber);
  text-transform: uppercase;
  letter-spacing: 2px;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.message-wrapper {
  display: flex;
  width: 100%;
}

.message-wrapper.sent { justify-content: flex-end; }
.message-wrapper.received { justify-content: flex-start; }

.bubble-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: var(--space-2);
  margin-top: auto;
  border: 1px solid var(--glass-border);
}

.message-bubble {
  max-width: 75%;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  font-size: var(--text-body-lg);
  line-height: var(--leading-snug);
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.sent .message-bubble {
  background: linear-gradient(135deg, var(--accent-amber), #B45309);
  color: white;
  border-bottom-right-radius: 4px;
}

.received .message-bubble {
  background: var(--wood-walnut);
  color: var(--text-primary);
  border-bottom-left-radius: 4px;
  border: 1px solid var(--glass-border);
}

.message-time {
  font-size: var(--text-micro);
  opacity: 0.6;
  display: block;
  text-align: right;
  margin-top: var(--space-1);
}

.chat-input-area {
  padding: var(--space-3) var(--space-5) var(--space-8);
  background: var(--wood-deep);
  border-top: 1px solid var(--glass-border);
}

.quick-emojis {
  display: flex;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
  overflow-x: auto;
  scrollbar-width: none;
}

.emoji-btn {
  background: var(--wood-walnut);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-sm);
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-body-lg);
  cursor: pointer;
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  background: var(--wood-walnut);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: var(--space-2) var(--space-4);
}

.input-wrapper textarea {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--text-primary);
  padding: var(--space-2) 0;
  font-size: var(--text-body-lg);
  outline: none;
  resize: none;
}

.send-btn {
  background: none;
  border: none;
  color: var(--accent-amber);
  cursor: pointer;
}

.back-btn {
  background: var(--wood-walnut);
  border: 1px solid var(--glass-border);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
}
</style>
