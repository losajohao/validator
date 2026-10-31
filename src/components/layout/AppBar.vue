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
      <span class="app-bar-title">{{ title ?? 'Sistema Validador' }}</span>
    </div>
  </header>
</template>

<style scoped>
.app-bar {
  height: 56px;
  background-color: #0f172a;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  z-index: 10;
}

.app-bar-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.icon-btn {
  background: transparent;
  border: none;
  color: #f1f5f9;
  cursor: pointer;
  padding: 0.4rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.app-bar-title {
  font-size: 1.1rem;
  font-weight: 600;
  letter-spacing: 0.01em;
}
</style>

