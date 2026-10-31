<script setup lang="ts">
defineProps<{
  title?: string
}>()

const emit = defineEmits<{
  toggleSidebar: []
}>()
</script>

<template>
  <header class="app-bar">
    <div class="app-bar-left">
      <button class="icon-btn" @click="emit('toggleSidebar')" aria-label="Alternar menú lateral">
        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
      <span class="app-bar-title">{{ title ?? 'Gerep Validator' }}</span>
    </div>

    <!-- Ícono minimalista en contorno rosa (cara de rana + reporte) -->
    <div class="app-bar-center" title="Gerep Validator">
      <svg
        class="frog-outline-icon"
        viewBox="0 0 64 64"
        width="28"
        height="28"
        fill="none"
        stroke="#f472b6"
        stroke-width="3.2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-label="Gerep Validator Icon"
      >
        <path d="M12 28 C8 20, 12 10, 21 12 C25 13, 27 16, 28 19 L36 19 C37 16, 39 13, 43 12 C52 10, 56 20, 52 28 C55 33, 54 42, 48 46 C43 50, 21 50, 16 46 C10 42, 9 33, 12 28 Z" />
        <circle cx="20" cy="19" r="4" />
        <circle cx="44" cy="19" r="4" />
        <circle cx="20" cy="19" r="1.5" fill="#ffffff" stroke="none" />
        <circle cx="44" cy="19" r="1.5" fill="#ffffff" stroke="none" />
        <path d="M22 34 Q32 41 42 34" />
        <rect x="38" y="34" width="20" height="24" rx="3" fill="#0f172a" stroke="#f472b6" stroke-width="3" />
        <line x1="43" y1="41" x2="53" y2="41" stroke-width="2.6" />
        <line x1="43" y1="46.5" x2="53" y2="46.5" stroke-width="2.6" />
        <polyline points="43 52.5 46 55 53 49.5" stroke-width="2.6" />
      </svg>
    </div>

    <div class="app-bar-right">
      <div class="user-badge">
        <span class="user-avatar" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </span>
        <span class="user-name">luz karina lopez saavedra</span>
        <span class="user-alias">(alias kakaroto o chumeka)</span>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-bar {
  height: 44px;
  background-color: #0f172a;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0.85rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  z-index: 10;
  flex-shrink: 0;
  position: relative;
}

.app-bar-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.app-bar-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.frog-outline-icon {
  display: block;
}

.app-bar-right {
  display: flex;
  align-items: center;
}

.user-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background-color: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.14);
  padding: 0.22rem 0.65rem;
  border-radius: 999px;
  font-size: 0.78rem;
  color: #f8fafc;
}

.user-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #f472b6;
}

.user-name {
  font-weight: 600;
  text-transform: capitalize;
}

.user-alias {
  color: #94a3b8;
  font-weight: 500;
}

.icon-btn {
  background: transparent;
  border: none;
  color: #f1f5f9;
  cursor: pointer;
  padding: 0.3rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.app-bar-title {
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.01em;
}
</style>
