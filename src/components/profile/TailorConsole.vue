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

const emit = defineEmits(['go-back', 'go-orders', 'go-negotiations', 'go-edit', 'go-upload', 'go-chat'])

const stats = ref({
  revenue: 'TSh 0',
  activeOrders: 0,
  conversionRate: '4.2%',
  profileViews: '1.2k'
})

const activeOrders = ref([])
const negotiations = ref([])
const myProducts = ref([])
const activeTab = ref('orders')

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
  await fetchData()
})

const fetchData = async () => {
  try {
    // 1. Fetch Orders
    const ordersRes = await db.execute({
      sql: `
        SELECT o.*, u.first_name, u.last_name, u.whatsapp as customer_phone
        FROM orders o 
        JOIN users u ON o.customer_id = u.id 
        WHERE o.tailor_id = ? 
        ORDER BY o.created_at DESC
      `,
      args: [props.userData.id]
    })
    
    activeOrders.value = ordersRes.rows.map(o => ({
      id: o.id,
      item: o.item_name,
      customer: `${o.first_name} ${o.last_name}`,
      customer_id: o.customer_id,
      customerFirstName: o.first_name,
      customerPhone: o.customer_phone,
      date: new Date(o.created_at).toLocaleDateString(),
      price: o.price,
      status: o.status,
      size: o.size
    }))

    // 2. Fetch Negotiations
    const negsRes = await db.execute({
      sql: `
        SELECT n.*, u.first_name, u.last_name, u.whatsapp as customer_phone, p.image
        FROM negotiations n 
        JOIN users u ON n.customer_id = u.id 
        LEFT JOIN products p ON n.item_name = p.name
        WHERE n.tailor_id = ? 
        ORDER BY n.created_at DESC
      `,
      args: [props.userData.id]
    })
    
    negotiations.value = negsRes.rows.map(n => ({
      id: n.id,
      customer: `${n.first_name} ${n.last_name}`,
      customer_id: n.customer_id,
      customerFirstName: n.first_name,
      customerPhone: n.customer_phone,
      item: n.item_name,
      offer: n.proposed_price,
      status: n.status,
      image: n.image
    }))

    // 3. Fetch My Products
    const productsRes = await db.execute({
      sql: `SELECT * FROM products WHERE owner_id = ? ORDER BY id DESC`,
      args: [props.userData.id]
    })
    myProducts.value = productsRes.rows

    // 4. Calculate Stats
    const totalRevenue = activeOrders.value
      .filter(o => o.status !== 'Pending')
      .reduce((sum, o) => {
        const val = parseInt(o.price.replace(/[^0-9]/g, ''))
        return sum + (isNaN(val) ? 0 : val)
      }, 0)
    
    stats.value.revenue = `TSh ${totalRevenue.toLocaleString()}`
    stats.value.activeOrders = activeOrders.value.length
    
  } catch (e) {
    console.error("Error fetching console data:", e)
  }
}

const toggleStock = async (product) => {
  const newStatus = product.status === 'In Stock' ? 'Out of Stock' : 'In Stock'
  try {
    await db.execute({
      sql: `UPDATE products SET status = ? WHERE id = ?`,
      args: [newStatus, product.id]
    })
    product.status = newStatus
  } catch (e) {
    console.error("Error updating stock status:", e)
  }
}

const getStatusClass = (status) => {
  if (status === 'Pending') return 'status-pending'
  if (status === 'Stitching') return 'status-active'
  return ''
}

const openWhatsApp = (customerData, orderOrNeg, type = 'order') => {
  const phone = customerData.customerPhone
  if (!phone) {
    showDialog({
      title: 'Contact Error',
      message: 'Customer contact info not available.',
      type: 'error'
    })
    return;
  }
  let normalized = phone.startsWith('0') ? '255' + phone.slice(1) : phone.replace('+', '')
  
  const tailorName = props.userData.firstName || props.userData.username
  const customerName = customerData.customerFirstName || customerData.customer

  let message = `Hello ${customerName}! ✨\n\nThis is ${tailorName} from Alfietz. ✂️\n\n`
  
  if (type === 'order') {
    message += `I'm reaching out regarding your order #${orderOrNeg.id} for the "${orderOrNeg.item}". I'm currently working on it and wanted to give you an update! 🧵🌟\n\nLet me know if you have any questions.\n`
  } else {
    message += `I've seen your offer for the "${orderOrNeg.item}". I'd love to discuss this further with you! 🤝💫\n`
  }

  message += `\nBest regards,\n${tailorName} ✍️`
  
  const url = `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`
  window.open(url, '_blank')
}
</script>

