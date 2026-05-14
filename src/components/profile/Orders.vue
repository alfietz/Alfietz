<script setup>
import { ref, onMounted } from 'vue'
import { db } from '../../db/client'
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

defineEmits(['go-back'])

const orders = ref([])

// Dialog State
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

onMounted(async () => {
  await fetchOrders()
})

const fetchOrders = async () => {
  try {
    const res = await db.execute({
      sql: `
        SELECT o.*, u.username as tailor_name, u.whatsapp as tailor_phone, u.first_name as tailor_first_name, u.id as tailor_id
        FROM orders o 
        JOIN users u ON o.tailor_id = u.id 
        WHERE o.customer_id = ? 
        ORDER BY o.created_at DESC
      `,
      args: [props.userData.id]
    })
    
    orders.value = res.rows.map(o => ({
      id: o.id,
      item: o.item_name,
      tailor: o.tailor_name,
      tailor_id: o.tailor_id,
      tailorFirstName: o.tailor_first_name,
      tailorPhone: o.tailor_phone,
      date: new Date(o.created_at).toLocaleDateString(),
      price: o.price,
      status: o.status,
      image: o.image
    }))
  } catch (e) {
    console.error("Error fetching orders:", e)
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
  let normalized = order.tailorPhone.startsWith('0') ? '255' + order.tailorPhone.slice(1) : order.tailorPhone.replace('+', '')
  
  const buyerName = props.userData.firstName || props.userData.username
  const tailorName = order.tailorFirstName || order.tailor

  const message = `Hi ${tailorName}! 👋\n\nThis is ${buyerName}. I'm reaching out regarding my order #${order.id} for the "${order.item}". 📦\n\nI'd like to check on its status and see if there are any updates! Thank you for your amazing craft. ✨\n\nBest regards,\n${buyerName} ✍️`;
  
  const url = `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`
  window.open(url, '_blank')
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
  padding: 40px 24px;
  max-width: 800px;
  margin: 0 auto;
  min-height: 100vh;
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

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.order-card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: var(--radius-md);
  padding: 16px;
  display: flex;
  gap: 20px;
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
  gap: 8px;
}

.message-tailor-btn {
  margin-top: 8px;
  background: var(--accent-amber);
  color: var(--wood-deep);
  border: none;
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  font-weight: 700;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
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
  margin-bottom: 8px;
}

.order-id {
  font-size: 11px;
  font-weight: 800;
  color: var(--text-muted);
  text-transform: uppercase;
}

.status-badge {
  font-size: 10px;
  font-weight: 800;
  padding: 2px 10px;
  border-radius: 10px;
  text-transform: uppercase;
}

.status-pending { background: rgba(245, 158, 11, 0.1); color: #F59E0B; border: 1px solid rgba(245, 158, 11, 0.2); }
.status-success { background: rgba(16, 185, 129, 0.1); color: #10B981; border: 1px solid rgba(16, 185, 129, 0.2); }

.item-name {
  font-size: 16px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.tailor-name {
  font-size: 13px;
  color: var(--text-muted);
  margin: 0 0 12px 0;
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
  font-size: 15px;
}

.order-date {
  font-size: 12px;
  color: var(--text-muted);
}

.footer-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.chat-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--wood-walnut);
  border: 1px solid var(--glass-border);
  color: var(--accent-amber);
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 11px;
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
  padding: 80px 20px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 20px;
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
