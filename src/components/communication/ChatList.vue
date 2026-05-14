<script setup>
import { ref, onMounted } from 'vue'
import { db } from '../../db/client'

const props = defineProps({
  userData: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['go-back', 'go-chat'])

const conversations = ref([])
const loading = ref(true)

onMounted(async () => {
  await fetchConversations()
})

const fetchConversations = async () => {
  try {
    loading.value = true
    // Fetch unique users the current user has exchanged messages with
    const res = await db.execute({
      sql: `
        SELECT DISTINCT 
          CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END as other_user_id
        FROM messages 
        WHERE sender_id = ? OR receiver_id = ?
      `,
      args: [props.userData.id, props.userData.id, props.userData.id]
    })

    const otherUserIds = res.rows.map(r => r.other_user_id)
    
    if (otherUserIds.length === 0) {
      conversations.value = []
      return
    }

    // Fetch user details and last message for each conversation
    const convos = []
    for (const id of otherUserIds) {
      const userRes = await db.execute({
        sql: "SELECT * FROM users WHERE id = ?",
        args: [id]
      })
      
      const lastMsgRes = await db.execute({
        sql: `
          SELECT * FROM messages 
          WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
          ORDER BY created_at DESC LIMIT 1
        `,
        args: [props.userData.id, id, id, props.userData.id]
      })

      if (userRes.rows.length > 0) {
        const user = userRes.rows[0]
        convos.push({
          id: user.id,
          name: `${user.first_name} ${user.last_name}` || user.username,
          avatar: user.avatar,
          lastMessage: lastMsgRes.rows[0]?.content || 'No messages yet',
          time: lastMsgRes.rows[0] ? new Date(lastMsgRes.rows[0].created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
          unread: lastMsgRes.rows[0]?.receiver_id === props.userData.id && !lastMsgRes.rows[0]?.is_read
        })
      }
    }
    
    conversations.value = convos
  } catch (e) {
    console.error("Error fetching conversations:", e)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="chat-list-page animate-fade">
    <div class="header-row">
      <button class="back-btn" @click="$emit('go-back')">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <h1 class="title">My Conversations</h1>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Gathering the Tribe's whispers...</p>
    </div>

    <div v-else-if="conversations.length === 0" class="empty-state">
      <div class="empty-icon">💬</div>
      <p>No conversations yet. Reach out to a tailor to start your heritage journey!</p>
    </div>

    <div v-else class="conversations-list">
      <div 
        v-for="convo in conversations" 
        :key="convo.id" 
        class="convo-card"
        @click="$emit('go-chat', convo.id)"
      >
        <div class="avatar-box">
          <img :src="convo.avatar || 'https://i.pravatar.cc/150'" alt="Avatar" />
          <div v-if="convo.unread" class="unread-dot"></div>
        </div>
        <div class="convo-info">
          <div class="convo-header">
            <h3 class="convo-name">{{ convo.name }}</h3>
            <span class="convo-time">{{ convo.time }}</span>
          </div>
          <p class="last-message" :class="{ unread: convo.unread }">{{ convo.lastMessage }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-list-page {
  padding: 40px 24px;
  max-width: 800px;
  margin: 0 auto;
  min-height: 100vh;
  background-color: var(--wood-deep);
}

.header-row {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 40px;
}

.title {
  font-size: 24px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
}

.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 20px;
  text-align: center;
  color: var(--text-muted);
}

.empty-icon { font-size: 48px; margin-bottom: 20px; }

.conversations-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.convo-card {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: var(--wood-walnut);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.convo-card:hover {
  border-color: var(--accent-amber);
  transform: translateX(4px);
}

.avatar-box {
  position: relative;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid var(--glass-border);
  flex-shrink: 0;
}

.avatar-box img { width: 100%; height: 100%; object-fit: cover; }

.unread-dot {
  position: absolute;
  top: 0;
  right: 0;
  width: 12px;
  height: 12px;
  background: var(--accent-amber);
  border: 2px solid var(--wood-walnut);
  border-radius: 50%;
}

.convo-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
}

.convo-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 4px;
}

.convo-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.convo-time {
  font-size: 12px;
  color: var(--text-muted);
}

.last-message {
  font-size: 14px;
  color: var(--text-muted);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.last-message.unread {
  color: var(--text-primary);
  font-weight: 600;
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
