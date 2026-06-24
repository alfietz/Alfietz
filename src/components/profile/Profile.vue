<!-------- (Profile.vue) ./src/components/Profile.vue ------------>
<script setup>
import { ref } from 'vue'
import LogoutDialog from './LogoutDialog.vue'
import ProductCard from '../shop/ProductCard.vue'

const props = defineProps({
  userData: {
    type: Object,
    required: true
  },
  productCount: {
    type: Number,
    default: 0
  },
  myProducts: {
    type: Array,
    default: () => []
  },
  t: {
    type: Function,
    required: true
  },
  isLoading: {
    type: Boolean,
    default: false
  }
})

defineEmits(['go-back', 'go-edit-profile', 'go-settings', 'go-orders', 'go-upload', 'logout', 'go-console', 'go-app-review', 'navigate', 'toggle-favorite'])

const showLogoutDialog = ref(false)
</script>

<template>
  <div class="profile-page">
    <div class="header-row">
      <button class="back-btn" @click="$emit('go-back')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <h1 class="title">{{ t('profile') }}</h1>
      <div v-if="isLoading" class="mini-spinner"></div>
    </div>

    <div v-if="isLoading && !userData.id" class="loading-state">
      <div class="skeleton-avatar"></div>
      <div class="skeleton-text"></div>
      <div class="skeleton-text short"></div>
    </div>

    <div v-else class="profile-container animate-fade">

      <!-- Left Column: User Info & Stats -->
      <div class="profile-column-left">
        <!-- User Info -->
        <div class="user-header">
          <img :src="userData.avatar" alt="User Avatar" class="avatar" />
          <div class="name-badge-row">
            <h2 class="user-name">{{ userData.firstName }} {{ userData.lastName }}</h2>
            <span class="user-type-badge">{{ userData.userType === 'supplier' ? t('seller') : t('buyer') }}</span>
          </div>
          <p class="user-username">@{{ userData.username }}</p>
          <p class="user-email">{{ userData.email }}</p>
          <button class="edit-btn" @click="$emit('go-edit-profile')">{{ t('editProfileBtn') }}</button>
        </div>

        <!-- Artisan Dashboard (Suppliers Only) -->
        <div v-if="userData.userType === 'supplier'" class="artisan-dashboard">
          <div class="stats-row">
            <div class="stat-card">
              <span class="stat-value">{{ productCount }}</span>
              <span class="stat-label">{{ t('uploadedTrends') }}</span>
            </div>
            <div class="stat-card">
              <span class="stat-value">{{ userData.rating || '0.0' }}</span>
              <span class="stat-label">{{ t('stats') }}</span>
            </div>
          </div>
          
          <div class="dashboard-actions">
            <button class="console-btn" @click="$emit('go-console')">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6" y2="6"/><line x1="6" y1="18" x2="6" y2="18"/></svg>
              {{ t('tailorConsole') }}
            </button>
            <button class="primary-btn upload-btn" @click="$emit('go-upload')">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              {{ t('uploadWork') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Right Column: Value Prop & Actions -->
      <div class="profile-column-right">
        <!-- User Value Proposition (Needs/Gives) -->
        <div class="info-section">
          <div class="info-card">
            <h3 class="info-title">{{ userData.userType === 'buyer' ? t('needs') : t('gives') }}</h3>
            <p class="info-text">
              {{ userData.userType === 'buyer' ? (userData.needs || 'No specific needs listed.') : (userData.gives || 'No specific offerings listed.') }}
            </p>
          </div>
        </div>

        <!-- Menu List -->
        <div class="menu-list">
          <div class="menu-item" @click="$emit('go-orders')">
            <div class="menu-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-amber)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            </div>
            <span class="menu-text">{{ userData.userType === 'supplier' ? t('salesAndOrders') : t('heritageJourney') }}</span>
            <svg class="chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </div>

          <div class="menu-item" @click="$emit('navigate', 'reviews', { isApp: true })">
            <div class="menu-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-amber)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            </div>
            <span class="menu-text">{{ t('tribeExperiencesMenu') }}</span>
            <svg class="chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </div>

          <div class="menu-item" @click="$emit('go-app-review')">
            <div class="menu-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-amber)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2-2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            </div>
            <span class="menu-text">{{ t('shareJourneyMenu') }}</span>
            <svg class="chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </div>

          <div class="menu-item" @click="$emit('go-settings')">
            <div class="menu-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-amber)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            </div>
            <span class="menu-text">{{ t('settings') }}</span>
            <svg class="chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </div>

          <div class="menu-item logout-trigger" @click="showLogoutDialog = true">
            <div class="menu-icon logout-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </div>
            <span class="menu-text logout-text">{{ t('logout') }}</span>
          </div>
        </div>

        <!-- My Heritage Section (Suppliers Only) -->
        <div v-if="userData.userType === 'supplier' && myProducts.length > 0" class="my-heritage-section">
          <h3 class="section-title-alt">{{ t('myHeritageSection') }}</h3>
          <div class="products-grid">
            <ProductCard 
              v-for="product in myProducts" 
              :key="product.id" 
              :product="product" 
              @select="$emit('navigate', 'product-details', { selectedProduct: product })"
              @toggle-like="(p) => $emit('toggle-favorite', p)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Logout Confirmation -->
    <LogoutDialog 
      v-if="showLogoutDialog" 
      @cancel="showLogoutDialog = false" 
      @confirm="$emit('logout')" 
    />
  </div>
</template>

<style scoped>
.mini-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(217, 119, 6, 0.2);
  border-top-color: var(--accent-amber);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-left: 12px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-10) 0;
  gap: var(--space-4);
}

