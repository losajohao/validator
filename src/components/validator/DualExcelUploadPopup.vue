<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  isLoading?: boolean
  currentDbFileName?: string
  currentCruceFileName?: string
}>()

const emit = defineEmits<{
  filesConfirmed: [payload: { dbFile: File; cruceFile: File }]
}>()

const isOpen = ref(false)
const dbFile = ref<File | null>(null)
const cruceFile = ref<File | null>(null)

const dbInputRef = ref<HTMLInputElement | null>(null)
const cruceInputRef = ref<HTMLInputElement | null>(null)

const openPopup = () => {
  isOpen.value = true
}

const closePopup = () => {
  isOpen.value = false
}

const onDbFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    dbFile.value = file
  }
}

const onCruceFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    cruceFile.value = file
  }
}

const confirmUpload = () => {
  if (!dbFile.value || !cruceFile.value) return
  emit('filesConfirmed', {
    dbFile: dbFile.value,
    cruceFile: cruceFile.value,
  })
  closePopup()
}
</script>

<template>
  <button
    type="button"
    class="btn-open-upload"
    :disabled="isLoading"
    @click="openPopup"
  >
    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
    {{ isLoading ? 'Procesando...' : 'Importar Excel' }}
  </button>

  <Teleport to="body">
    <div v-if="isOpen" class="upload-backdrop" @click.self="closePopup">
      <div class="upload-dialog" role="dialog" aria-modal="true">
        <header class="upload-header">
          <div>
            <h3 class="upload-title">Cargar Archivos Excel</h3>
            <p class="upload-subtitle">
              Selecciona el Archivo 1 (DB - BD INCIDENCIAS) y el Archivo 2 (Cruce - ONPE SEDES)
            </p>
          </div>
          <button type="button" class="upload-close" aria-label="Cerrar" @click="closePopup">
            ✕
          </button>
        </header>

        <div class="upload-body">
          <!-- Archivo 1: DB -->
          <div class="file-drop-card" :class="{ selected: Boolean(dbFile) }">
            <div class="file-card-info">
              <span class="file-step-badge">Archivo 1 — DB</span>
              <strong class="file-card-title">Base de Incidencias (Pestaña: BD INCIDENCIAS)</strong>
              <span class="file-selected-name">
                {{ dbFile ? dbFile.name : currentDbFileName || 'Ningún archivo seleccionado' }}
              </span>
            </div>
            <input
              ref="dbInputRef"
              type="file"
              accept=".xlsx,.xls,.csv"
              class="hidden-input"
              @change="onDbFileChange"
            />
            <button type="button" class="btn-select-file" @click="dbInputRef?.click()">
              {{ dbFile ? 'Cambiar archivo' : 'Seleccionar Excel DB' }}
            </button>
          </div>

          <!-- Archivo 2: Cruce -->
          <div class="file-drop-card" :class="{ selected: Boolean(cruceFile) }">
            <div class="file-card-info">
              <span class="file-step-badge badge-cruce">Archivo 2 — Cruce</span>
              <strong class="file-card-title">Maestro de Sedes (ONPE SEDES — Puesta en Operación)</strong>
              <span class="file-selected-name">
                {{ cruceFile ? cruceFile.name : currentCruceFileName || 'Ningún archivo seleccionado' }}
              </span>
            </div>
            <input
              ref="cruceInputRef"
              type="file"
              accept=".xlsx,.xls,.csv"
              class="hidden-input"
              @change="onCruceFileChange"
            />
            <button type="button" class="btn-select-file" @click="cruceInputRef?.click()">
              {{ cruceFile ? 'Cambiar archivo' : 'Seleccionar Excel Cruce' }}
            </button>
          </div>
        </div>

        <footer class="upload-footer">
          <button type="button" class="btn-cancel" @click="closePopup">
            Cancelar
          </button>
          <button
            type="button"
            class="btn-confirm"
            :disabled="!dbFile || !cruceFile"
            @click="confirmUpload"
          >
            Cargar Archivos
          </button>
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.btn-open-upload {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background-color: #16a34a;
  color: #ffffff;
  border: none;
  padding: 0.38rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.15s ease;
}

.btn-open-upload:hover:not(:disabled) {
  background-color: #15803d;
}

.btn-open-upload:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.hidden-input {
  display: none;
}

.upload-backdrop {
  position: fixed;
  inset: 0;
  z-index: 10000;
  background-color: rgba(15, 23, 42, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.upload-dialog {
  background-color: #ffffff;
  border-radius: 12px;
  width: 100%;
  max-width: 560px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.upload-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.1rem 1.35rem;
  background-color: #0f172a;
  color: #ffffff;
}

.upload-title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
}

.upload-subtitle {
  margin: 0.25rem 0 0;
  font-size: 0.8rem;
  color: #94a3b8;
}

.upload-close {
  background: transparent;
  border: none;
  font-size: 1.1rem;
  color: #cbd5e1;
  cursor: pointer;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
}

.upload-close:hover {
  background-color: rgba(255, 255, 255, 0.12);
  color: #ffffff;
}

.upload-body {
  padding: 1.25rem 1.35rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.file-drop-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
  background-color: #f8fafc;
  transition: border-color 0.15s ease, background-color 0.15s ease;
}

.file-drop-card.selected {
  border-style: solid;
  border-color: #16a34a;
  background-color: #f0fdf4;
}

.file-card-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.file-step-badge {
  display: inline-block;
  align-self: flex-start;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.12rem 0.45rem;
  border-radius: 4px;
  background-color: #dbeafe;
  color: #1d4ed8;
  text-transform: uppercase;
}

.badge-cruce {
  background-color: #ede9fe;
  color: #6d28d9;
}

.file-card-title {
  font-size: 0.88rem;
  color: #0f172a;
}

.file-selected-name {
  font-size: 0.8rem;
  color: #64748b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.btn-select-file {
  flex-shrink: 0;
  background-color: #ffffff;
  color: #0f172a;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 0.45rem 0.85rem;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.btn-select-file:hover {
  background-color: #f1f5f9;
}

.upload-footer {
  padding: 0.85rem 1.35rem;
  background-color: #f8fafc;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 0.65rem;
}

.btn-cancel {
  background-color: #ffffff;
  color: #475569;
  border: 1px solid #cbd5e1;
  padding: 0.48rem 1rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-cancel:hover {
  background-color: #f1f5f9;
}

.btn-confirm {
  background-color: #16a34a;
  color: #ffffff;
  border: none;
  padding: 0.48rem 1.15rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-confirm:hover:not(:disabled) {
  background-color: #15803d;
}

.btn-confirm:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
</style>

