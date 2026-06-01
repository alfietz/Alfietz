<!-------- (TailorDetails.vue) ./src/components/shop/TailorDetails.vue ------------>
<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import SectionHeader from '../layout/SectionHeader.vue'
import { db } from '../../db/client'
import { useRoute } from 'vue-router'

const props = defineProps({
  seller: {
    type: Object,
    required: false,
    default: () => ({})
  },
  userData: {
    type: Object,
    required: true
  },
  favoriteItems: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['go-back', 'go-reviews', 'go-feedback', 'go-details'])
const route = useRoute()

const loading = ref(true)
const hasConnected = ref(false)
const products = ref([])
const reviews = ref([])
const activeFilter = ref('all') // 'all', 'process', 'fabrics'
const tailorStats = ref({
  likes: 0,
  clients: 0
})
const sellerData = ref({ ...props.seller })

// Lookbook Fallback Data
const featuredCaseStudy = computed(() => ({
  title: "The Urban CEO Silhouette",
  quote: "I needed a suit that commands respect in a boardroom, but breathes in the Nairobi heat.",
  challenge: "Designing a full three-piece suit that maintained a rigid, formal structure without using heavy traditional wool.",
  execution: "We sourced organic, high-thread-count linen and used a deconstructed shoulder technique.",
  result: "A perfectly tailored, 40% lighter suit that won 'Best Bespoke Piece'.",
  image: products.value[0]?.image || "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80"
}))

const services = ref([
  { id: 1, name: "Full Bespoke Suit", price: "From TSh 850k", desc: "A fully custom 3-piece suit mapped to your exact physical geometry." },
  { id: 2, name: "Heritage Outerwear", price: "From TSh 400k", desc: "Custom Kente or Ankara coats with modern breathable linings." },
  { id: 3, name: "Precision Fitting", price: "Hourly Rate", desc: "Hardware-level adjustments and tailoring to your existing wardrobe." }
])

const socials = ref([
  { platform: 'instagram', url: '#' },
  { platform: 'twitter', url: '#' }
])

const quirk = computed(() => {
  if (sellerData.value.username === 'francis') return "I refuse to use sewing machines built after 1985. The older gears handle Kente cloth better."
  return "I find inspiration in the rhythmic patterns of traditional weaving songs."
})

const filteredProducts = computed(() => {
  if (activeFilter.value === 'process') {
    return products.value.filter(p => 
      p.name.toLowerCase().includes('process') || 
      p.description.toLowerCase().includes('process') ||
      p.categoryName === 'Process'
    )
  }
  if (activeFilter.value === 'fabrics') {
    return products.value.filter(p => 
      p.name.toLowerCase().includes('fabric') || 
      p.description.toLowerCase().includes('fabric') ||
      p.categoryName === 'Fabrics'
    )
  }
  return products.value
})

const highlights = computed(() => {
  const processItem = products.value.find(p => 
    p.name.toLowerCase().includes('process') || p.description.toLowerCase().includes('process')
  )
  const fabricItem = products.value.find(p => 
    p.name.toLowerCase().includes('fabric') || p.description.toLowerCase().includes('fabric')
  )
  
  return {
    process: processItem ? processItem.image : null,
    fabrics: fabricItem ? fabricItem.image : null
  }
})

const loadTailorData = async () => {
  const username = route.params.username
  if (!username) return

  try {
    loading.value = true
    const data = await db.runAction('get_tailor_details', { username });
    
    const s = data.tailor;
    sellerData.value = {
      ...sellerData.value,
      id: s.id,
      owner_id: s.id,
      name: (s.first_name || s.last_name) ? `${s.first_name || ''} ${s.last_name || ''}`.trim() : s.username,
      username: s.username,
      avatar: s.avatar,
      bio: s.gives,
      whatsapp: s.whatsapp,
      isVerified: true 
    }

    products.value = data.products.map(p => ({
      ...p,
      liked: props.favoriteItems.some(fav => fav.id === p.id)
    }))
    
    if (data.stats) {
      tailorStats.value.likes = data.stats.total_likes || 0
      tailorStats.value.clients = data.stats.total_clients || 0
    }

    reviews.value = data.reviews.map(r => ({
      ...r,
      author_name: (r.first_name || r.last_name) ? `${r.first_name || ''} ${r.last_name || ''}`.trim() : r.username
    }))

    // Update SEO Meta Tags
    const pageTitle = `${sellerData.value.name} | Alfietz Artisan Portfolio`;
    const pageDesc = sellerData.value.bio || `Explore the heritage portfolio of ${sellerData.value.name} on Alfietz. Discover bespoke African craftsmanship and custom-tailored fashion.`;
    
    document.title = pageTitle;
    
    const updateMeta = (name, content, attr = 'name') => {
      let meta = document.querySelector(`meta[${attr}="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    updateMeta('description', pageDesc);
    updateMeta('og:title', pageTitle, 'property');
    updateMeta('og:description', pageDesc, 'property');
    updateMeta('og:image', sellerData.value.avatar, 'property');
    updateMeta('twitter:title', pageTitle);
    updateMeta('twitter:description', pageDesc);
    updateMeta('twitter:image', sellerData.value.avatar);

  } catch (e) {
    console.error("Error fetching tailor details:", e)
  } finally {
    loading.value = false
  }
}

onMounted(loadTailorData)
watch(() => route.params.username, loadTailorData)

const connectToWhatsApp = () => {
  let phoneNumber = sellerData.value.whatsapp || "255700000000";
  let normalized = phoneNumber.startsWith('0') ? '255' + phoneNumber.slice(1) : phoneNumber.replace('+', '')
  
  const buyerName = props.userData.firstName || props.userData.username
  const tailorName = sellerData.value.name || sellerData.value.username

  const scissors = "✂️"
  const star = "🌟"
  const needle = "🧵"
  const sparkles = "✨"
  const pen = "✍️"

  const message = `Habari ${tailorName}! ${scissors}\n\nMy name is ${buyerName}, and I've been admiring your incredible work on Alfietz! ${star}\n\nI'm very interested in commissioning a custom piece from you and would love to discuss how we can bring a new heritage vision to life. ${needle}${sparkles}\n\nLooking forward to hearing from you!\n\nBest regards,\n${buyerName} ${pen}`;
  
  const url = `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
  hasConnected.value = true
}

const makeCall = () => {
  let phoneNumber = sellerData.value.whatsapp || "255700000000";
  window.open(`tel:${phoneNumber}`, '_self');
}
</script>

<template>
  <div v-if="loading" class="tailor-page skeleton-mode">
    <!-- Floating Heritage Status -->
    <div class="heritage-status-overlay">
      <div class="status-badge">
        <div class="status-icon-pulse">✨</div>
        <span class="status-text">Summoning Artisan Heritage...</span>
      </div>
    </div>

    <div class="top-nav-glass skeleton-nav">
      <div class="skeleton-back-btn"></div>
      <div class="skeleton-text-short"></div>
      <div class="skeleton-icon"></div>
    </div>

    <header class="ig-hero">
      <div class="hero-main">
        <div class="skeleton-avatar"></div>
        <div class="hero-stats">
          <div v-for="i in 3" :key="i" class="skeleton-stat-box">
            <div class="skeleton-num"></div>
            <div class="skeleton-label"></div>
          </div>
        </div>
      </div>
      <div class="hero-bio">
        <div class="skeleton-title"></div>
        <div class="skeleton-tag"></div>
        <div class="skeleton-bio-line"></div>
        <div class="skeleton-bio-line short"></div>
      </div>
      <div class="hero-actions">
        <div class="skeleton-action-btn"></div>
        <div class="skeleton-action-btn"></div>
      </div>
    </header>

    <div class="highlights-container">
      <div v-for="i in 3" :key="i" class="skeleton-highlight">
        <div class="skeleton-circle"></div>
        <div class="skeleton-label-mini"></div>
      </div>
    </div>

    <div class="grid-nav">
      <div class="grid-tab active"><div class="skeleton-icon-mini"></div></div>
      <div class="grid-tab"><div class="skeleton-icon-mini"></div></div>
    </div>

    <div class="ig-grid">
      <div v-for="i in 9" :key="i" class="skeleton-grid-post"></div>
    </div>
  </div>

  <div v-else-if="!sellerData.id" class="error-container">
    <div class="error-icon">🔍</div>
    <h3>Artisan Not Found</h3>
    <p>This path of the heritage seems to be lost.</p>
    <button class="primary-btn-mini" @click="$emit('go-back')">Go Back</button>
  </div>

  <div v-else class="tailor-page pattern-heritage animate-fade">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      <!-- NAVIGATION -->
      <nav class="flex items-center justify-between mb-10 text-sm uppercase tracking-widest font-semibold border-b border-white/10 pb-6">
          <a href="#" @click.prevent="$emit('go-back')" class="text-xl font-serif text-white tracking-normal capitalize flex items-center gap-2">
            <i class="fas fa-chevron-left text-xs opacity-50"></i>
            {{ sellerData.name.split(' ')[0] }}'s Atelier
          </a>
          
          <div class="hidden md:flex gap-8 text-gray-400">
              <a href="#work" class="text-alfie-accent hover:text-white transition">Work</a>
              <a href="#about" class="hover:text-white transition">About</a>
              <a href="#services" class="hover:text-white transition">Services</a>
              <a href="#contact" class="hover:text-white transition">Contact</a>
          </div>
          
          <button class="text-gray-400 hover:text-white transition" @click="$emit('go-reviews', sellerData.id)">
              <i class="fas fa-star text-lg"></i>
          </button>
      </nav>

      <!-- HERO SECTION -->
      <div class="relative w-full h-80 rounded-2xl overflow-hidden mb-16 bg-alfie-card flex items-center justify-center text-center">
          <img :src="sellerData.avatar" class="absolute inset-0 w-full h-full object-cover opacity-30 grayscale mix-blend-overlay">
          <div class="absolute inset-0 bg-gradient-to-b from-transparent to-alfie-dark"></div>
          
          <div class="relative z-10 max-w-3xl px-4">
              <h1 class="font-serif text-5xl md:text-7xl text-white mb-4 leading-tight">{{ sellerData.name }}</h1>
              <p class="text-alfie-accent tracking-[0.2em] text-sm uppercase font-bold">Master Tailor • Heritage Artisan</p>
          </div>
      </div>

      <!-- CASE STUDY SECTION -->
      <div id="about" class="mb-24 bg-alfie-card p-6 md:p-10 rounded-2xl border border-white/5">
          <h2 class="font-serif text-3xl text-white mb-8 flex items-center gap-4">
              <span class="w-8 h-px bg-alfie-accent"></span> Featured Case Study
          </h2>
          
          <div class="flex flex-col md:flex-row gap-10 items-center">
              <div class="md:w-1/2 w-full overflow-hidden rounded-xl shadow-2xl relative">
                  <img :src="featuredCaseStudy.image" class="w-full h-auto object-cover hover:scale-105 transition duration-700">
                  <div class="absolute top-4 left-4 bg-black/70 backdrop-blur-md px-3 py-1 rounded text-xs text-alfie-accent uppercase font-bold">Client Commission</div>
              </div>
              <div class="md:w-1/2 flex flex-col gap-6">
                  <div>
                      <h3 class="text-2xl font-serif text-white mb-2">{{ featuredCaseStudy.title }}</h3>
                      <p class="text-sm text-gray-400 italic">"{{ featuredCaseStudy.quote }}"</p>
                  </div>
                  
                  <div class="space-y-4 text-sm text-gray-300">
                      <div>
                          <span class="text-alfie-accent font-bold uppercase text-xs block mb-1">The Challenge:</span>
                          <p>{{ featuredCaseStudy.challenge }}</p>
                      </div>
                      <div>
                          <span class="text-alfie-accent font-bold uppercase text-xs block mb-1">The Execution:</span>
                          <p>{{ featuredCaseStudy.execution }}</p>
                      </div>
                      <div>
                          <span class="text-alfie-accent font-bold uppercase text-xs block mb-1">The Result:</span>
                          <p>{{ featuredCaseStudy.result }}</p>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      <div class="flex flex-col lg:flex-row gap-12 lg:gap-20 mt-12">
          
          <!-- SIDEBAR -->
          <div class="lg:w-1/3 flex flex-col gap-10">
              <div>
                  <h3 class="font-serif text-2xl mb-4 text-white border-b border-white/10 pb-4">The Artisan</h3>
                  <p class="text-gray-400 leading-relaxed text-sm mb-4">
                      {{ sellerData.bio || 'Preserving African heritage through every stitch and pattern. Custom commissions available.' }}
                  </p>
                  <div class="bg-white/5 p-4 rounded-lg border border-white/10">
                      <p class="text-xs text-gray-300 flex items-start gap-3">
                          <i class="fas fa-coffee text-alfie-accent mt-1"></i> 
                          <span><strong class="text-white">Studio Quirk:</strong> {{ quirk }}</span>
                      </p>
                  </div>
              </div>

              <!-- SERVICES -->
              <div id="services">
                  <h3 class="font-serif text-2xl mb-4 text-white border-b border-white/10 pb-4">Offerings</h3>
                  <div class="flex flex-col gap-3">
                      <div v-for="service in services" :key="service.id" class="p-4 bg-alfie-card hover:bg-white/5 transition rounded-sm border border-white/5">
                          <div class="flex justify-between items-center mb-2">
                              <span class="text-white font-semibold text-sm">{{ service.name }}</span>
                              <span class="text-alfie-accent text-xs font-bold">{{ service.price }}</span>
                          </div>
                          <p class="text-xs text-gray-400 leading-relaxed">{{ service.desc }}</p>
                      </div>
                  </div>
              </div>

              <!-- CONTACT -->
              <div id="contact">
                  <h3 class="font-serif text-2xl mb-4 text-white border-b border-white/10 pb-4">Start a Project</h3>
                  <div class="flex flex-col gap-4">
                      <a href="#" @click.prevent="connectToWhatsApp" class="group flex items-center justify-between p-4 bg-alfie-accent text-alfie-dark hover:bg-yellow-400 transition rounded-sm shadow-[0_0_15px_rgba(212,175,55,0.2)] hover:shadow-[0_0_25px_rgba(212,175,55,0.4)]">
                          <span class="text-sm font-bold tracking-wide">WhatsApp Inquiry</span>
                          <i class="fab fa-whatsapp text-xl animate-pulse"></i>
                      </a>
                  </div>
              </div>
          </div>

          <!-- PORTFOLIO GRID -->
          <div id="work" class="lg:w-2/3">
              <div class="flex justify-between items-end mb-8 border-b border-white/10 pb-4">
                  <h2 class="font-serif text-3xl text-white">Visual Archive</h2>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div v-for="product in products" :key="product.id" 
                       class="group relative overflow-hidden bg-alfie-card rounded-xl aspect-[4/5] shadow-lg cursor-pointer"
                       @click="$emit('go-details', product)">
                       
                      <img :src="product.image" class="w-full h-full object-cover group-hover:scale-105 transition duration-700">
                      
                      <div class="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition duration-500 flex flex-col justify-center p-8 text-center">
                          <h4 class="text-white font-serif text-2xl mb-2">{{ product.name }}</h4>
                          <p class="text-gray-400 text-sm mb-6">{{ product.description }}</p>
                          
                          <div class="grid grid-cols-2 gap-4 text-left border-t border-white/10 pt-4">
                              <div>
                                  <span class="text-[10px] text-alfie-accent uppercase tracking-widest block">Technique</span>
                                  <span class="text-xs text-white">{{ product.categoryName || 'Bespoke' }}</span>
                              </div>
                              <div>
                                  <span class="text-[10px] text-alfie-accent uppercase tracking-widest block">Material</span>
                                  <span class="text-xs text-white">{{ product.material || 'Organic Fabric' }}</span>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      <!-- STUDIO GALLERY -->
      <div id="gallery" class="mt-24 pt-12 border-t border-white/10 mb-12">
          <div class="flex justify-between items-end mb-8">
              <h2 class="font-serif text-3xl text-white">Studio Gallery</h2>
              <p class="text-sm text-gray-400">Raw textures, tools, & works in progress</p>
          </div>
          
          <div class="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
              <div v-for="(product, index) in products.slice(0, 8)" :key="index" class="break-inside-avoid relative group rounded-lg overflow-hidden cursor-pointer mb-4">
                  <img :src="product.image" class="w-full h-auto object-cover grayscale-[20%] group-hover:grayscale-0 transition duration-500">
                  
                  <div class="absolute top-3 left-3 bg-alfie-dark/90 backdrop-blur-sm text-alfie-accent text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider border border-alfie-accent/30 group-hover:opacity-0 transition duration-300 shadow-lg">
                      TSh {{ product.price }}
                  </div>

                  <div class="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col items-center justify-center p-4 text-center">
                      <i class="fas fa-expand text-white/40 text-xl absolute top-4 right-4 hover:text-white transition"></i>
                      
                      <h4 class="text-white font-serif text-lg mb-1">{{ product.name }}</h4>
                      <p class="text-alfie-accent font-bold mb-4">TSh {{ product.price }}</p>
                      <button class="bg-alfie-accent text-alfie-dark px-5 py-2 rounded-sm text-xs font-bold uppercase tracking-wider hover:bg-yellow-400 transition shadow-[0_0_10px_rgba(212,175,55,0.3)]"
                              @click.stop="$emit('go-details', product)">
                          View Piece
                      </button>
                  </div>
              </div>
          </div>
      </div>

      <!-- TESTIMONIALS -->
      <div class="mb-20">
          <h2 class="font-serif text-3xl text-white mb-8 text-center">Client Testimonials</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div v-for="review in reviews" :key="review.id" class="bg-alfie-card p-8 rounded-xl border border-white/5 relative">
                  <i class="fas fa-quote-left text-4xl text-white/5 absolute top-4 left-4"></i>
                  <div class="flex gap-1 text-alfie-accent text-xs mb-4">
                      <i v-for="n in 5" :key="n" class="fas fa-star" :class="{ 'opacity-30': n > review.rating }"></i>
                  </div>
                  <p class="text-gray-300 text-sm mb-6 relative z-10 italic leading-relaxed">"{{ review.text }}"</p>
                  <div class="flex items-center gap-3 border-t border-white/10 pt-4">
                      <img :src="review.author_avatar" class="w-8 h-8 rounded-full object-cover">
                      <p class="text-white text-xs font-bold uppercase tracking-widest">{{ review.author_name }}</p>
                  </div>
              </div>
              <div v-if="reviews.length === 0" class="col-span-full text-center py-10 bg-white/5 rounded-xl border border-dashed border-white/10">
                <p class="text-gray-400 italic">No testimonials yet. Be the first to share your experience!</p>
              </div>
          </div>
      </div>

      <!-- FOOTER -->
      <footer class="border-t border-white/10 pt-8 pb-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div class="text-xl font-serif text-white flex items-center gap-2">
              <i class="fas fa-cut text-alfie-accent"></i> Alfietz
          </div>
          <div class="flex gap-4">
              <a v-for="social in socials" :key="social.platform" :href="social.url" class="w-10 h-10 rounded-full bg-alfie-card border border-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-alfie-accent transition">
                  <i :class="'fab fa-' + social.platform"></i>
              </a>
          </div>
          <p class="text-xs text-gray-600">&copy; 2026 {{ sellerData.name }}. Powered by Alfietz.</p>
      </footer>
    </div>
  </div>
</template>

<style scoped>
/* LOOKBOOK SPECIFIC STYLES */
.font-serif { font-family: 'Playfair Display', Georgia, serif; }
.text-alfie-accent { color: #d4af37; }
.bg-alfie-accent { background-color: #d4af37; }
.bg-alfie-dark { background-color: #0a0705; }
.bg-alfie-card { background-color: #140f0a; }
.text-alfie-dark { color: #0a0705; }

.tailor-page {
  background-color: #0a0705;
  color: #f3f2f1;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E");
}

/* Custom Utilities for Masonry and Layout */
.columns-1 { column-count: 1; }
@media (min-width: 640px) { .sm:columns-2 { column-count: 2; } }
@media (min-width: 768px) { .md:columns-3 { column-count: 3; } }
@media (min-width: 1024px) { .lg:columns-4 { column-count: 4; } }
.break-inside-avoid { break-inside: avoid; }

/* Tailwind-like shim for common classes used in template */
.max-w-6xl { max-width: 72rem; }
.mx-auto { margin-left: auto; margin-right: auto; }
.px-4 { padding-left: 1rem; padding-right: 1rem; }
.py-10 { padding-top: 2.5rem; padding-bottom: 2.5rem; }
.flex { display: flex; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.mb-10 { margin-bottom: 2.5rem; }
.text-sm { font-size: 0.875rem; }
.uppercase { text-transform: uppercase; }
.tracking-widest { letter-spacing: 0.1em; }
.font-semibold { font-weight: 600; }
.border-b { border-bottom-width: 1px; }
.border-white\/10 { border-color: rgba(255, 255, 255, 0.1); }
.pb-6 { padding-bottom: 1.5rem; }
.text-xl { font-size: 1.25rem; }
.hidden { display: none; }
@media (min-width: 768px) { .md\:flex { display: flex; } }
.gap-8 { gap: 2rem; }
.text-gray-400 { color: #9ca3af; }
.hover\:text-white:hover { color: #ffffff; }
.transition { transition-property: all; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
.relative { position: relative; }
.w-full { width: 100%; }
.h-80 { height: 20rem; }
.rounded-2xl { border-radius: 1rem; }
.overflow-hidden { overflow: hidden; }
.mb-16 { margin-bottom: 4rem; }
.justify-center { justify-content: center; }
.text-center { text-align: center; }
.absolute { position: absolute; }
.inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
.h-full { height: 100%; }
.object-cover { object-fit: cover; }
.opacity-30 { opacity: 0.3; }
.grayscale { filter: grayscale(100%); }
.mix-blend-overlay { mix-blend-mode: overlay; }
.bg-gradient-to-b { background-image: linear-gradient(to bottom, var(--tw-gradient-stops)); }
.from-transparent { --tw-gradient-from: transparent; --tw-gradient-to: rgb(0 0 0 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.to-alfie-dark { --tw-gradient-to: #0a0705; }
.z-10 { z-index: 10; }
.max-w-3xl { max-width: 48rem; }
.mb-4 { margin-bottom: 1rem; }
.leading-tight { line-height: 1.25; }
.text-5xl { font-size: 3rem; }
@media (min-width: 768px) { .md\:text-7xl { font-size: 4.5rem; } }
.text-white { color: #ffffff; }
.tracking-\[0\.2em\] { letter-spacing: 0.2em; }
.font-bold { font-weight: 700; }
.mb-24 { margin-bottom: 6rem; }
.p-6 { padding: 1.5rem; }
@media (min-width: 768px) { .md\:p-10 { padding: 2.5rem; } }
.border { border-width: 1px; }
.border-white\/5 { border-color: rgba(255, 255, 255, 0.05); }
.text-3xl { font-size: 1.875rem; }
.mb-8 { margin-bottom: 2rem; }
.gap-4 { gap: 1rem; }
.w-8 { width: 2rem; }
.h-px { height: 1px; }
.flex-col { flex-direction: column; }
@media (min-width: 768px) { .md\:flex-row { flex-direction: row; } }
.gap-10 { gap: 2.5rem; }
@media (min-width: 768px) { .md\:w-1\/2 { width: 50%; } }
.rounded-xl { border-radius: 0.75rem; }
.shadow-2xl { box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25); }
.hover\:scale-105:hover { transform: scale(1.05); }
.duration-700 { transition-duration: 700ms; }
.top-4 { top: 1rem; }
.left-4 { left: 1rem; }
.bg-black\/70 { background-color: rgb(0 0 0 / 0.7); }
.backdrop-blur-md { backdrop-filter: blur(12px); }
.px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
.py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
.rounded { border-radius: 0.25rem; }
.text-xs { font-size: 0.75rem; }
.text-2xl { font-size: 1.5rem; }
.mb-2 { margin-bottom: 0.5rem; }
.text-gray-400 { color: #9ca3af; }
.italic { font-style: italic; }
.space-y-4 > :not([hidden]) ~ :not([hidden]) { margin-top: 1rem; }
.text-gray-300 { color: #d1d5db; }
.block { display: block; }
.mb-1 { margin-bottom: 0.25rem; }
@media (min-width: 1024px) { .lg\:flex-row { flex-direction: row; } }
.lg\:gap-20 { gap: 5rem; }
@media (min-width: 1024px) { .lg\:w-1\/3 { width: 33.333333%; } }
.leading-relaxed { line-height: 1.625; }
.bg-white\/5 { background-color: rgba(255, 255, 255, 0.05); }
.p-4 { padding: 1rem; }
.rounded-lg { border-radius: 0.5rem; }
.items-start { align-items: flex-start; }
.gap-3 { gap: 0.75rem; }
.mt-1 { margin-top: 0.25rem; }
.hover\:bg-white\/5:hover { background-color: rgba(255, 255, 255, 0.05); }
.rounded-sm { border-radius: 0.125rem; }
.font-semibold { font-weight: 600; }
.bg-alfie-accent { background-color: #d4af37; }
.hover\:bg-yellow-400:hover { background-color: #fbbf24; }
.shadow-\[0_0_15px_rgba\(212\,175\,55\,0\.2\)\] { box-shadow: 0 0 15px rgba(212,175,55,0.2); }
.hover\:shadow-\[0_0_25px_rgba\(212\,175\,55\,0\.4\)\]:hover { box-shadow: 0 0 25px rgba(212,175,55,0.4); }
.animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
@media (min-width: 1024px) { .lg\:w-2\/3 { width: 66.666667%; } }
.border-b { border-bottom-width: 1px; }
.grid { display: grid; }
.grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
@media (min-width: 768px) { .md\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
.gap-6 { gap: 1.5rem; }
.aspect-\[4\/5\] { aspect-ratio: 4 / 5; }
.shadow-lg { box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1); }
.bg-black\/80 { background-color: rgb(0 0 0 / 0.8); }
.opacity-0 { opacity: 0; }
.group:hover .group-hover\:opacity-100 { opacity: 1; }
.duration-500 { transition-duration: 500ms; }
.p-8 { padding: 2rem; }
.border-t { border-top-width: 1px; }
.pt-4 { padding-top: 1rem; }
.text-\[10px\] { font-size: 10px; }
.mt-24 { margin-top: 6rem; }
.pt-12 { padding-top: 3rem; }
.grayscale-\[20\%\] { filter: grayscale(20%); }
.group:hover .group-hover\:grayscale-0 { filter: grayscale(0); }
.top-3 { top: 0.75rem; }
.left-3 { left: 0.75rem; }
.bg-alfie-dark\/90 { background-color: rgba(10, 7, 5, 0.9); }
.backdrop-blur-sm { backdrop-filter: blur(4px); }
.tracking-wider { letter-spacing: 0.05em; }
.border-alfie-accent\/30 { border-color: rgba(212, 175, 55, 0.3); }
.duration-300 { transition-duration: 300ms; }
.bg-black\/70 { background-color: rgba(0, 0, 0, 0.7); }
.right-4 { right: 1rem; }
.text-white\/40 { color: rgba(255, 255, 255, 0.4); }
.text-lg { font-size: 1.125rem; }
.mb-4 { margin-bottom: 1rem; }
.px-5 { padding-left: 1.25rem; padding-right: 1.25rem; }
.py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
.shadow-\[0_0_10px_rgba\(212\,175\,55\,0\.3\)\] { box-shadow: 0 0 10px rgba(212, 175, 55, 0.3); }
.mb-20 { margin-bottom: 5rem; }
.text-4xl { font-size: 2.25rem; }
.text-white\/5 { color: rgba(255, 255, 255, 0.05); }
.gap-1 { gap: 0.25rem; }
.mb-6 { margin-bottom: 1.5rem; }
.w-10 { width: 2.5rem; }
.h-10 { height: 2.5rem; }
.text-gray-600 { color: #4b5563; }

/* LOADING & SKELETON STYLES */
.heritage-status-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  pointer-events: none;
}

.status-badge {
  background: rgba(13, 8, 5, 0.8);
  backdrop-filter: blur(12px);
  padding: 16px 24px;
  border-radius: 100px;
  border: 1px solid var(--accent-amber);
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.5), 0 0 20px var(--accent-glow);
  animation: badgePop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.status-icon-pulse {
  font-size: 20px;
  animation: iconPulse 1.5s ease-in-out infinite;
}

.status-text {
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  font-weight: 700;
  color: var(--text-amber);
  letter-spacing: 1px;
}

@keyframes badgePop {
  from { transform: scale(0.8) translateY(20px); opacity: 0; }
  to { transform: scale(1) translateY(0); opacity: 1; }
}

@keyframes iconPulse {
  0% { transform: scale(1); filter: drop-shadow(0 0 0px var(--accent-amber)); }
  50% { transform: scale(1.2); filter: drop-shadow(0 0 10px var(--accent-amber)); }
  100% { transform: scale(1); filter: drop-shadow(0 0 0px var(--accent-amber)); }
}

.skeleton-mode {
  pointer-events: none;
  background: var(--wood-deep);
}

.skeleton-nav {
  justify-content: space-between;
  padding: 0 16px;
}

.skeleton-back-btn { width: 40px; height: 40px; border-radius: 50%; background: var(--wood-walnut); }
.skeleton-text-short { width: 100px; height: 16px; background: var(--wood-walnut); border-radius: 4px; }
.skeleton-icon { width: 24px; height: 24px; background: var(--wood-walnut); border-radius: 4px; }

.skeleton-avatar {
  width: 86px;
  height: 86px;
  border-radius: 50%;
  background: var(--wood-walnut);
}

.skeleton-stat-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.skeleton-num { width: 30px; height: 18px; background: var(--wood-walnut); border-radius: 4px; }
.skeleton-label { width: 50px; height: 12px; background: var(--wood-walnut); border-radius: 4px; }

.skeleton-title { width: 180px; height: 20px; background: var(--wood-walnut); border-radius: 4px; margin-bottom: 8px; }
.skeleton-tag { width: 120px; height: 14px; background: var(--wood-walnut); border-radius: 4px; margin-bottom: 12px; }
.skeleton-bio-line { width: 100%; height: 14px; background: var(--wood-walnut); border-radius: 4px; margin-bottom: 6px; }
.skeleton-bio-line.short { width: 60%; }

.skeleton-action-btn { flex: 1; height: 36px; background: var(--wood-walnut); border-radius: 8px; }

.skeleton-circle { width: 60px; height: 60px; border-radius: 50%; background: var(--wood-walnut); }
.skeleton-label-mini { width: 40px; height: 10px; background: var(--wood-walnut); border-radius: 4px; margin-top: 6px; }

.skeleton-icon-mini { width: 20px; height: 20px; background: var(--wood-walnut); border-radius: 4px; }

.skeleton-grid-post {
  aspect-ratio: 1;
  background: var(--wood-walnut);
}

.skeleton-mode [class*="skeleton-"] {
  position: relative;
  overflow: hidden;
  background-color: rgba(255, 255, 255, 0.03);
}

.skeleton-mode [class*="skeleton-"]::after {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  transform: translateX(-100%);
  background-image: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0,
    rgba(255, 255, 255, 0.05) 20%,
    rgba(255, 255, 255, 0.1) 60%,
    rgba(255, 255, 255, 0)
  );
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}

.loading-container, .error-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--wood-deep);
  color: var(--text-muted);
  gap: 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(217, 164, 4, 0.1);
  border-top-color: var(--accent-amber);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-icon {
  font-size: 64px;
  opacity: 0.5;
}

.primary-btn-mini {
  background: var(--accent-amber);
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
}

.stat-box.clickable {
  cursor: pointer;
  transition: opacity 0.2s;
}

.stat-box.clickable:hover {
  opacity: 0.7;
}

.highlight-circle.active {
  border-color: var(--accent-amber);
  box-shadow: 0 0 10px var(--accent-glow);
}

.highlight-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.empty-grid-cta {
  padding: 60px 20px;
  text-align: center;
  background: var(--wood-walnut);
  border-top: 1px solid var(--glass-border);
}

.empty-grid-cta p {
  color: var(--text-muted);
  font-size: 14px;
  margin-bottom: 12px;
}

.top-nav-glass {
  position: sticky;
  top: 0;
  height: 60px;
  background: var(--glass-bg);
  backdrop-filter: blur(15px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  z-index: 100;
  border-bottom: 1px solid var(--glass-border);
}

.header-username {
  font-weight: 800;
  font-size: 16px;
  letter-spacing: -0.5px;
}

.ig-hero {
  padding: 20px 16px;
}

.hero-main {
  display: flex;
  align-items: center;
  gap: 32px;
  margin-bottom: 16px;
}

.avatar-ring {
  position: relative;
  width: 86px;
  height: 86px;
  padding: 4px;
  border-radius: 50%;
  background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
}

.avatar-ring.verified {
  background: var(--accent-amber);
}

.profile-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--wood-deep);
}

.verify-badge-small {
  position: absolute;
  bottom: 0;
  right: 0;
  background: #3897f0;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid var(--wood-deep);
}

.hero-stats {
  display: flex;
  gap: 24px;
  flex: 1;
  justify-content: center;
}

.stat-box {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-num {
  font-size: 18px;
  font-weight: 800;
}

.stat-label {
  font-size: 12px;
  color: var(--text-muted);
}

.back-btn {
  background-color: var(--wood-walnut) !important;
  border: 1px solid var(--glass-border) !important;
  color: var(--text-primary) !important;
  transition: all 0.2s ease !important;
}

.icon-btn-round {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
}
</style>