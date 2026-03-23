<!-------- (EditProfile.vue) ./src/components/EditProfile.vue ------------>
<script setup>
import { ref } from 'vue'

const props = defineProps({
  userData: {
    type: Object,
    required: true
  }
})

const tempUser = ref({ ...props.userData })

const emit = defineEmits(['go-back', 'update:user-data'])

const saveChanges = () => {
  emit('update:user-data', { ...tempUser.value })
}
</script>

<template>
  <div class="profile-page">
    <div class="header-row">
      <button class="back-btn" @click="$emit('go-back')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <h1 class="title">Edit profile</h1>
    </div>

    <!-- Avatar Section -->
    <div class="avatar-section">
      <div class="avatar-wrapper">
        <img :src="tempUser.avatar" alt="Avatar" class="avatar-img" />
        <button class="camera-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
        </button>
      </div>
      <div class="user-info">
        <h2 class="user-name">{{ tempUser.firstName }} {{ tempUser.lastName }}</h2>
        <p class="user-email">{{ tempUser.email }}</p>
      </div>
    </div>

    <!-- Form -->
    <div class="form-container">
      <div class="input-group">
        <label>Username</label>
        <input type="text" v-model="tempUser.username" />
      </div>

      <div class="input-group">
        <label>First name</label>
        <input type="text" v-model="tempUser.firstName" />
      </div>

      <div class="input-group">
        <label>Last name</label>
        <input type="text" v-model="tempUser.lastName" />
      </div>

      <div class="input-group">
        <label>WhatsApp Number</label>
        <input type="tel" v-model="tempUser.whatsapp" />
      </div>

      <!-- User Type Selection in Edit -->
      <div class="user-type-group">
        <label class="group-label">I am a:</label>
        <div class="type-options">
          <button 
            type="button" 
            class="type-btn" 
            :class="{ active: tempUser.userType === 'buyer' }"
            @click="tempUser.userType = 'buyer'"
          >
            Buyer
          </button>
          <button 
            type="button" 
            class="type-btn" 
            :class="{ active: tempUser.userType === 'supplier' }"
            @click="tempUser.userType = 'supplier'"
          >
            Supplier
          </button>
        </div>
      </div>

      <!-- Dynamic Bio Section -->
      <div class="input-group textarea-group">
        <label>{{ tempUser.userType === 'buyer' ? 'What are you looking for?' : 'What do you offer?' }}</label>
        <textarea 
          v-if="tempUser.userType === 'buyer'"
          v-model="tempUser.needs" 
          placeholder="e.g. Silk wedding dresses, bespoke suits..."
          class="bio-textarea"
        ></textarea>
        <textarea 
          v-else
          v-model="tempUser.gives" 
          placeholder="e.g. 10 years experience in tailoring, specialized in bridal wear..."
          class="bio-textarea"
        ></textarea>
      </div>

      <!-- Disabled Input -->
      <div class="input-group disabled-group">
        <input type="email" v-model="tempUser.email" disabled class="disabled-input" />
      </div>
    </div>

    <div class="bottom-action">
      <button class="primary-btn" @click="saveChanges">Save</button>
    </div>
  </div>
</template>

<style scoped>
.profile-page {
  background-color: var(--bg-white);
  min-height: 100vh;
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
}

.header-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
}

.back-btn {
  background-color: #F5F5F5;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.title {
  font-size: 22px;
  font-weight: 600;
  color: var(--secondary-brown);
  margin: 0;
}

/* Avatar Styles */
.avatar-section {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
}

.avatar-wrapper {
  position: relative;
}

.avatar-img {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
}

.camera-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  background: white;
  border: 1px solid #E5E5E5;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
}

.user-name {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-main);
}

.user-email {
  margin: 0;
  font-size: 13px;
  color: var(--text-muted);
}

/* Form Styles */
.form-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 1;
}

.input-group {
  position: relative;
  display: flex;
  flex-direction: column;
}

.input-group label {
  position: absolute;
  top: -8px;
  left: 12px;
  background: var(--bg-white);
  padding: 0 4px;
  font-size: 11px;
  color: var(--text-light);
  z-index: 1;
}

.input-group input {
  border: 1px solid var(--border-light);
  border-radius: 12px;
  padding: 16px;
  font-size: 15px;
  color: var(--text-main);
  background: transparent;
  outline: none;
  transition: border-color 0.2s;
}

.input-group input:focus {
  border-color: #5D8374;
}

.user-type-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.group-label {
  font-size: 13px;
  color: var(--text-muted);
  font-weight: 500;
}

.type-options {
  display: flex;
  gap: 12px;
}

.type-btn {
  flex: 1;
  padding: 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
  background: var(--bg-white);
  color: var(--text-muted);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.type-btn.active {
  background: var(--primary-green);
  color: white;
  border-color: var(--primary-green);
}

.textarea-group {
  margin-top: 12px;
}

.bio-textarea {
  border: 1px solid var(--border-light);
  border-radius: 12px;
  padding: 16px;
  font-size: 15px;
  color: var(--text-main);
  background: transparent;
  outline: none;
  min-height: 100px;
  resize: vertical;
  font-family: inherit;
}

.bio-textarea:focus {
  border-color: var(--primary-green);
}

/* Disabled Input Specifics */
.disabled-group {
  margin-top: 8px; /* space because there's no floating label */
}

.disabled-input {
  background-color: var(--primary-tan) !important;
  color: var(--text-light) !important;
  border: none !important;
}

/* Bottom Action */
.bottom-action {
  padding-top: 24px;
  padding-bottom: 24px;
}

.primary-btn {
  width: 100%;
  background: #5D8374;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 16px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}
</style>