<template>
  <div class="console-page pattern-heritage animate-fade">
    <div class="header-row">
      <button class="back-btn" @click="$emit('go-back')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <div>
        <h1 class="title">Tailor Command Center</h1>
        <p class="subtitle">Manage your heritage empire, orders, and negotiations.</p>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="stats-grid">
      <div class="stat-card revenue">
        <span class="stat-label">This Month's Revenue</span>
        <span class="stat-value">{{ stats.revenue }}</span>
        <span class="stat-trend">+12% from last month</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Active Orders</span>
        <span class="stat-value">{{ stats.activeOrders }}</span>
        <span class="stat-hint">3 require attention</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Inventory Items</span>
        <span class="stat-value">{{ myProducts.length }}</span>
        <span class="stat-hint">Managed Designs</span>
      </div>
    </div>

    <!-- Tab Navigation -->
    <div class="tab-nav">
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'orders' }"
        @click="activeTab = 'orders'"
      >
        Active Orders
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'inventory' }"
        @click="activeTab = 'inventory'"
      >
        My Inventory
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'negotiations' }"
        @click="activeTab = 'negotiations'"
      >
        Negotiations
      </button>
    </div>

    <div class="console-layout">
      <!-- Orders Table -->
      <div v-if="activeTab === 'orders'" class="orders-section animate-fade">
        <div class="section-header">
          <h2 class="section-title">Active Orders</h2>
          <button class="view-all" @click="$emit('go-orders')">View All</button>
        </div>
        <div class="table-container">
          <table class="orders-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Order Info</th>
                <th>Customer</th>
                <th>Status</th>
                <th class="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in activeOrders" :key="order.id">
                <td>
                  <div class="table-img-box">
                    <img :src="order.image" alt="Item" />
                  </div>
                </td>
                <td>
                  <div class="order-info">
                    <span class="order-item">{{ order.item }}</span>
                    <span class="order-meta">#{{ order.id }} • Size: {{ order.size }}</span>
                  </div>
                </td>
                <td>
                  <div class="customer-info">
                    <span class="customer-name">{{ order.customer }}</span>
                    <span class="order-date">{{ order.date }}</span>
                  </div>
                </td>
                <td>
                  <span class="status-badge" :class="getStatusClass(order.status)">
                    {{ order.status }}
                  </span>
                </td>
                <td class="text-right">
                  <div class="action-group">
                    <button class="action-btn wa" @click="openWhatsApp(order, order, 'order')">
                      WA
                    </button>
                    <button class="action-btn" @click="$emit('go-chat', order.customer_id)">
                      Chat
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Inventory Section -->
      <div v-if="activeTab === 'inventory'" class="inventory-section animate-fade">
        <div class="section-header">
          <h2 class="section-title">Design Inventory</h2>
          <button class="primary-btn-small" @click="$emit('go-upload')">+ New Design</button>
        </div>
        <div class="inventory-grid">
          <div v-for="product in myProducts" :key="product.id" class="inventory-card">
            <div class="inventory-img-box">
              <img :src="product.image" alt="Product" />
              <div class="stock-overlay" :class="product.status === 'In Stock' ? 'in-stock' : 'out-of-stock'">
                {{ product.status }}
              </div>
            </div>
            <div class="inventory-details">
              <h3 class="inv-name">{{ product.name }}</h3>
              <p class="inv-price">{{ product.price }}</p>
              <div class="inv-actions">
                <button 
                  class="edit-btn"
                  @click="$emit('go-edit', product)"
                >
                  Edit Design
                </button>
                <button 
                  class="stock-toggle-btn"
                  :class="{ 'to-oos': product.status === 'In Stock' }"
                  @click="toggleStock(product)"
                >
                  {{ product.status === 'In Stock' ? 'Set Out of Stock' : 'Set In Stock' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Negotiations Section -->
      <div v-if="activeTab === 'negotiations'" class="negotiations-section animate-fade">
        <div class="section-header">
          <h2 class="section-title">Active Negotiations</h2>
          <span class="badge-new">{{ negotiations.length }} Total</span>
        </div>
        <div class="negotiations-list">
          <div v-for="neg in negotiations" :key="neg.id" class="negotiation-card">
            <div class="neg-header">
              <div class="neg-img-box">
                <img :src="neg.image" alt="Item" />
              </div>
              <div class="neg-info">
                <span class="neg-customer">{{ neg.customer }}</span>
                <span class="neg-item">{{ neg.item }}</span>
              </div>
            </div>
            <div class="offer-box">
              <span class="offer-label">Proposed Offer</span>
              <span class="offer-value">{{ neg.offer }}</span>
            </div>
            <div class="neg-actions">
              <button class="accept-btn">Accept</button>
              <button class="decline-btn">Decline</button>
              <button class="chat-btn" @click="$emit('go-chat', neg.customer_id)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-13.4 8.38 8.38 0 0 1 3.8.9L21 3z"/></svg>
              </button>
              <button class="chat-btn" @click="openWhatsApp(neg, neg, 'negotiation')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.79 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              </button>
            </div>
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
.console-page {
  padding: 40px 24px;
  max-width: 1440px;
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
  font-size: 28px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
}

.subtitle {
  font-size: 14px;
  color: var(--text-muted);
  margin: 4px 0 0 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 48px;
}

.stat-card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: var(--radius-md);
  padding: 24px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

.stat-card:hover {
  border-color: var(--accent-amber);
  transform: translateY(-4px);
}

.stat-label {
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--text-muted);
  letter-spacing: 1px;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 32px;
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1;
}

.stat-trend {
  font-size: 12px;
  font-weight: 700;
  color: var(--price-text);
  margin-top: 12px;
}

.stat-hint {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 12px;
}

/* Tab Navigation */
.tab-nav {
  display: flex;
  gap: 12px;
  margin-bottom: 32px;
  border-bottom: 1px solid var(--glass-border);
  padding-bottom: 2px;
}

.tab-btn {
  background: transparent;
  border: none;
  padding: 12px 24px;
  font-size: 15px;
  font-weight: 700;
  color: var(--text-muted);
  cursor: pointer;
  position: relative;
  transition: all 0.3s;
}

.tab-btn.active {
  color: var(--accent-amber);
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 2px;
  background: var(--accent-amber);
  box-shadow: 0 0 10px var(--accent-glow);
}

/* Inventory Styles */
.inventory-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
}

