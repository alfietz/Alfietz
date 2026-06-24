import { ref, readonly, onMounted, nextTick } from 'vue'
import { db } from '../db/client'

const STORAGE_PREFIX = 'alfie_prog_'

export function useProgressiveData(action, params = {}, { cacheKey = null, ttl = 5 * 60 * 1000, defer = false } = {}) {
  const data = ref(null)
  const isFresh = ref(false)
  const isDeferred = ref(defer)
  const error = ref(null)
  let manualRefresh = false

  let currentParams = { ...params }
  const getKey = () => cacheKey || `action_${action}_${JSON.stringify(currentParams)}`
  const getStorageKey = () => STORAGE_PREFIX + getKey()

  const loadCache = (overrideKey) => {
    const sk = overrideKey || getStorageKey()
    try {
      const raw = localStorage.getItem(sk)
      if (!raw) return null
      const parsed = JSON.parse(raw)
      if (Date.now() - parsed.ts > ttl) {
        localStorage.removeItem(sk)
        return null
      }
      return parsed.value
    } catch {
      localStorage.removeItem(sk)
      return null
    }
  }

  const saveCache = (val) => {
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify({ value: val, ts: Date.now() }))
    } catch {}
  }

  const initialCached = loadCache()
  if (initialCached !== null) {
    data.value = initialCached
    isFresh.value = true
  }

  const fetchData = async () => {
    try {
      error.value = null
      const result = await db.runAction(action, currentParams)
      if (result && result.data !== undefined) {
        data.value = result.data
      } else {
        data.value = result
      }
      saveCache(data.value)
      isFresh.value = true
      return data.value
    } catch (e) {
      error.value = e
      if (!data.value) {
        const fallback = loadCache()
        if (fallback !== null) data.value = fallback
      }
      throw e
    }
  }

  const execute = async () => {
    if (defer) {
      await nextTick()
      if (typeof requestIdleCallback === 'function') {
        return new Promise((resolve) => {
          requestIdleCallback(async () => {
            try {
              const result = await fetchData()
              resolve(result)
            } catch (e) {
              resolve(null)
            }
          }, { timeout: 3000 })
        })
      }
      return new Promise((resolve) => {
        setTimeout(async () => {
          try {
            const result = await fetchData()
            resolve(result)
          } catch {
            resolve(null)
          }
        }, 200)
      })
    }
    return fetchData()
  }

  const setParams = (newParams) => {
    currentParams = { ...newParams }
    const cached = loadCache()
    data.value = cached !== null ? cached : null
    isFresh.value = cached !== null
  }

  const refresh = () => {
    manualRefresh = true
    return fetchData()
  }

  if (typeof window !== 'undefined') {
    onMounted(() => {
      if (!manualRefresh) execute()
    })
  }

  return {
    data: readonly(data),
    isFresh,
    isDeferred,
    error: readonly(error),
    refresh,
    execute,
    setParams
  }
}
