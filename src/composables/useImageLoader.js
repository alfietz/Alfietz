import { ref } from 'vue'

export function useImageLoader() {
  const loaded = ref(false)
  const onLoad = () => { loaded.value = true }
  const onError = () => { loaded.value = true }
  return [loaded, onLoad, onError]
}
