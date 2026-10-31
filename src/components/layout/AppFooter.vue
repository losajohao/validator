<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="app-footer">
    <span>&copy; {{ currentYear }} <strong>Losa TI</strong> — Todos los derechos reservados.</span>
  </footer>
</template>

<style scoped>
.app-footer {
  height: 26px;
  background-color: #0f172a;
  color: #94a3b8;
  border-top: 1px solid #1e293b;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 1rem;
  font-size: 0.72rem;
  letter-spacing: 0.01em;
  flex-shrink: 0;
}

.app-footer strong {
  color: #f8fafc;
  font-weight: 600;
}
</style>

