import { onUnmounted } from 'vue'

const DEFAULTS = {
  title: 'Alfietz - Discover the Soul of African Craftsmanship',
  description: 'Connect directly with master artisans. Discover bespoke African heritage crafts, custom-tailored fashion, and unique handmade trends.',
  ogTitle: 'Alfietz - Discover the Soul of African Craftsmanship',
  ogDescription: 'Bespoke fashion and heritage crafts delivered from the hands of master tailors to your doorstep.',
  ogImage: 'https://alfietz.shop/hero.png',
  ogUrl: 'https://alfietz.shop/',
}

function setMeta(attr, name, content) {
  const isProp = attr === 'property'
  const sel = isProp ? `meta[property="${name}"]` : `meta[name="${name}"]`
  let el = document.querySelector(sel)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, name)
    document.head.appendChild(el)
  }
  if (content) {
    el.setAttribute('content', content)
  } else {
    el.parentNode?.removeChild(el)
  }
}

let currentJsonld = null

function injectJsonld(data) {
  if (currentJsonld) {
    currentJsonld.parentNode?.removeChild(currentJsonld)
    currentJsonld = null
  }
  if (!data) return
  const el = document.createElement('script')
  el.setAttribute('type', 'application/ld+json')
  el.textContent = JSON.stringify(data)
  document.head.appendChild(el)
  currentJsonld = el
}

function applySeo(seo = {}) {
  const title = seo.title || DEFAULTS.title
  const description = seo.description || DEFAULTS.description
  const ogTitle = seo.ogTitle || seo.title || DEFAULTS.ogTitle
  const ogDescription = seo.ogDescription || seo.description || DEFAULTS.ogDescription
  const ogImage = seo.ogImage || DEFAULTS.ogImage
  const ogUrl = seo.ogUrl || DEFAULTS.ogUrl

  document.title = title
  setMeta('name', 'description', description)
  setMeta('property', 'og:title', ogTitle)
  setMeta('property', 'og:description', ogDescription)
  setMeta('property', 'og:image', ogImage)
  setMeta('property', 'og:url', ogUrl)
  setMeta('name', 'twitter:title', ogTitle)
  setMeta('name', 'twitter:description', ogDescription)
  setMeta('name', 'twitter:image', ogImage)

  injectJsonld(seo.jsonld || null)
}

export function useSeo(seoInitial = {}) {
  if (seoInitial && Object.keys(seoInitial).length > 0) {
    applySeo(seoInitial)
  }

  onUnmounted(() => {
    applySeo(DEFAULTS)
  })

  return { updateSeo: applySeo }
}
