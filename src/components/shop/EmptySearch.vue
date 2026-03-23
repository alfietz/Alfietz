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
        filtering the correct tog
      </p>
    </div>
  </div>
</template>

<style scoped>
.empty-state-page {
  background-color: #FFFFFF;
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
  max-width: 300px;
}

.icon-circle {
  width: 88px;
  height: 88px;
  background-color: #5D8374; /* App Primary Green */
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.title {
  font-size: 18px;
  font-weight: 700;
  color: #1A1A1A;
  margin: 0 0 12px 0;
}

.subtitle {
  font-size: 13px;
  color: #888888;
  line-height: 1.5;
  margin: 0;
}
</style>