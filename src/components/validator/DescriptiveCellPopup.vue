<script setup lang="ts">
import { computed, ref } from 'vue'
import { hasCellContent } from '@/composables/useTicketFilter'

const props = defineProps<{
  value: string | number
  columnHeader: string
  ticketId?: string | number
}>()

const isOpen = ref(false)

const hasContent = computed(() => hasCellContent(props.value))
const textValue = computed(() => (hasContent.value ? String(props.value ?? '').trim() : ''))

const openPopup = () => {
  if (!hasContent.value) return
  isOpen.value = true
}

const closePopup = () => {
  isOpen.value = false
}
</script>

<template>
  <div
    class="descriptive-cell"
    :class="{ clickable: hasContent }"
    @click="openPopup"
  >
    <span class="truncated-content">{{ textValue }}</span>
    <button
      v-if="hasContent"
      type="button"
      class="expand-btn"
      title="Ver contenido completo"
      @click.stop="openPopup"
    >
      <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none">
        <path d="M15 3h6v6" />
        <path d="M9 21H3v-6" />
        <path d="M21 3l-7 7" />
        <path d="M3 21l7-7" />
      </svg>
    </button>

    <Teleport to="body">
      <div
        v-if="isOpen"
        class="popup-backdrop"
        @click.self="closePopup"
      >
        <div class="popup-dialog" role="dialog" aria-modal="true">
          <header class="popup-header">
            <div class="popup-title-group">
              <h3 class="popup-title">{{ columnHeader }}</h3>
              <span v-if="ticketId" class="popup-subtitle">Ticket #{{ ticketId }}</span>
            </div>
            <button
              type="button"
              class="popup-close"
              aria-label="Cerrar"
              @click="closePopup"
            >
              ✕
            </button>
          </header>

          <div class="popup-body">
            <p class="popup-text">{{ textValue }}</p>
          </div>

          <footer class="popup-footer">
            <button type="button" class="btn-close-popup" @click="closePopup">
              Cerrar
            </button>
          </footer>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.descriptive-cell {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.4rem;
  max-width: 220px;
}

.descriptive-cell.clickable {
  cursor: pointer;
}

.descriptive-cell.clickable:hover .truncated-content {
  color: #2563eb;
}

.truncated-content {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
}

.expand-btn {
  flex-shrink: 0;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  color: #475569;
  border-radius: 4px;
  padding: 0.15rem 0.25rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.expand-btn:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.popup-backdrop {
  position: fixed;
  inset: 0;
  z-index: 10000;
  background-color: rgba(15, 23, 42, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.popup-dialog {
  background-color: #ffffff;
  border-radius: 10px;
  width: 100%;
  max-width: 560px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.popup-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background-color: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.popup-title-group {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.popup-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
}

.popup-subtitle {
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 500;
}

.popup-close {
  background: transparent;
  border: none;
  font-size: 1.1rem;
  color: #64748b;
  cursor: pointer;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
}

.popup-close:hover {
  background-color: #e2e8f0;
  color: #0f172a;
}

.popup-body {
  padding: 1.25rem;
  max-height: 60vh;
  overflow-y: auto;
}

.popup-text {
  margin: 0;
  font-size: 0.925rem;
  line-height: 1.6;
  color: #1e293b;
  white-space: pre-wrap;
  word-break: break-word;
}

.popup-footer {
  padding: 0.75rem 1.25rem;
  background-color: #f8fafc;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
}

.btn-close-popup {
  background-color: #0f172a;
  color: #ffffff;
  border: none;
  padding: 0.45rem 1rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-close-popup:hover {
  background-color: #1e293b;
}
</style>

