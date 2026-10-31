<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{
  row: Record<string, any>
}>()

const isOpen = ref(false)

interface SummaryField {
  key: string
  aliases?: string[]
  label: string
}

const TICKET_SUMMARY_FIELDS: readonly SummaryField[] = [
  { key: 'red', label: 'RED' },
  { key: 'enlace', label: 'ENLACE' },
  { key: 'proactivoReclamo', label: 'PROACTIVO/RECLAMO' },
  { key: 'detalleDelImpacto', label: 'DETALLE DEL IMPACTO' },
  { key: 'fechaGeneracionSga', label: 'FECHA GENERACIÓN SGA' },
  { key: 'fechaFinSga', label: 'FECHA FIN SGA' },
  { key: 'inicioOplogin', label: 'INICIO OPLOGIN' },
  { key: 'finOplogin', label: 'FIN OPLOGIN' },
  { key: 'pausaClienteInicio', label: 'PAUSA CLIENTE INICIO' },
  { key: 'pausaClienteFin', label: 'PAUSA CLIENTE FIN' },
  { key: 'tiempoDePausaTotal', label: 'TIEMPO DE PAUSA TOTAL' },
  { key: 'interrupcionInicio', label: 'Interrupción Inicio' },
  { key: 'fechaFin', label: 'Fecha Fin' },
  {
    key: 'tiempoAtencionSinServicio',
    aliases: ['tiempoDeAtencion'],
    label: 'TIEMPO DE ATENCIÓN /TIEMPO SIN SERVICIO (NO DISPONIBILIDAD-IMPUTABLE CLARO)',
  },
  { key: 'tiempoEnElCuadroAzul', label: 'TIEMPO EN EL CUADRO AZUL' },
  { key: 'evidenciaPausa', label: 'EVIDENCIA PAUSA: SI/NO/NO APLICA' },
  { key: 'evidenciaTerceros', label: 'EVIDENCIA TERCEROS: SI/NO/NO APLICA' },
  { key: 'responsable', label: 'RESPONSABLE' },
  {
    key: 'imputacionEnElCuadroAzul',
    aliases: ['imputacionEnCuadroAzul'],
    label: 'IMPUTACION EN EL CUADRO AZUL',
  },
  { key: 'tipificacion', label: 'TIPIFICACIÓN' },
]

const CRUCE_SUMMARY_FIELDS: readonly SummaryField[] = [
  { key: 'sede', label: 'SEDE' },
  { key: 'principalBackup', label: 'principal/backup' },
  { key: 'cid', label: 'CID' },
  { key: 'nombreParaRegionales', label: 'NOMBRE PARA REGIONALES' },
  { key: 'puestaEnOperacion', label: 'PUESTA EN OPERACIÓN' },
]

const isCruceRow = computed(() => 'sede' in props.row && !('ticket' in props.row))

const summaryItems = computed(() => {
  const fields = isCruceRow.value ? CRUCE_SUMMARY_FIELDS : TICKET_SUMMARY_FIELDS
  return fields.map((field) => {
    let rawVal = props.row[field.key]
    if ((rawVal === undefined || rawVal === '') && field.aliases) {
      for (const alias of field.aliases) {
        if (props.row[alias] !== undefined && props.row[alias] !== '') {
          rawVal = props.row[alias]
          break
        }
      }
    }
    return {
      label: field.label,
      value: rawVal !== undefined && rawVal !== '' ? String(rawVal) : '-',
    }
  })
})

const openModal = () => {
  isOpen.value = true
}

const closeModal = () => {
  isOpen.value = false
}
</script>

<template>
  <button
    type="button"
    class="btn-summary"
    title="Ver resumen del registro"
    @click="openModal"
  >
    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  </button>

  <Teleport to="body">
    <div v-if="isOpen" class="summary-backdrop" @click.self="closeModal">
      <div class="summary-dialog" role="dialog" aria-modal="true">
        <header class="summary-header">
          <div class="summary-title-group">
            <h3 class="summary-title">
              {{ isCruceRow ? `Resumen de Sede (CID ${row.cid})` : `Resumen del Ticket #${row.ticket}` }}
            </h3>
            <span class="summary-subtitle">
              CID: {{ row.cid }} | {{ row.priBk ?? row.principalBackup ?? '' }}
            </span>
          </div>
          <button
            type="button"
            class="summary-close"
            aria-label="Cerrar"
            @click="closeModal"
          >
            ✕
          </button>
        </header>

        <div class="summary-body">
          <table class="summary-table">
            <thead>
              <tr>
                <th>Campo</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in summaryItems" :key="item.label">
                <td class="summary-key">{{ item.label }}</td>
                <td class="summary-val">{{ item.value }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <footer class="summary-footer">
          <button type="button" class="btn-close-summary" @click="closeModal">
            Cerrar
          </button>
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.btn-summary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: #eff6ff;
  color: #2563eb;
  border: 1px solid #bfdbfe;
  border-radius: 4px;
  padding: 0.2rem 0.35rem;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.btn-summary:hover {
  background-color: #2563eb;
  color: #ffffff;
}

.summary-backdrop {
  position: fixed;
  inset: 0;
  z-index: 10000;
  background-color: rgba(15, 23, 42, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.summary-dialog {
  background-color: #ffffff;
  border-radius: 10px;
  width: 100%;
  max-width: 720px;
  max-height: 85vh;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.summary-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background-color: #0f172a;
  color: #ffffff;
}

.summary-title-group {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.summary-title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
}

.summary-subtitle {
  font-size: 0.8rem;
  color: #94a3b8;
}

.summary-close {
  background: transparent;
  border: none;
  font-size: 1.1rem;
  color: #cbd5e1;
  cursor: pointer;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
}

.summary-close:hover {
  background-color: rgba(255, 255, 255, 0.12);
  color: #ffffff;
}

.summary-body {
  padding: 1rem 1.25rem;
  overflow-y: auto;
  flex: 1;
}

.summary-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.summary-table th,
.summary-table td {
  padding: 0.55rem 0.75rem;
  border: 1px solid #e2e8f0;
  text-align: left;
  vertical-align: top;
}

.summary-table th {
  background-color: #f1f5f9;
  color: #334155;
  font-weight: 700;
}

.summary-key {
  width: 42%;
  background-color: #f8fafc;
  font-weight: 600;
  color: #1e293b;
}

.summary-val {
  color: #334155;
  white-space: pre-wrap;
  word-break: break-word;
}

.summary-footer {
  padding: 0.75rem 1.25rem;
  background-color: #f8fafc;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
}

.btn-close-summary {
  background-color: #0f172a;
  color: #ffffff;
  border: none;
  padding: 0.45rem 1.1rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-close-summary:hover {
  background-color: #1e293b;
}
</style>