.inventory-card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: var(--radius-md);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.inventory-img-box {
  position: relative;
  aspect-ratio: 4/3;
  overflow: hidden;
}

.inventory-img-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.stock-overlay {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
}

.stock-overlay.in-stock { background: var(--price-text); color: white; }
.stock-overlay.out-of-stock { background: #EF4444; color: white; }

.inventory-details {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.inv-name {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
}

.inv-price {
  font-size: 14px;
  font-weight: 600;
  color: var(--accent-amber);
}

.inv-actions {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.edit-btn {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  background: var(--wood-walnut);
  color: var(--text-amber);
  border: 1px solid var(--accent-amber);
  transition: all 0.3s;
}

.edit-btn:hover {
  background: var(--wood-polished);
  box-shadow: 0 0 10px var(--accent-glow);
}

.stock-toggle-btn {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  background: var(--price-bg);
  color: var(--price-text);
  border: 1px solid var(--price-border);
  transition: all 0.3s;
}

.stock-toggle-btn.to-oos {
  background: rgba(239, 68, 68, 0.1);
  color: #EF4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.primary-btn-small {
  background: var(--accent-amber);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.console-layout {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

@media (min-width: 1200px) {
  .console-layout {
    flex-direction: row;
    align-items: flex-start;
  }
  .orders-section { flex: 2; }
  .negotiations-section { flex: 1; }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-title {
  font-size: 20px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
}

.view-all {
  font-size: 13px;
  font-weight: 700;
  color: var(--accent-amber);
  background: none;
  border: none;
  cursor: pointer;
}

.table-container {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: var(--radius-md);
  overflow-x: auto;
}

.orders-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.orders-table th {
  padding: 16px 24px;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--text-muted);
  border-bottom: 1px solid var(--card-border);
  background: rgba(0,0,0,0.05);
}

.orders-table td {
  padding: 16px 24px;
  border-bottom: 1px solid var(--card-border);
}

.order-info, .customer-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.order-item, .customer-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
}

.order-meta, .order-date {
  font-size: 12px;
  color: var(--text-muted);
}

.table-img-box {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--glass-border);
  background: var(--wood-deep);
}

.table-img-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-pending {
  background: rgba(245, 158, 11, 0.1);
  color: #F59E0B;
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.status-active {
  background: rgba(59, 130, 246, 0.1);
  color: #3B82F6;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.action-btn {
  background: var(--wood-walnut);
  border: 1px solid var(--glass-border);
  color: var(--text-primary);
  padding: 8px 16px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
}

.action-btn:hover {
  border-color: var(--accent-amber);
  color: var(--accent-amber);
  background: var(--wood-polished);
}

.action-btn.wa {
  background: rgba(16, 185, 129, 0.1);
  color: #10B981;
  border-color: rgba(16, 185, 129, 0.2);
}

.action-btn.wa:hover {
  background: rgba(16, 185, 129, 0.2);
  border-color: #10B981;
}

.action-group {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.badge-new {
  background: #EF4444;
  color: white;
  font-size: 10px;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 10px;
}

.negotiation-card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: var(--radius-md);
  padding: 20px;
  margin-bottom: 16px;
  transition: all 0.3s;
}

.negotiation-card:hover {
  border-color: var(--accent-amber);
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.neg-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.neg-img-box {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--glass-border);
  background: var(--wood-deep);
  flex-shrink: 0;
}

.neg-img-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.neg-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.neg-customer {
  font-size: 15px;
  font-weight: 800;
  color: var(--text-primary);
}

.neg-item {
  font-size: 12px;
  color: var(--text-muted);
}

.offer-box {
  background: var(--wood-deep);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-sm);
  padding: 12px;
  margin-bottom: 20px;
}

.offer-label {
  display: block;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 4px;
}

.offer-value {
  font-size: 18px;
  font-weight: 800;
  color: var(--price-text);
}

.neg-actions {
  display: flex;
  gap: 8px;
}

.accept-btn, .decline-btn {
  flex: 1;
  padding: 10px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
}

.accept-btn {
  background: var(--price-text);
  color: white;
  border: none;
}

.decline-btn {
  background: transparent;
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #EF4444;
}

.chat-btn {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: var(--wood-walnut);
  border: 1px solid var(--glass-border);
  color: var(--accent-amber);
  cursor: pointer;
}

.text-right { text-align: right; }

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
