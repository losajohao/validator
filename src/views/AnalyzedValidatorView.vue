<script setup lang="ts">
import { ref } from 'vue'
import AppBar from '@/components/layout/AppBar.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import DualExcelUploadPopup from '@/components/validator/DualExcelUploadPopup.vue'
import ExcelLoaderOverlay from '@/components/validator/ExcelLoaderOverlay.vue'
import TicketDataGrid from '@/components/validator/TicketDataGrid.vue'
import { useAnalyzedImporter } from '@/composables/useAnalyzedImporter'

const isSidebarOpen = ref(true)

const {
  activeTab,
  dbColumns,
  cruceColumns,
  dbRows,
  cruceRows,
  dbFileName,
  cruceFileName,
  dbUnmatchedHeaders,
  cruceUnmatchedHeaders,
  isLoading,
  loadingStage,
  errorMessage,
  hasFilesLoaded,
  importBothFiles,
  exportActiveTabExcel,
} = useAnalyzedImporter()

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}
</script>

<template>
  <div class="layout">
    <ExcelLoaderOverlay :visible="isLoading" :stage-text="loadingStage" />

    <AppBar @toggle-sidebar="toggleSidebar" />

    <div class="layout-body">
      <AppSidebar :is-open="isSidebarOpen" />

      <main class="main-content">
        <!-- Cabecera compacta en una sola fila: Título + Tabs + Botones -->
        <div class="main-header">
          <div class="header-left">
            <h1 class="page-title">Validador de duplicidad (analizada)</h1>

            <div class="tabs-bar">
              <button
                type="button"
                class="tab-btn"
                :class="{ active: activeTab === 'db' }"
                @click="activeTab = 'db'"
              >
                <span>Tabla DB</span>
                <span class="tab-count">{{ dbRows.length }}</span>
              </button>

              <button
                type="button"
                class="tab-btn"
                :class="{ active: activeTab === 'cruce' }"
                @click="activeTab = 'cruce'"
              >
                <span>Tabla Cruce</span>
                <span class="tab-count">{{ cruceRows.length }}</span>
              </button>
            </div>
          </div>

          <div class="actions">
            <button
              v-if="hasFilesLoaded"
              type="button"
              class="btn-export"
              :disabled="isLoading"
              @click="exportActiveTabExcel"
            >
              <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" stroke-width="2" fill="none">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Exportar ({{ activeTab === 'db' ? 'DB' : 'Cruce' }})
            </button>

            <DualExcelUploadPopup
              :is-loading="isLoading"
              :current-db-file-name="dbFileName"
              :current-cruce-file-name="cruceFileName"
              @files-confirmed="importBothFiles"
            />
          </div>
        </div>

        <!-- Alertas -->
        <div v-if="errorMessage" class="alert alert-error">
          {{ errorMessage }}
        </div>

        <div
          v-if="activeTab === 'db' && dbFileName && dbUnmatchedHeaders.length > 0"
          class="alert alert-warning"
        >
          Columnas DB no encontradas ({{ dbUnmatchedHeaders.length }}):
          {{ dbUnmatchedHeaders.join(', ') }}
        </div>

        <div
          v-if="activeTab === 'cruce' && cruceFileName && cruceUnmatchedHeaders.length > 0"
          class="alert alert-warning"
        >
          Columnas Cruce no encontradas ({{ cruceUnmatchedHeaders.length }}):
          {{ cruceUnmatchedHeaders.join(', ') }}
        </div>

        <!-- Grilla activa según el Tab seleccionado -->
        <TicketDataGrid
          v-if="activeTab === 'db'"
          :columns="dbColumns"
          :rows="dbRows"
          :has-file-loaded="Boolean(dbFileName)"
        />

        <TicketDataGrid
          v-else
          :columns="cruceColumns"
          :rows="cruceRows"
          :has-file-loaded="Boolean(cruceFileName)"
        />
      </main>
    </div>

    <AppFooter />
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f8fafc;
  color: #1e293b;
  overflow: hidden;
}

.layout-body {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0.6rem 1rem;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.main-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  flex-wrap: nowrap;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 0;
}

.page-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  white-space: nowrap;
}

.tabs-bar {
  display: inline-flex;
  align-items: center;
  background-color: #e2e8f0;
  padding: 0.18rem;
  border-radius: 7px;
  gap: 0.2rem;
}

.tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: transparent;
  border: none;
  border-radius: 5px;
  padding: 0.28rem 0.65rem;
  font-size: 0.78rem;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.tab-btn:hover {
  color: #0f172a;
}

.tab-btn.active {
  background-color: #ffffff;
  color: #2563eb;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
}

.tab-count {
  font-size: 0.7rem;
  background-color: #cbd5e1;
  color: #1e293b;
  padding: 0.05rem 0.38rem;
  border-radius: 999px;
}

.tab-btn.active .tab-count {
  background-color: #dbeafe;
  color: #1d4ed8;
}

.actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.btn-export {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background-color: #0f172a;
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

.btn-export:hover:not(:disabled) {
  background-color: #1e293b;
}

.btn-export:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.alert {
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  font-size: 0.78rem;
  margin-bottom: 0.45rem;
}

.alert-error {
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  color: #b91c1c;
}

.alert-warning {
  background-color: #fffbeb;
  border: 1px solid #fde68a;
  color: #92400e;
}
</style>
