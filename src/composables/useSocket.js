import { ref, onUnmounted } from 'vue'
import { io } from 'socket.io-client'

const socket = ref(null)
const connected = ref(false)
const listeners = new Map()

export function useSocket() {
  function connect(userId) {
    if (socket.value?.connected) return

    const url = import.meta.env.VITE_SOCKET_URL || ''
    socket.value = io(url, {
      transports: ['websocket'],
      query: { userId },
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: Infinity
    })

    socket.value.on('connect', () => {
      connected.value = true
    })

    socket.value.on('disconnect', () => {
      connected.value = false
    })
  }

  function disconnect() {
    if (socket.value) {
      socket.value.disconnect()
      socket.value = null
      connected.value = false
    }
    listeners.clear()
  }

  function on(event, callback) {
    if (!socket.value) return
    socket.value.on(event, callback)
    if (!listeners.has(event)) listeners.set(event, [])
    listeners.get(event).push(callback)
  }

  function off(event) {
    if (!socket.value) return
    const cbs = listeners.get(event)
    if (cbs) {
      cbs.forEach(cb => socket.value.off(event, cb))
      listeners.delete(event)
    }
  }

  onUnmounted(() => {
    listeners.forEach((cbs, event) => {
      cbs.forEach(cb => socket.value?.off(event, cb))
    })
    listeners.clear()
  })

  return { socket, connected, connect, disconnect, on, off }
}
