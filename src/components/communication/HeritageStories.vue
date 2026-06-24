<script setup>
import { ref } from 'vue'

defineEmits(['go-back', 'go-details', 'go-explore'])

const stories = ref([
  {
    id: 1,
    title: "The Silent Language of Kente",
    excerpt: "Every color and pattern in a Kente cloth tells a deep story of royalty, history, and social status...",
    image: "https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?q=80&w=800",
    date: "May 12, 2026",
    category: "Weaving",
    content: "Kente is more than just a fabric; it is a visual representation of history and philosophy. Originally worn only by kings and queens, the 'Adweneasa' pattern, for example, means 'my skill is exhausted'—representing the ultimate achievement in weaving..."
  },
  {
    id: 2,
    title: "Meet the Artisan: Moussa the Agbada Master",
    excerpt: "From a small workshop in West Africa to dressing global leaders, Moussa shares his journey of preserving the grand Agbada...",
    image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=800",
    date: "May 10, 2026",
    category: "Artisan Spotlight",
    content: "Moussa has been sewing for over 30 years. His specialty is the Agbada—a four-piece male attire that symbolizes power and prestige. 'It is not just about the size,' he says, 'it is about the weight of the tradition you carry on your shoulders.'"
  },
  {
    id: 3,
    title: "Modern Silhouettes, Ancient Techniques",
    excerpt: "How contemporary African designers are using traditional beadwork to create futuristic runway looks...",
    image: "https://images.unsplash.com/photo-1532332248682-206cc786359f?q=80&w=800",
    date: "May 08, 2026",
    category: "Trends",
    content: "The fusion of old and new is where the magic happens. We're seeing Maasai beadwork integrated into leather jackets and Ankara prints used in structured blazers. This is the future of African fashion—rooted in the past but looking forward."
  }
])
</script>

<template>
  <div class="stories-page">
    <div class="header-row">
      <button class="back-btn" @click="$emit('go-back')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <h1 class="title">Heritage Stories</h1>
    </div>

    <div class="content-scroll">
      <p class="section-intro">Dive deep into the soul of African craftsmanship. Discover the stories behind the stitches and the artisans behind the trends.</p>

      <div class="stories-list">
        <div v-for="story in stories" :key="story.id" class="story-card">
          <div class="story-image-box">
            <img :src="story.image" :alt="story.title" class="story-img" />
            <span class="story-tag">{{ story.category }}</span>
          </div>
          <div class="story-info">
            <span class="story-date">{{ story.date }}</span>
            <h2 class="story-title">{{ story.title }}</h2>
            <p class="story-excerpt">{{ story.excerpt }}</p>
            <button class="read-more-btn">Read the Full Story →</button>
          </div>
        </div>
      </div>

      <div class="community-callout">
        <h3>Have a Heritage Story?</h3>
        <p>Are you an artisan or a collector with a story to tell? We want to weave your voice into The Tribe.</p>
        <button class="feedback-link-btn" @click="$emit('go-feedback')">Submit Your Story</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stories-page { background-color: var(--wood-deep); min-height: 100vh; padding: var(--space-6) var(--space-5); display: flex; flex-direction: column; }
.header-row { display: flex; align-items: center; gap: var(--space-4); margin-bottom: var(--space-6); flex-shrink: 0; }
.title { font-size: var(--text-h1); font-weight: 600; color: var(--text-primary); margin: 0; }

.content-scroll { flex: 1; overflow-y: auto; padding-bottom: var(--space-10); }
.section-intro { font-size: var(--text-body); color: var(--text-muted); line-height: var(--leading-relaxed); margin-bottom: var(--space-8); }

.stories-list { display: flex; flex-direction: column; gap: var(--space-8); }

.story-card { 
  background: var(--wood-walnut); 
  border-radius: var(--radius-lg); 
  overflow: hidden; 
  border: 1px solid var(--glass-border);
  transition: transform 0.3s ease;
}

.story-image-box { position: relative; height: 200px; }
.story-img { width: 100%; height: 100%; object-fit: cover; }
.story-tag { 
  position: absolute; top: 16px; left: 16px; 
  background: var(--accent-amber); color: white; 
  padding: var(--space-1) var(--space-3); border-radius: var(--radius-md); 
  font-size: var(--text-caption); font-weight: 700; text-transform: uppercase; 
}

.story-info { padding: var(--space-5); }
.story-date { font-size: var(--text-caption); color: var(--text-muted); display: block; margin-bottom: var(--space-2); }
.story-title { font-size: var(--text-h2); font-weight: 700; color: var(--text-primary); margin-bottom: var(--space-3); line-height: var(--leading-tight); }
.story-excerpt { font-size: var(--text-body); color: var(--text-muted); line-height: var(--leading-relaxed); margin-bottom: var(--space-5); }

.read-more-btn { 
  background: none; border: none; 
  color: var(--text-amber); font-weight: 700; 
  padding: 0; cursor: pointer; font-size: var(--text-body); 
}

.community-callout { 
  margin-top: var(--space-12); padding: var(--space-6); 
  background: linear-gradient(135deg, var(--wood-polished), var(--wood-deep)); 
  border-radius: var(--radius-lg); border: 1px solid var(--accent-amber); text-align: center;
}
.community-callout h3 { font-size: var(--text-h2); font-weight: 700; color: var(--text-amber); margin-bottom: var(--space-3); }
.community-callout p { font-size: var(--text-body); color: var(--text-primary); line-height: var(--leading-snug); margin-bottom: var(--space-5); }
.feedback-link-btn { 
  background: var(--accent-amber); color: white; 
  border: none; padding: var(--space-3) var(--space-6); border-radius: var(--radius-md); 
  font-weight: 700; cursor: pointer; 
}

.back-btn {
  background-color: var(--wood-walnut) !important;
  border: 1px solid var(--glass-border) !important;
  color: var(--text-primary) !important;
  transition: all 0.2s ease !important;
}

.back-btn:hover {
  background-color: var(--wood-polished) !important;
  border-color: var(--accent-amber) !important;
}

.back-btn {
  background-color: var(--wood-walnut) !important;
  border: 1px solid var(--glass-border) !important;
  color: var(--text-primary) !important;
  transition: all 0.2s ease !important;
}

.back-btn:hover {
  background-color: var(--wood-polished) !important;
  border-color: var(--accent-amber) !important;
}
</style>