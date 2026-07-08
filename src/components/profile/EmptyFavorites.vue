<!-------- (EmptyFavorites.vue) ./src/components/EmptyFavorites.vue ------------>
<script setup>
// Empty state component for the favorites tab
</script>

<template>
  <div class="empty-state-page">
    <div class="content-wrapper">
      <div class="icon-circle">
        <!-- Heart Icon -->
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
        </svg>
      </div>
      <h2 class="title">No favorite yet!</h2>
      <p class="subtitle">
        Like a product you see save them here to your<br>favourites.
      </p>
    </div>
  </div>
</template>

<style scoped>
.empty-state-page {
  background: var(--wood-deep);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', -apple-system, sans-serif;
  padding: 20px;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 320px;
}

.icon-circle {
  width: 88px;
  height: 88px;
  background: var(--accent-amber); /* App Primary Green */
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 12px 0;
}

.subtitle {
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.5;
  margin: 0;
}
</style>