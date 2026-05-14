<!-------- (FavoritesList.vue) ./src/components/FavoritesList.vue ------------>
<script setup>
import ProductCard from '../shop/ProductCard.vue'

defineProps({
  favoriteItems: {
    type: Array,
    default: () => []
  }
})

defineEmits(['go-back', 'go-details', 'toggle-like'])
</script>

<template>
  <div class="favorites-page">
    <div class="favorites-grid">
      <ProductCard 
        v-for="item in favoriteItems" 
        :key="item.id" 
        :product="item" 
        @click="$emit('go-details', item)"
        @toggle-like="(p) => $emit('toggle-like', p)"
      />
    </div>
  </div>
</template>

<style scoped>
.favorites-page {
  background-color: var(--wood-deep);
  min-height: 100vh;
  padding: 24px 20px;
}

.header-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.title {
  font-size: 22px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}
</style>