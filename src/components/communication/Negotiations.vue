<script setup>
import { ref, onMounted } from 'vue'
import { db } from '../../db/client'
import { useImageLoader } from '../../composables/useImageLoader'

const props = defineProps({
  userData: { type: Object, required: true },
  t: { type: Function, required: true }
})

const emit = defineEmits(['go-back', 'go-chat', 'navigate'])

const negotiations = ref([])
const loading = ref(true)
const [negThumb, onNegThumbLoad, onNegThumbErr] = useImageLoader()
const [negAvatar, onNegAvatarLoad, onNegAvatarErr] = useImageLoader()

onMounted(async () => {
  const cached = localStorage.getItem('alfie_negotiations_cache')
  if (cached) {
    try {
      negotiations.value = JSON.parse(cached)
      loading.value = false
    } catch (e) {}
  }
  await fetchNegotiations()
})

const fetchNegotiations = async () => {
  try {
    const res = await db.runAction('get_negotiations', { userId: props.userData.id })
    const newList = (res.rows || []).map(n => {
      const isCustomer = n.customer_id === props.userData.id
      return {
        id: n.id,
        itemName: n.item_name,
        price: n.proposed_price,
        status: n.status,
        size: n.size,
        color: n.color,
        notes: n.notes,
        image: n.product_image || n.image,
        otherName: isCustomer
          ? `${n.tailor_first_name || ''} ${n.tailor_last_name || ''}`.trim() || n.tailor_username
          : `${n.customer_first_name || ''} ${n.customer_last_name || ''}`.trim() || n.customer_username,
        otherId: isCustomer ? n.tailor_id : n.customer_id,
        otherAvatar: isCustomer ? n.tailor_avatar : n.customer_avatar,
        role: isCustomer ? 'buyer' : 'tailor',
        date: n.created_at ? new Date(n.created_at).toLocaleDateString() : ''
      }
    })
    if (JSON.stringify(newList) !== JSON.stringify(negotiations.value)) {
      negotiations.value = newList
      localStorage.setItem('alfie_negotiations_cache', JSON.stringify(newList))
    }
  } catch (e) {
    console.error("Error fetching negotiations:", e)
  } finally {
    loading.value = false
  }
}

const statusClass = (status) => {
  if (status === 'Accepted') return 'status-accepted'
  if (status === 'Declined') return 'status-declined'
  return 'status-pending'
}
</script>

