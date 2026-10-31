<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  title: string
  fileName?: string
  rowCount?: number
  isLoading?: boolean
}>()

const emit = defineEmits<{
  fileSelected: [file: File]
  exportExcel: []
}>()

const fileInput = ref<HTMLInputElement | null>(null)

const triggerFileSelect = () => {
  fileInput.value?.click()
}

const onFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    emit('fileSelected', file)
    target.value = ''
  }
}
</script>

<template>
  <div class="main-header">
    <div class="title-group">
      <h1 class="page-title">{{ title }}</h1>
      <span v-if="fileName" class="file-badge">
        {{ fileName }} ({{ rowCount ?? 0 }} registros)
      </span>
    </div>

    <div class="actions">
      <input
        ref="fileInput"
        type="file"
        accept=".xlsx,.xls,.csv"
        class="hidden-input"
        @change="onFileChange"
      />
      <button
        v-if="(rowCount ?? 0) > 0"
        type="button"
        class="btn-export"
        :disabled="isLoading"
        @click="emit('exportExcel')"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Exportar Excel
      </button>

      <button
        type="button"
        class="btn-import"
        :disabled="isLoading"
        @click="triggerFileSelect"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        {{ isLoading ? 'Importando...' : 'Importar Excel' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.main-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}

.title-group {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.file-badge {
  font-size: 0.85rem;
  color: #475569;
  background-color: #e2e8f0;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
}

.actions {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.hidden-input {
  display: none;
}

.btn-export {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #0f172a;
  color: #ffffff;
  border: none;
  padding: 0.6rem 1.1rem;
  border-radius: 6px;
  font-size: 0.925rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.btn-export:hover:not(:disabled) {
  background-color: #1e293b;
}

.btn-import {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #16a34a;
  color: #ffffff;
  border: none;
  padding: 0.6rem 1.1rem;
  border-radius: 6px;
  font-size: 0.925rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.btn-import:hover:not(:disabled) {
  background-color: #15803d;
}

.btn-import:disabled,
.btn-export:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}
</style>
