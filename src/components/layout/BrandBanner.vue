<script setup>
defineProps({
  t: {
    type: Function,
    required: true
  }
})
</script>

<template>
  <div class="brand-banner pattern-heritage">
    <div class="banner-glass">
      <div class="logo-showcase">
        <div class="logo-aura">
          <div class="aura-ring ring-1"></div>
          <div class="aura-ring ring-2"></div>
          <div class="aura-ring ring-3"></div>
          
          <div class="logo-vault">
            <img src="../../assets/logo.png" alt="Alfie Logo" class="banner-logo-img" />
            <div class="vault-glow"></div>
            <div class="tech-scanner"></div>
          </div>
        </div>
      </div>

      <div class="banner-content">
        <div class="heritage-tag">
          <span class="dot"></span>
          EST. 2026
        </div>
        <h1 class="banner-title">
          <span class="title-top">ALFIETZ</span>
          <span class="title-bottom">HERITAGE TECH</span>
        </h1>
        <p class="banner-subtitle">
          Weaving the future of African craftsmanship with precision and soul.
        </p>
        
        <div class="banner-actions">
          <div class="heritage-line"></div>
          <div class="digital-coordinates">
            <span>AFR // 001</span>
            <span class="separator">|</span>
            <span>HTG // LMTD</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Decorative Tech Elements -->
    <div class="tech-bracket top-left"></div>
    <div class="tech-bracket top-right"></div>
    <div class="tech-bracket bottom-left"></div>
    <div class="tech-bracket bottom-right"></div>
  </div>
</template>

<style scoped>
.brand-banner {
  position: relative;
  width: 100%;
  min-height: 340px;
  background: linear-gradient(135deg, var(--wood-walnut) 0%, var(--wood-deep) 100%);
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--glass-border);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-10);
  box-shadow: 0 20px 50px rgba(0,0,0,0.6);
  margin-bottom: var(--space-12);
}

@media (max-width: 768px) {
  .brand-banner {
    flex-direction: column;
    padding: var(--space-10) var(--space-6);
    min-height: auto;
    text-align: center;
  }
}

.banner-glass {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: var(--space-12);
  width: 100%;
  max-width: 1000px;
}

@media (max-width: 768px) {
  .banner-glass {
    flex-direction: column;
    gap: var(--space-8);
  }
}

/* Logo Aura & Vault */
.logo-showcase {
  flex-shrink: 0;
}

.logo-aura {
  position: relative;
  width: 180px;
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 480px) {
  .logo-aura {
    width: 140px;
    height: 140px;
  }
}

.aura-ring {
  position: absolute;
  border: 1px solid rgba(217, 119, 6, 0.15);
  border-radius: 50%;
}

.ring-1 { width: 100%; height: 100%; animation: spin-slow 25s linear infinite; }
.ring-2 { width: 85%; height: 85%; animation: spin-slow 20s linear infinite reverse; opacity: 0.6; }
.ring-3 { width: 70%; height: 70%; animation: spin-slow 30s linear infinite; opacity: 0.4; }

.logo-vault {
  position: relative;
  width: 100px;
  height: 100px;
  background: #FDFBF7;
  border-radius: 50%;
  padding: var(--space-4);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 30px rgba(0,0,0,0.1), 0 0 60px var(--accent-glow);
  border: 4px solid var(--accent-amber);
  z-index: 5;
  overflow: hidden;
}

@media (max-width: 480px) {
  .logo-vault {
    width: 80px;
    height: 80px;
    padding: var(--space-3);
  }
}

.banner-logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  position: relative;
  z-index: 2;
}

.vault-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle, var(--accent-glow) 0%, transparent 70%);
  opacity: 0.4;
  z-index: 1;
}

.tech-scanner {
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(to right, transparent, rgba(217,119,6,0.2), transparent);
  transform: skewX(-20deg);
  animation: scanner 3s ease-in-out infinite;
  z-index: 3;
}

/* Content */
.banner-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.heritage-tag {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-caption);
  font-weight: 800;
  color: var(--accent-amber);
  letter-spacing: 2px;
  margin-bottom: var(--space-3);
}

@media (max-width: 768px) {
  .heritage-tag {
    justify-content: center;
  }
}

.dot {
  width: 6px;
  height: 6px;
  background-color: var(--accent-amber);
  border-radius: 50%;
  box-shadow: 0 0 8px var(--accent-glow);
}

.banner-title {
  display: flex;
  flex-direction: column;
  margin-bottom: var(--space-4);
}

.title-top {
  font-size: var(--text-display);
  font-weight: 900;
  color: var(--text-primary);
  letter-spacing: 4px;
  line-height: var(--leading-tight);
}

.title-bottom {
  font-size: var(--text-h2);
  font-weight: 700;
  color: var(--text-amber);
  letter-spacing: 8px;
  margin-top: var(--space-1);
}

@media (max-width: 480px) {
  .title-top { font-size: var(--text-display); }
  .title-bottom { font-size: var(--text-body); letter-spacing: 6px; }
}

.banner-subtitle {
  font-size: var(--text-body-lg);
  color: var(--text-muted);
  max-width: 400px;
  line-height: var(--leading-relaxed);
  margin-bottom: var(--space-8);
}

@media (max-width: 768px) {
  .banner-subtitle {
    margin: 0 auto var(--space-8);
  }
}

.banner-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.heritage-line {
  width: 60px;
  height: 2px;
  background: var(--accent-amber);
  box-shadow: 0 0 10px var(--accent-glow);
}

@media (max-width: 768px) {
  .heritage-line {
    margin: 0 auto;
  }
}

.digital-coordinates {
  display: flex;
  gap: var(--space-3);
  font-family: 'JetBrains Mono', monospace;
  font-size: var(--text-caption);
  color: var(--text-muted);
  opacity: 0.6;
}

@media (max-width: 768px) {
  .digital-coordinates {
    justify-content: center;
  }
}

/* Tech Brackets */
.tech-bracket {
  position: absolute;
  width: 20px;
  height: 20px;
  border-color: rgba(217, 119, 6, 0.3);
  border-style: solid;
  pointer-events: none;
}

.top-left { top: 20px; left: 20px; border-width: 2px 0 0 2px; }
.top-right { top: 20px; right: 20px; border-width: 2px 2px 0 0; }
.bottom-left { bottom: 20px; left: 20px; border-width: 0 0 2px 2px; }
.bottom-right { bottom: 20px; right: 20px; border-width: 0 2px 2px 0; }

@keyframes scanner {
  0% { left: -100%; }
  100% { left: 200%; }
}
</style>