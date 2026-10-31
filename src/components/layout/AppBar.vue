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
}

.app-bar-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
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
  color: #38bdf8;
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
