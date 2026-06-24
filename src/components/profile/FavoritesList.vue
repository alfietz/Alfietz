<!-------- (FavoritesList.vue) ./src/components/FavoritesList.vue ------------>
<script setup>
import ProductCard from '../shop/ProductCard.vue'
import EmptyFavorites from './EmptyFavorites.vue'

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
    <div v-if="favoriteItems.length > 0" class="favorites-grid">
      <ProductCard 
        v-for="item in favoriteItems" 
        :key="item.id" 
        :product="item" 
        horizontal
        @select="$emit('go-details', item)"
        @toggle-like="(p) => $emit('toggle-like', p)"
      />
    </div>
    <EmptyFavorites v-else />
  </div>
</template>

<style scoped>
.favorites-page {
  background-color: var(--wood-deep);
  min-height: 100vh;
  padding: var(--space-6) var(--space-5);
  max-width: 1200px;
  margin: 0 auto;
}

.header-row {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.title {
  font-size: var(--text-h1);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--space-4);
}
</style>