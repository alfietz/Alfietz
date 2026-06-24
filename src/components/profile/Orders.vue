<script setup>
import { ref, computed } from 'vue'
import { useProgressiveData } from '../../composables/useProgressiveData'
import BaseDialog from '../layout/BaseDialog.vue'

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

defineEmits(['go-back', 'go-chat'])

const ordersQuery = useProgressiveData('get_orders', { userId: props.userData?.id }, {
  cacheKey: `orders_${props.userData?.id}`,
  ttl: 2 * 60 * 1000
})

const orders = computed(() => {
  const raw = ordersQuery.data.value
  if (!raw) return []
  const rows = raw.rows
  if (!Array.isArray(rows)) return []
  return rows.map(o => ({
    id: o.id,
    item: o.item_name,
    tailor: (o.tailor_first_name || o.tailor_last_name) ? `${o.tailor_first_name || ''} ${o.tailor_last_name || ''}`.trim() : o.tailor_username,
    tailor_id: o.tailor_id,
    tailorFirstName: o.tailor_first_name,
    tailorPhone: o.tailor_phone,
    date: new Date(o.created_at).toLocaleDateString(),
    price: o.price,
    status: o.status,
    image: o.image
  }))
})

const loading = computed(() => !ordersQuery.data.value && !ordersQuery.error.value)

const dialog = ref({
  show: false,
  title: '',
  message: '',
  type: 'info'
})

const showDialog = (options) => {
  dialog.value = {
    show: true,
    title: options.title || '',
    message: options.message || '',
    type: options.type || 'info'
  }
}

const getStatusClass = (status) => {
  if (status === 'Pending') return 'status-pending'
  if (status === 'Shipped' || status === 'Stitching') return 'status-success'
  return ''
}

const openWhatsApp = (order) => {
  if (!order.tailorPhone) {
    showDialog({
      title: 'Contact Error',
      message: 'Tailor contact info not available.',
      type: 'error'
    })
    return;
  }
  const cleaned = order.tailorPhone.replace(/[^0-9]/g, '')
  let normalized = cleaned
  if (normalized.startsWith('2550')) {
    normalized = '255' + normalized.slice(4)
  } else if (normalized.startsWith('0')) {
    normalized = '255' + normalized.slice(1)
  }
  
  const buyerName = props.userData.firstName || props.userData.username
  const tailorName = order.tailorFirstName || order.tailor

  const message = `Hi ${tailorName}! 👋\n\nThis is ${buyerName}. I'm reaching out regarding my order #${order.id} for the "${order.item}". 📦\n\nI'd like to check on its status and see if there are any updates! Thank you for your amazing craft. ✨\n\nBest regards,\n${buyerName} ✍️`;
  
  const url = `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`
  
  if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    window.location.href = url
  } else {
    window.open(url, '_blank')
  }
}
</script>

<template>
  <div class="orders-page pattern-heritage animate-fade">
    <div class="header-row">
      <button class="back-btn" @click="$emit('go-back')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <h1 class="title">My Heritage Orders</h1>
    </div>

    <div v-if="!orders.length" class="empty-state">
      <div class="empty-icon">📦</div>
      <p>No heritage orders yet. Start your journey in the shop!</p>
    </div>

    <div v-else class="orders-list">
      <div v-for="order in orders" :key="order.id" class="order-card">
        <div class="order-image">
          <img :src="order.image" :alt="order.item" />
        </div>
        <div class="order-details">
          <div class="order-header">
            <span class="order-id">{{ order.id }}</span>
            <span class="status-badge" :class="getStatusClass(order.status)">{{ order.status }}</span>
          </div>
          <h3 class="item-name">{{ order.item }}</h3>
          <p class="tailor-name">by {{ order.tailor }}</p>
          <div class="order-footer">
            <span class="order-price">{{ order.price }}</span>
            <span class="order-date">{{ order.date }}</span>
          </div>
          <div class="footer-actions">
            <button class="message-tailor-btn" @click="openWhatsApp(order)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-13.4 8.38 8.38 0 0 1 3.8.9L21 3z"/></svg>
              WhatsApp
            </button>
            <button class="chat-btn" @click="$emit('go-chat', order.tailor_id)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-13.4 8.38 8.38 0 0 1 3.8.9L21 3z"/></svg>
              In-App Chat
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Custom Dialog -->
    <BaseDialog 
      :show="dialog.show"
      :title="dialog.title"
      :message="dialog.message"
      :type="dialog.type"
      @close="dialog.show = false"
      @confirm="dialog.show = false"
    />
  </div>
</template>

<style scoped>
.orders-page {
  padding: var(--space-10) var(--space-6);
  max-width: 800px;
  margin: 0 auto;
  min-height: 100vh;
}

.header-row {
  display: flex;
  align-items: center;
  gap: var(--space-5);
  margin-bottom: var(--space-10);
}

.title {
  font-size: var(--text-h1);
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.order-card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  display: flex;
  gap: var(--space-5);
  transition: all 0.3s;
}

.order-card:hover {
  border-color: var(--accent-amber);
  transform: translateY(-2px);
}

.order-image {
  width: 100px;
  height: 100px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: var(--wood-deep);
  flex-shrink: 0;
}

.order-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.message-tailor-btn {
  margin-top: var(--space-2);
  background: var(--accent-amber);
  color: var(--wood-deep);
  border: none;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-sm);
  font-weight: 700;
  font-size: var(--text-body);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  cursor: pointer;
  transition: all 0.2s;
  width: fit-content;
}

.message-tailor-btn:hover {
  background: var(--accent-gold);
  transform: scale(1.02);
}

.order-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.order-details {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-2);
}

.order-id {
  font-size: var(--text-caption);
  font-weight: 800;
  color: var(--text-muted);
  text-transform: uppercase;
}

.status-badge {
  font-size: var(--text-micro);
  font-weight: 800;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-sm);
  text-transform: uppercase;
}

.status-pending { background: rgba(245, 158, 11, 0.1); color: #F59E0B; border: 1px solid rgba(245, 158, 11, 0.2); }
.status-success { background: rgba(16, 185, 129, 0.1); color: #10B981; border: 1px solid rgba(16, 185, 129, 0.2); }

.item-name {
  font-size: var(--text-body-lg);
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 var(--space-1) 0;
}

.tailor-name {
  font-size: var(--text-body);
  color: var(--text-muted);
  margin: 0 0 var(--space-3) 0;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.order-price {
  font-family: 'JetBrains Mono', monospace;
  font-weight: 800;
  color: #10B981;
  font-size: var(--text-body-lg);
}

.order-date {
  font-size: var(--text-caption);
  color: var(--text-muted);
}

.footer-actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.chat-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  background: var(--wood-walnut);
  border: 1px solid var(--glass-border);
  color: var(--accent-amber);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
  font-size: var(--text-caption);
  font-weight: 800;
  cursor: pointer;
  transition: all 0.3s;
}

.chat-btn:hover {
  border-color: var(--accent-amber);
  background: var(--wood-polished);
}

.empty-state {
  text-align: center;
  padding: var(--space-12) var(--space-5);
}

.empty-icon {
  font-size: var(--text-display);
  margin-bottom: var(--space-5);
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
