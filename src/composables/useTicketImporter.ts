import { computed, ref, shallowRef } from 'vue'
import type {
  ISpreadsheetExporter,
  ISpreadsheetReader,
  ITicketRowMapper,
} from '@/domain/contracts/excel-parser.contract'
import type { ITicketRuleEngine } from '@/domain/contracts/validation-rule.contract'
import type { ColumnDefinition, TicketRecord } from '@/domain/models/ticket.model'
import { TICKET_COLUMNS_SCHEMA } from '@/domain/schemas/ticket-columns.schema'
import { CellValueParser } from '@/services/excel/cell-value.parser'
import { TicketRowMapper } from '@/services/excel/ticket-row.mapper'
import { XlsxFileExporter } from '@/services/excel/xlsx-file.exporter'
import { XlsxFileReader } from '@/services/excel/xlsx-file.reader'
import { TicketRuleEngine } from '@/services/validation/ticket-rule.engine'

const waitNextPaint = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms))

export function useTicketImporter(
  reader: ISpreadsheetReader = new XlsxFileReader(),
  mapper: ITicketRowMapper = new TicketRowMapper(new CellValueParser()),
  ruleEngine: ITicketRuleEngine = new TicketRuleEngine(),
  exporter: ISpreadsheetExporter = new XlsxFileExporter(),
) {
  const columns = computed<readonly ColumnDefinition[]>(() => TICKET_COLUMNS_SCHEMA)
  const rows = shallowRef<TicketRecord[]>([])
  const fileName = ref('')
  const unmatchedHeaders = ref<string[]>([])
  const isLoading = ref(false)
  const loadingStage = ref('')
  const errorMessage = ref<string | null>(null)

  const importExcelFile = async (file: File): Promise<void> => {
    isLoading.value = true
    errorMessage.value = null

    try {
      loadingStage.value = 'Leyendo archivo Excel...'
      await waitNextPaint(100)
      const matrix = await reader.readMatrix(file)

      loadingStage.value = 'Estructurando columnas y tipos de datos...'
      await waitNextPaint(120)
      const result = mapper.mapMatrixToTickets(matrix, file.name, columns.value)

      loadingStage.value = 'Ejecutando reglas de validación SLA...'
      await waitNextPaint(150)
      const evaluatedRows = ruleEngine.evaluateAll(result.rows)

      fileName.value = result.fileName
      rows.value = evaluatedRows
      unmatchedHeaders.value = result.unmatchedExpectedHeaders
    } catch (error) {
      errorMessage.value =
        error instanceof Error ? error.message : 'Error al procesar el archivo Excel.'
    } finally {
      isLoading.value = false
      loadingStage.value = ''
    }
  }

  const exportEvaluatedExcel = (): void => {
    if (rows.value.length === 0) return
    exporter.exportToExcel(rows.value, columns.value, fileName.value || 'tickets')
  }

  return {
    columns,
    rows,
    fileName,
    unmatchedHeaders,
    isLoading,
    loadingStage,
    errorMessage,
    importExcelFile,
    exportEvaluatedExcel,
  }
}
