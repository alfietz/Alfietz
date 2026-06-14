import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(router)
app.mount('#app')

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('SW Registered!', reg))
      .catch(err => console.log('SW Registration Error:', err));
  });
}

// APP RESILIENCE LOGIC
// 1. Handle app resume from background
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    // Check if the Service Worker is waiting to update the app from Vercel
    if (window.navigator && navigator.serviceWorker) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.update();
      });
    }
  }
});

// 2. Handle dynamic chunk load failures (Vercel deployment mismatch)
window.addEventListener('error', (event) => {
  const isChunkLoadFailed = event.message && event.message.includes('Failed to fetch dynamically imported module');
  if (isChunkLoadFailed) {
    console.warn("Vercel chunk mismatch detected on resume. Reloading app...");
    window.location.reload();
  }
});
