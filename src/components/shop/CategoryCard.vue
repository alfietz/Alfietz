<!-------- (CategoryCard.vue) ./src/components/CategoryCard.vue ------------>
<script setup>
defineProps({
  category: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <div class="category-card">
    {{ category.name }}
  </div>
</template>

<style scoped>
.category-card {
  min-width: 100px;
  height: 120px;
  background: var(--wood-walnut); /* Primary Light Brown */
  border-radius: 16px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 16px;
  color: var(--text-muted);
  font-weight: 500;
  flex-shrink: 0;
  cursor: pointer;
  transition: transform 0.2s, background-color 0.2s;
}

.category-card:hover {
  transform: translateY(-4px);
  background: var(--wood-polished); /* Slightly darker on hover */
}
</style>