.skeleton-avatar {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  background: var(--wood-walnut);
  position: relative;
  overflow: hidden;
}

.skeleton-text {
  width: 150px;
  height: 16px;
  background: var(--wood-walnut);
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

.skeleton-text.short {
  width: 100px;
}

.skeleton-avatar::after, .skeleton-text::after {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  transform: translateX(-100%);
  background-image: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0,
    rgba(255, 255, 255, 0.05) 20%,
    rgba(255, 255, 255, 0.1) 60%,
    rgba(255, 255, 255, 0)
  );
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  100% { transform: translateX(100%); }
}

.profile-page { background-color: var(--wood-deep); min-height: 100vh; padding: var(--space-6) var(--space-5); max-width: 1200px; margin: 0 auto; }
.header-row { display: flex; align-items: center; gap: var(--space-4); margin-bottom: var(--space-8); }

.profile-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

@media (min-width: 1024px) {
  .profile-container {
    display: grid;
    grid-template-columns: 1fr 1.5fr;
    align-items: start;
    gap: var(--space-12);
  }
}

.profile-column-left {
  display: flex;
  flex-direction: column;
}

.profile-column-right {
  display: flex;
  flex-direction: column;
}

.back-btn { background: var(--wood-polished); border: none; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text-primary); }
.title { font-size: var(--text-h1); font-weight: 600; color: var(--text-primary); margin: 0; line-height: var(--leading-tight); }
.user-header { display: flex; flex-direction: column; align-items: center; margin-bottom: var(--space-10); }
.avatar { width: 88px; height: 88px; border-radius: 50%; object-fit: cover; margin-bottom: var(--space-4); }
.name-badge-row { display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-1); }
.user-name { font-size: var(--text-h2); font-weight: 600; color: var(--text-primary); margin: 0; }
.user-type-badge { background: var(--accent-amber); color: white; font-size: var(--text-micro); font-weight: 700; text-transform: uppercase; padding: var(--space-1) var(--space-2); border-radius: var(--radius-sm); }
.user-username { font-size: var(--text-caption); color: var(--text-amber); font-weight: 600; margin: var(--space-1) 0 var(--space-1) 0; line-height: var(--leading-tight); }
.user-email { font-size: var(--text-body); color: var(--text-muted); margin: 0 0 var(--space-4) 0; }
.edit-btn { background: transparent; border-color: var(--accent-amber); color: var(--text-amber); padding: var(--space-2) var(--space-6); border-radius: var(--radius-md); font-size: var(--text-body); font-weight: 600; cursor: pointer; }

.artisan-dashboard {
  margin-bottom: var(--space-8);
}

.stats-row {
  display: flex;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.stat-card {
  flex: 1;
  background: var(--wood-deep);
  border: 1px solid var(--glass-border);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  text-align: center;
  box-shadow: var(--shadow-sm);
}

.stat-value {
  display: block;
  font-size: var(--text-h2);
  font-weight: 800;
  color: var(--text-amber);
  line-height: var(--leading-tight);
}

.stat-label {
  font-size: var(--text-micro);
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.dashboard-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.console-btn {
  background: var(--wood-walnut);
  border: 1px solid var(--accent-amber);
  color: var(--accent-amber);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  font-size: var(--text-body-lg);
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  transition: all 0.3s;
  box-shadow: 0 4px 15px var(--accent-glow);
}

.console-btn:hover {
  background: var(--wood-polished);
  transform: translateY(-2px);
}

.upload-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
}

.info-section { margin-bottom: var(--space-8); }
.info-card { background: var(--wood-walnut); padding: var(--space-5); border-radius: var(--radius-md); border: 1px dashed var(--accent-amber); }
.info-title { font-size: var(--text-body); font-weight: 700; color: var(--text-primary); text-transform: uppercase; margin: 0 0 var(--space-2) 0; letter-spacing: 0.5px; }
.info-text { font-size: var(--text-body); color: var(--text-muted); line-height: var(--leading-snug); margin: 0; }

.menu-list { display: flex; flex-direction: column; gap: var(--space-4); }
.menu-item { display: flex; align-items: center; padding: var(--space-4); background: var(--wood-walnut); border: 1px solid var(--glass-border); border-radius: var(--radius-md); cursor: pointer; transition: all 0.3s; }
.menu-item:hover { border-color: var(--accent-amber); transform: translateX(4px); }
.menu-icon { width: 40px; height: 40px; border-radius: var(--radius-sm); background: var(--wood-deep); display: flex; align-items: center; justify-content: center; margin-right: var(--space-4); }
.menu-text { flex: 1; font-size: var(--text-body-lg); font-weight: 600; color: var(--text-primary); line-height: var(--leading-snug); }
.chevron { color: var(--text-muted); }

.logout-trigger:hover {
  border-color: #EF4444;
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

.my-heritage-section {
  margin-top: var(--space-10);
}

.section-title-alt {
  font-size: var(--text-h3);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--space-5);
  text-transform: uppercase;
  letter-spacing: 1px;
  line-height: var(--leading-tight);
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: var(--space-4);
}
</style>