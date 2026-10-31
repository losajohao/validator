<script setup lang="ts">
import { ref } from 'vue'
import AppBar from '@/components/layout/AppBar.vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import ExcelLoaderOverlay from '@/components/validator/ExcelLoaderOverlay.vue'
import TicketDataGrid from '@/components/validator/TicketDataGrid.vue'
import ValidatorHeader from '@/components/validator/ValidatorHeader.vue'
import { useTicketImporter } from '@/composables/useTicketImporter'

const isSidebarOpen = ref(true)

const {
  columns,
  rows,
  fileName,
  unmatchedHeaders,
  isLoading,
  loadingStage,
  errorMessage,
  importExcelFile,
  exportEvaluatedExcel,
} = useTicketImporter()

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
        <ValidatorHeader
          title="Validador de duplicidad data en bruto"
          :file-name="fileName"
          :row-count="rows.length"
          :is-loading="isLoading"
          @file-selected="importExcelFile"
          @export-excel="exportEvaluatedExcel"
        />

        <div v-if="errorMessage" class="alert alert-error">
          {{ errorMessage }}
        </div>

        <div v-if="fileName && unmatchedHeaders.length > 0" class="alert alert-warning">
          Columnas de la plantilla no encontradas en el archivo ({{ unmatchedHeaders.length }}):
          {{ unmatchedHeaders.join(', ') }}
        </div>

        <TicketDataGrid
          :columns="columns"
          :rows="rows"
          :has-file-loaded="Boolean(fileName)"
        />
      </main>
    </div>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f8fafc;
  color: #1e293b;
}

.layout-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1.5rem 2rem;
  overflow: hidden;
}

.alert {
  padding: 0.65rem 1rem;
  border-radius: 6px;
  font-size: 0.85rem;
  margin-bottom: 1rem;
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
