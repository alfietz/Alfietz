<!-------- (Profile.vue) ./src/components/Profile.vue ------------>
<script setup>
import { ref } from 'vue'
import LogoutDialog from './LogoutDialog.vue'

defineProps({
  userData: {
    type: Object,
    required: true
  },
  productCount: {
    type: Number,
    default: 0
  },
  t: {
    type: Function,
    required: true
  }
})

defineEmits(['go-back', 'go-edit-profile', 'go-settings', 'go-orders', 'go-upload', 'logout'])

const showLogoutDialog = ref(false)
</script>

<template>
  <div class="profile-page">
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
          <span class="stat-value">4.9</span>
          <span class="stat-label">{{ t('stats') }}</span>
        </div>
      </div>
      <button class="primary-btn upload-btn" @click="$emit('go-upload')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        {{ t('uploadWork') }}
      </button>
    </div>

    <!-- User Value Proposition (Needs/Gives) -->
    <div class="info-section">
      <div class="info-card">
        <h3 class="info-title">{{ userData.userType === 'buyer' ? t('needs') : t('gives') }}</h3>
        <p class="info-text">
          {{ userData.userType === 'buyer' ? (userData.needs || '...') : (userData.gives || '...') }}
        </p>
      </div>
    </div>

    <!-- Menu List -->
    <div class="menu-list">
      <div class="menu-item" @click="$emit('go-settings')">
        <div class="menu-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        </div>
        <span class="menu-text">{{ t('settings') }}</span>
        <svg class="chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A0A0A0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
      </div>

      <div class="menu-item logout" @click="showLogoutDialog = true">
        <div class="menu-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E48F6D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </div>
        <span class="menu-text" style="color: #E48F6D;">{{ t('logout') }}</span>
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
.profile-page { background-color: var(--bg-white); min-height: 100vh; padding: 24px 20px; }
.header-row { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; }
.back-btn { background-color: #F5F5F5; border: none; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text-main); }
.title { font-size: 22px; font-weight: 600; color: var(--secondary-brown); margin: 0; }
.user-header { display: flex; flex-direction: column; align-items: center; margin-bottom: 40px; }
.avatar { width: 88px; height: 88px; border-radius: 50%; object-fit: cover; margin-bottom: 16px; }
.name-badge-row { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.user-name { font-size: 20px; font-weight: 600; color: var(--text-main); margin: 0; }
.user-type-badge { background: var(--primary-green); color: white; font-size: 10px; font-weight: 700; text-transform: uppercase; padding: 2px 8px; border-radius: 10px; }
.user-username { font-size: 13px; color: var(--primary-green); font-weight: 600; margin: 4px 0 2px 0; }
.user-email { font-size: 14px; color: var(--text-muted); margin: 0 0 16px 0; }
.edit-btn { background: transparent; border: 1px solid var(--primary-green); color: var(--primary-green); padding: 8px 24px; border-radius: 20px; font-size: 14px; font-weight: 600; cursor: pointer; }

.artisan-dashboard {
  margin-bottom: 32px;
}

.stats-row {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.stat-card {
  flex: 1;
  background: var(--bg-white);
  border: 1px solid var(--border-light);
  padding: 16px;
  border-radius: var(--radius-md);
  text-align: center;
  box-shadow: var(--shadow-sm);
}

.stat-value {
  display: block;
  font-size: 20px;
  font-weight: 800;
  color: var(--primary-green);
}

.stat-label {
  font-size: 11px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.upload-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 14px;
}

.info-section { margin-bottom: 32px; }
.info-card { background: var(--primary-tan); padding: 20px; border-radius: 16px; border: 1px dashed var(--primary-green); }
.info-title { font-size: 14px; font-weight: 700; color: var(--secondary-brown); text-transform: uppercase; margin: 0 0 8px 0; letter-spacing: 0.5px; }
.info-text { font-size: 14px; color: var(--text-main); line-height: 1.5; margin: 0; }

.menu-list { display: flex; flex-direction: column; gap: 16px; }
.menu-item { display: flex; align-items: center; padding: 16px; background: var(--primary-tan); border-radius: 16px; cursor: pointer; transition: transform 0.2s; }
.menu-item:hover { transform: translateY(-2px); opacity: 0.9; }
.menu-icon { width: 40px; height: 40px; border-radius: 50%; background: var(--bg-white); display: flex; align-items: center; justify-content: center; margin-right: 16px; }
.menu-text { flex: 1; font-size: 16px; font-weight: 500; color: var(--text-main); }
.chevron { color: #A0A0A0; }
</style>