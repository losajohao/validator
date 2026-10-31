<script setup lang="ts">
import { toRef } from 'vue'
import ColumnHeaderTooltip from '@/components/validator/ColumnHeaderTooltip.vue'
import DescriptiveCellPopup from '@/components/validator/DescriptiveCellPopup.vue'
import TicketSummaryPopup from '@/components/validator/TicketSummaryPopup.vue'
import {
  DEFAULT_PRESENCE_FILTER_OPTIONS,
  isPresenceColumn,
  useTicketFilter,
} from '@/composables/useTicketFilter'
import type { ColumnDataType, ColumnDefinition } from '@/domain/models/ticket.model'

const props = defineProps<{
  columns: readonly ColumnDefinition<string>[]
  rows: readonly Record<string, any>[]
  hasFileLoaded: boolean
}>()

const {
  columnFilters,
  hasActiveFilters,
  hasDraftInput,
  filteredRows,
  applyFilters,
  setPresenceFilter,
  clearAllFilters,
} = useTicketFilter(toRef(props, 'rows'), toRef(props, 'columns'))

const typeLabels: Record<ColumnDataType, string> = {
  number: 'NUM',
  string: 'TXT',
  datetime: 'FECHA',
  duration: 'HH:MM',
  enum: 'CAT',
}
</script>

<template>
  <section class="grid-container">
    <template v-if="hasFileLoaded">
      <!-- Barra de acciones de filtrado encima de los títulos de columnas -->
      <div class="filter-toolbar">
        <div class="filter-controls">
          <button
            type="button"
            class="btn-search"
            @click="applyFilters"
          >
            <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" stroke-width="2.2" fill="none">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            Buscar
          </button>

          <button
            v-if="hasActiveFilters || hasDraftInput"
            type="button"
            class="btn-clear-filters"
            @click="clearAllFilters"
          >
            Limpiar filtros
          </button>
        </div>

        <div class="filter-meta">
          <span class="filter-count">
            Mostrando <strong>{{ filteredRows.length }}</strong> de <strong>{{ rows.length }}</strong> registros
          </span>
        </div>
      </div>

      <div class="table-wrapper">
        <table class="data-grid">
          <thead>
            <!-- Fila de filtros por columna (encima de los títulos) -->
            <tr class="filter-row">
              <th class="row-index filter-index-cell"></th>
              <th
                v-for="col in columns"
                :key="`filter-${col.key}`"
                class="col-filter-th"
                :class="{
                  'highlight-motivo-th': col.key === 'motivoRetiro',
                  'highlight-sla-th': col.key === 'vaAlSla',
                }"
              >
                <div class="col-filter-box">
                  <select
                    v-if="isPresenceColumn(col)"
                    :value="columnFilters[col.key] ?? ''"
                    class="col-filter-select"
                    :aria-label="`Filtrar ${col.header} por contenido`"
                    @change="setPresenceFilter(col.key, ($event.target as HTMLSelectElement).value)"
                  >
                    <option
                      v-for="opt in col.filterOptions ?? DEFAULT_PRESENCE_FILTER_OPTIONS"
                      :key="opt.value"
                      :value="opt.value"
                    >
                      {{ opt.label }}
                    </option>
                  </select>
                  <input
                    v-else
                    v-model="columnFilters[col.key]"
                    type="text"
                    class="col-filter-input"
                    placeholder="Filtrar..."
                    :aria-label="`Filtrar por ${col.header}`"
                    @keyup.enter="applyFilters"
                  />
                </div>
              </th>
            </tr>

            <!-- Fila de títulos de columnas -->
            <tr class="header-row">
              <th class="row-index header-index-cell">#</th>
              <th
                v-for="col in columns"
                :key="col.key"
                class="col-header"
                :class="{
                  'highlight-motivo-th': col.key === 'motivoRetiro',
                  'highlight-sla-th': col.key === 'vaAlSla',
                }"
              >
                <ColumnHeaderTooltip
                  :header="col.header"
                  :data-type="col.dataType"
                  :type-label="typeLabels[col.dataType]"
                />
              </th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(row, rowIdx) in filteredRows" :key="`${row.ticket}-${rowIdx}`">
              <td class="row-index">
                <div class="index-cell-content">
                  <span>{{ rowIdx + 1 }}</span>
                  <TicketSummaryPopup :row="row" />
                </div>
              </td>
              <td
                v-for="col in columns"
                :key="col.key"
                :class="[
                  `cell-${col.dataType}`,
                  {
                    'cell-descriptive': col.isDescriptive,
                    'highlight-motivo-td': col.key === 'motivoRetiro',
                    'highlight-sla-td': col.key === 'vaAlSla',
                  },
                ]"
              >
                <DescriptiveCellPopup
                  v-if="col.isDescriptive"
                  :value="row[col.key]"
                  :column-header="col.header"
                  :ticket-id="row.ticket"
                />
                <span
                  v-else-if="col.key === 'vaAlSla' && row[col.key]"
                  class="sla-badge"
                  :class="String(row[col.key]).toUpperCase().startsWith('S') ? 'sla-yes' : 'sla-no'"
                >
                  {{ row[col.key] }}
                </span>
                <template v-else>
                  {{ row[col.key] }}
                </template>
              </td>
            </tr>
            <tr v-if="filteredRows.length === 0">
              <td :colspan="columns.length + 1" class="empty-rows">
                No se encontraron registros que coincidan con los filtros aplicados.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <div v-else class="empty-state">
      <svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" stroke-width="1.5" fill="none">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="8" y1="13" x2="16" y2="13" />
        <line x1="8" y1="17" x2="16" y2="17" />
      </svg>
      <p>
        No hay datos cargados. Haz clic en <strong>Importar Excel</strong> para cargar la plantilla
        ({{ columns.length }} columnas estructuradas).
      </p>
    </div>
  </section>
