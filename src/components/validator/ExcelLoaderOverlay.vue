<script setup lang="ts">
defineProps<{
  visible: boolean
  stageText?: string
}>()
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="loader-backdrop" role="status" aria-live="polite">
      <div class="loader-card">
        <div class="spinner"></div>
        <h3 class="loader-title">Procesando archivo Excel</h3>
        <p class="loader-stage">{{ stageText || 'Cargando y validando registros...' }}</p>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.loader-backdrop {
  position: fixed;
  inset: 0;
  z-index: 11000;
  background-color: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.loader-card {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 2rem 2.5rem;
  min-width: 300px;
  max-width: 400px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.75rem;
}

.spinner {
  width: 44px;
  height: 44px;
  border: 4px solid #e2e8f0;
  border-top-color: #16a34a;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.loader-title {
  margin: 0.25rem 0 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: #0f172a;
}

.loader-stage {
  margin: 0;
  font-size: 0.875rem;
  color: #475569;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

