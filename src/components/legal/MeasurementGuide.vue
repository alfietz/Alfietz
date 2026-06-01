<!-------- (MeasurementGuide.vue) ./src/components/legal/MeasurementGuide.vue ------------>
<script setup>
defineEmits(['go-back'])
</script>

<template>
  <div class="document-page pattern-heritage animate-fade">
    <div class="header-row">
      <button class="back-btn" @click="$emit('go-back')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <h1 class="title">Measurement Guide</h1>
    </div>

    <div class="content-scroll">
      <p class="last-updated">Last Updated: May 2026</p>
      
      <p>To ensure your custom heritage piece fits perfectly, please follow this guide when taking measurements. We recommend using a flexible tape measure and having a friend help for accuracy.</p>

      <h2>1. For Garments (Tops & Dresses)</h2>
      <ul>
        <li><strong>Chest/Bust:</strong> Measure around the fullest part of your chest, keeping the tape horizontal.</li>
        <li><strong>Waist:</strong> Measure around your natural waistline (the narrowest part), usually just above the navel.</li>
        <li><strong>Shoulder Width:</strong> Measure from the edge of one shoulder bone across the back to the other shoulder bone.</li>
        <li><strong>Sleeve Length:</strong> Measure from the shoulder bone down to your wrist (or desired length).</li>
      </ul>

      <h2>2. For Bottoms (Trousers & Skirts)</h2>
      <ul>
        <li><strong>Hips:</strong> Measure around the fullest part of your hips.</li>
        <li><strong>Inseam:</strong> Measure from the crotch point down to the ankle bone.</li>
        <li><strong>Total Length:</strong> Measure from the waist down to the desired hemline.</li>
      </ul>

      <h2>3. General Tips</h2>
      <ul>
        <li><strong>Keep it Level:</strong> Ensure the tape measure is always parallel to the floor.</li>
        <li><strong>Don't Pull Too Tight:</strong> The tape should be snug but not digging into your skin.</li>
        <li><strong>Wear Thin Clothing:</strong> Take measurements while wearing thin undergarments or light clothing for the best fit.</li>
      </ul>

      <div class="pro-tip">
        <h3>Pro Tip</h3>
        <p>When ordering on Alfietz, you can paste these measurements into the "Special Requirements" box during your WhatsApp order!</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.document-page {
  background-color: var(--wood-deep);
  min-height: 100vh;
  padding: 40px 24px;
  max-width: 800px;
  margin: 0 auto;
}

.header-row {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 40px;
}

.back-btn {
  background-color: var(--wood-walnut) !important;
  border: 1px solid var(--glass-border) !important;
  color: var(--text-primary) !important;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease !important;
}

.back-btn:hover {
  background-color: var(--wood-polished) !important;
  border-color: var(--accent-amber) !important;
}

.title {
  font-size: 24px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
}

.content-scroll {
  padding-bottom: 40px;
}

.last-updated {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 32px;
  font-style: italic;
  display: block;
  border-left: 2px solid var(--accent-amber);
  padding-left: 12px;
}

h2 {
  font-size: 18px;
  font-weight: 800;
  color: var(--text-amber);
  margin: 32px 0 12px 0;
  text-transform: uppercase;
  letter-spacing: 1px;
}

p {
  font-size: 15px;
  color: var(--text-muted);
  line-height: 1.7;
  margin: 0 0 20px 0;
}

ul {
  padding-left: 20px;
  margin-bottom: 24px;
}

li {
  font-size: 15px;
  color: var(--text-muted);
  line-height: 1.7;
  margin-bottom: 12px;
}

strong {
  color: var(--text-primary);
  font-weight: 700;
}

.pro-tip {
  background: var(--wood-walnut);
  padding: 24px;
  border-radius: 16px;
  border: 1px solid var(--accent-amber);
  margin-top: 40px;
}

.pro-tip h3 {
  font-size: 16px;
  font-weight: 800;
  color: var(--accent-amber);
  margin: 0 0 8px 0;
  text-transform: uppercase;
}

.pro-tip p {
  margin-bottom: 0;
  font-style: italic;
}
</style>
