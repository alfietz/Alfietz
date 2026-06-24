<!-------- (EmptySearch.vue) ./src/components/EmptySearch.vue ------------>
<script setup>
// Empty state component for "No Results" searches
</script>

<template>
  <div class="empty-state-page">
    <div class="content-wrapper">
      <div class="icon-circle">
        <!-- Search/Magnifying Glass Icon -->
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.3-4.3"/>
        </svg>
      </div>
      <h2 class="title">No results found</h2>
      <p class="subtitle">
        Try using simpler search terms and then<br>
        filtering the correct tag
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
  padding: var(--space-5);
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 300px;
}

.icon-circle {
  width: 88px;
  height: 88px;
  background: var(--accent-amber); /* App Primary Green */
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--space-6);
}

.title {
  font-size: var(--text-h2);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 var(--space-3) 0;
}

.subtitle {
  font-size: var(--text-body);
  color: var(--text-muted);
  line-height: var(--leading-snug);
  margin: 0;
}
</style>