<template>
  <div class="negotiations-page animate-fade">
    <div class="header-row">
      <button class="back-btn tap-active" @click="$emit('go-back')">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <div class="header-text">
        <h1 class="title">Negotiations</h1>
        <p class="subtitle">Offers &amp; proposals</p>
      </div>
      <button class="refresh-btn-alt" @click="fetchNegotiations" :disabled="loading">
        <svg :class="{ spinning: loading }" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
      </button>
    </div>

    <div v-if="loading && negotiations.length === 0" class="loading-state">
      <div v-for="n in 3" :key="n" class="skeleton-neg">
        <div class="skeleton-neg-top">
          <div class="skeleton-neg-img shimmer"></div>
          <div class="skeleton-neg-info">
            <div class="skeleton-line w60 shimmer"></div>
            <div class="skeleton-line w40 shimmer"></div>
          </div>
          <div class="skeleton-neg-status shimmer"></div>
        </div>
        <div class="skeleton-neg-meta">
          <div class="skeleton-line w30 shimmer"></div>
          <div class="skeleton-line w20 shimmer"></div>
        </div>
      </div>
    </div>

    <div v-else-if="negotiations.length === 0" class="empty-state">
      <div class="empty-icon">🤝</div>
      <p>No negotiations yet. Send an offer on a product to get started.</p>
    </div>

    <div v-else class="negotiations-list">
      <div v-for="neg in negotiations" :key="neg.id" class="neg-card">
        <div class="neg-top">
          <div class="heritage-img" :class="{ loaded: negThumb }"><div class="heritage-img-shimmer"></div><img :src="neg.image || 'https://i.pravatar.cc/150'" class="neg-thumb" @load="onNegThumbLoad" @error="onNegThumbErr" /></div>
          <div class="neg-info">
            <h3 class="neg-item">{{ neg.itemName }}</h3>
            <p class="neg-price">{{ neg.price }}</p>
          </div>
          <span class="neg-status" :class="statusClass(neg.status)">{{ neg.status }}</span>
        </div>
        <div class="neg-meta">
          <span class="neg-person">
            <div class="heritage-img" :class="{ loaded: negAvatar }"><div class="heritage-img-shimmer"></div><img :src="neg.otherAvatar || 'https://i.pravatar.cc/150?u=unknown'" class="mini-avatar" @load="onNegAvatarLoad" @error="onNegAvatarErr" /></div>
            {{ neg.otherName }}
          </span>
          <span class="neg-date">{{ neg.date }}</span>
        </div>
        <div v-if="neg.size || neg.color" class="neg-details">
          <span v-if="neg.size" class="detail-tag">Size: {{ neg.size }}</span>
          <span v-if="neg.color" class="detail-tag">Color: {{ neg.color }}</span>
        </div>
        <div class="neg-actions">
          <button class="action-btn-chat" @click="$emit('go-chat', neg.otherId)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-13.4 8.38 8.38 0 0 1 3.8.9L21 3z"/></svg>
            Chat
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.negotiations-page {
  padding: 40px 24px;
  max-width: 800px;
  margin: 0 auto;
  min-height: 100vh;
  background: var(--wood-deep);
}
.header-row {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 40px;
}
.header-text { display: flex; flex-direction: column; }
.title {
  font-size: 24px; font-weight: 800; color: var(--text-primary);
  margin: 0; letter-spacing: -0.5px;
}
.subtitle {
  font-family: 'JetBrains Mono', monospace; font-size: 11px;
  color: var(--text-amber); text-transform: uppercase; letter-spacing: 2px; margin: 2px 0 0 0;
}
.refresh-btn-alt {
  background: none; border: none; color: var(--text-muted); cursor: pointer;
  padding: 8px; margin-left: auto; transition: all 0.3s;
}
.refresh-btn-alt:hover:not(:disabled) { color: var(--accent-amber); }
.spinning { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.loading-state { display: flex; flex-direction: column; gap: 12px; }
.skeleton-neg {
  background: var(--wood-walnut);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 16px;
}
.skeleton-neg-top {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 10px;
}
.skeleton-neg-img {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  background: var(--wood-deep);
  flex-shrink: 0;
}
.skeleton-neg-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.skeleton-neg-status {
  width: 80px;
  height: 22px;
  border-radius: 999px;
  background: var(--wood-deep);
}
.skeleton-neg-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.skeleton-line {
  height: 14px;
  background: var(--wood-deep);
  border-radius: 4px;
}
.skeleton-line.w60 { width: 60%; }
.skeleton-line.w40 { width: 40%; }
.skeleton-line.w30 { width: 30%; }
.skeleton-line.w20 { width: 20%; }
.empty-state { text-align: center; padding: 80px 20px; color: var(--text-muted); }
.empty-icon { font-size: 48px; margin-bottom: 20px; }
.negotiations-list { display: flex; flex-direction: column; gap: 12px; }
.neg-card {
  background: var(--wood-walnut); border: 1px solid var(--glass-border);
  border-radius: 16px; padding: 16px; transition: all 0.2s;
}
.neg-card:hover { border-color: var(--accent-amber); }
.neg-top { display: flex; gap: 12px; align-items: center; margin-bottom: 10px; }
.neg-thumb { width: 52px; height: 52px; border-radius: 12px; object-fit: cover; border: 1px solid var(--glass-border); }
.neg-info { flex: 1; min-width: 0; }
.neg-item { font-size: 15px; font-weight: 700; color: var(--text-primary); margin: 0 0 2px; }
.neg-price { font-size: 14px; color: var(--price-text); font-weight: 700; margin: 0; }
.neg-status {
  font-size: 11px; font-weight: 800; text-transform: uppercase;
  letter-spacing: 1px; padding: 4px 10px; border-radius: var(--radius-full);
  white-space: nowrap;
}
.status-pending { background: rgba(217,119,6,0.15); color: var(--text-amber); }
.status-accepted { background: rgba(16,185,129,0.15); color: #10B981; }
.status-declined { background: rgba(239,68,68,0.15); color: #EF4444; }
.neg-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.neg-person { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--text-muted); }
.mini-avatar { width: 20px; height: 20px; border-radius: 50%; object-fit: cover; }
.neg-date { font-size: 12px; color: var(--text-muted); }
.neg-details { display: flex; gap: 8px; margin-bottom: 10px; }
.detail-tag {
  font-size: 11px; padding: 3px 8px; background: var(--wood-deep);
  border: 1px solid var(--glass-border); border-radius: var(--radius-full);
  color: var(--text-muted);
}
.neg-actions { display: flex; gap: 8px; }
.action-btn-chat {
  display: flex; align-items: center; gap: 6px; padding: 8px 16px;
  background: var(--wood-polished); border: 1px solid var(--glass-border);
  border-radius: var(--radius-full); color: var(--text-primary);
  font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s;
}
.action-btn-chat:hover { border-color: var(--accent-amber); color: var(--text-amber); }
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
