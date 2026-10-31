<script setup lang="ts">
defineProps<{
  isOpen: boolean
}>()
</script>

<template>
  <aside class="sidebar" :class="{ collapsed: !isOpen }">
    <nav class="sidebar-nav">
      <a href="#" class="nav-item active">
        <svg viewBox="0 0 26 26" width="22" height="18" stroke="currentColor" stroke-width="2" fill="none">
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
        <span>Validador de duplicidad (bruto)</span>
      </a>
    </nav>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 280px;
  background-color: #ffffff;
  border-right: 1px solid #e2e8f0;
  transition: width 0.2s ease;
  flex-shrink: 0;
  overflow: hidden;
}

.sidebar.collapsed {
  width: 0;
  overflow: hidden;
  border-right: none;
}

.sidebar-nav {
  padding: 1rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.6rem 0.75rem;
  border-radius: 6px;
  color: #475569;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9rem;
  line-height: 1.3;
}

.nav-item svg {
  flex-shrink: 0;
}

.nav-item.active,
.nav-item:hover {
  background-color: #eff6ff;
  color: #2563eb;
}
</style>