</template>

<style scoped>
.grid-container {
  flex: 1;
  min-height: 0;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Barra superior de filtro */
.filter-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.4rem 0.75rem;
  background-color: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.filter-controls {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.btn-search {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background-color: #2563eb;
  color: #ffffff;
  border: none;
  border-radius: 5px;
  padding: 0.3rem 0.75rem;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.btn-search:hover {
  background-color: #1d4ed8;
}

.filter-meta {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  font-size: 0.78rem;
  color: #475569;
}

.btn-clear-filters {
  background-color: #ffffff;
  color: #475569;
  border: 1px solid #cbd5e1;
  border-radius: 5px;
  padding: 0.28rem 0.65rem;
  font-size: 0.76rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.btn-clear-filters:hover {
  background-color: #f1f5f9;
  color: #0f172a;
}

.table-wrapper {
  flex: 1;
  min-height: 0;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
}

.data-grid {
  width: max-content;
  min-width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
  text-align: left;
}

.data-grid th,
.data-grid td {
  padding: 0.55rem 0.85rem;
  border-bottom: 1px solid #e2e8f0;
  border-right: 1px solid #f1f5f9;
  white-space: nowrap;
}

/* Fila de filtros por columna (encima de los títulos) */
.col-filter-th {
  background-color: #f1f5f9;
  padding: 0.35rem 0.5rem !important;
  position: sticky;
  top: 0;
  z-index: 2;
  min-width: 110px;
}

.filter-index-cell {
  position: sticky;
  top: 0;
  left: 0;
  z-index: 4;
  background-color: #f1f5f9 !important;
  border-right: 2px solid #cbd5e1 !important;
}

.col-filter-box {
  contain: inline-size;
  width: 100%;
}

.col-filter-input,
.col-filter-select {
  width: 100%;
  box-sizing: border-box;
  padding: 0.25rem 0.45rem;
  font-size: 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  background-color: #ffffff;
  color: #1e293b;
  outline: none;
}

.col-filter-input:focus,
.col-filter-select:focus {
  border-color: #2563eb;
}

/* Fila de títulos de columna */
.data-grid th.col-header {
  background-color: #f8fafc;
  color: #334155;
  font-weight: 600;
  position: sticky;
  top: 35px;
  z-index: 2;
  min-width: 110px;
}

.header-index-cell {
  position: sticky;
  top: 35px;
  left: 0;
  z-index: 4;
  background-color: #f8fafc !important;
  border-right: 2px solid #cbd5e1 !important;
}

/* Color diferenciado para MOTIVO RETIRO */
.highlight-motivo-th {
  background-color: #fef3c7 !important;
  color: #92400e !important;
  border-right: 2px solid #f59e0b !important;
}

.highlight-motivo-td {
  background-color: #fffbeb;
  border-right: 2px solid #fcd34d !important;
  font-weight: 500;
}

/* Color diferenciado para ¿VA AL SLA? */
.highlight-sla-th {
  background-color: #e0e7ff !important;
  color: #1e40af !important;
  border-left: 2px solid #6366f1 !important;
  border-right: 2px solid #6366f1 !important;
}

.highlight-sla-td {
  background-color: #eef2ff;
  border-left: 2px solid #c7d2fe !important;
  border-right: 2px solid #c7d2fe !important;
  text-align: center;
  font-weight: 600;
}

.sla-badge {
  display: inline-block;
  padding: 0.15rem 0.55rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
}

.sla-yes {
  background-color: #dcfce7;
  color: #15803d;
}

.sla-no {
  background-color: #fee2e2;
  color: #b91c1c;
}

.cell-descriptive {
  max-width: 240px;
}

.cell-number,
.cell-duration {
  font-variant-numeric: tabular-nums;
}

.data-grid tbody tr:hover td {
  filter: brightness(0.97);
}

.row-index {
  width: 76px;
  min-width: 76px;
  text-align: center;
  color: #64748b;
  background-color: #f8fafc;
  font-variant-numeric: tabular-nums;
  position: sticky;
  left: 0;
  z-index: 1;
  border-right: 2px solid #cbd5e1 !important;
}

th.row-index.filter-index-cell {
  top: 0;
  left: 0;
  z-index: 5;
  background-color: #f1f5f9 !important;
}

th.row-index.header-index-cell {
  top: 35px;
  left: 0;
  z-index: 5;
  background-color: #f8fafc !important;
}

.index-cell-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
}

.empty-rows {
  text-align: center;
  padding: 2rem;
  color: #64748b;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  color: #64748b;
  gap: 0.75rem;
  text-align: center;
}
</style>
