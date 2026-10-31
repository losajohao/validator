import { computed, ref, shallowRef } from 'vue'
import type {
  ISpreadsheetExporter,
  ISpreadsheetReader,
  ITicketRowMapper,
} from '@/domain/contracts/excel-parser.contract'
import type { AnalyzedCruceRecord, AnalyzedDbRecord } from '@/domain/models/analyzed.model'
import type { ColumnDefinition } from '@/domain/models/ticket.model'
import { AdministrativeDuplicateBackupRule } from '@/domain/rules/administrative-duplicate-backup.rule'
import { AdministrativeSingleLinkImpactRule } from '@/domain/rules/administrative-single-link-impact.rule'
import { OutOfContractByCidRule } from '@/domain/rules/out-of-contract-by-cid.rule'
import { ANALYZED_CRUCE_COLUMNS_SCHEMA } from '@/domain/schemas/analyzed-cruce.schema'
import { ANALYZED_DB_COLUMNS_SCHEMA } from '@/domain/schemas/analyzed-db.schema'
import { CellValueParser } from '@/services/excel/cell-value.parser'
import { TicketRowMapper } from '@/services/excel/ticket-row.mapper'
import { XlsxFileExporter } from '@/services/excel/xlsx-file.exporter'
import { XlsxFileReader } from '@/services/excel/xlsx-file.reader'
import { TicketRuleEngine } from '@/services/validation/ticket-rule.engine'

export type AnalyzedTabKey = 'db' | 'cruce'

const waitNextPaint = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms))

export function useAnalyzedImporter(
  reader: ISpreadsheetReader = new XlsxFileReader(),
  mapper: ITicketRowMapper = new TicketRowMapper(new CellValueParser()),
  exporter: ISpreadsheetExporter = new XlsxFileExporter(),
) {
  const activeTab = ref<AnalyzedTabKey>('db')

  const dbColumns = computed<readonly ColumnDefinition<string>[]>(() => ANALYZED_DB_COLUMNS_SCHEMA)
  const cruceColumns = computed<readonly ColumnDefinition<string>[]>(
    () => ANALYZED_CRUCE_COLUMNS_SCHEMA,
  )

  const dbRows = shallowRef<AnalyzedDbRecord[]>([])
  const cruceRows = shallowRef<AnalyzedCruceRecord[]>([])

  const dbFileName = ref('')
  const cruceFileName = ref('')

  const dbUnmatchedHeaders = ref<string[]>([])
  const cruceUnmatchedHeaders = ref<string[]>([])

  const isLoading = ref(false)
  const loadingStage = ref('')
  const errorMessage = ref<string | null>(null)

  const hasFilesLoaded = computed(
    () => Boolean(dbFileName.value) || Boolean(cruceFileName.value),
  )

  const importBothFiles = async (payload: { dbFile: File; cruceFile: File }): Promise<void> => {
    isLoading.value = true
    errorMessage.value = null

    try {
      loadingStage.value = 'Leyendo Archivo 1 (DB - Pestaña BD INCIDENCIAS)...'
      await waitNextPaint(100)
      const dbMatrix = await reader.readMatrix(payload.dbFile, {
        preferredSheetNames: ['BD INCIDENCIAS', 'BD_INCIDENCIAS', 'INCIDENCIAS'],
        anchorHeaders: ['TICKET', 'CID'],
      })

      loadingStage.value = 'Estructurando columnas de Tabla DB...'
      await waitNextPaint(100)
      const dbResult = mapper.mapMatrixToTickets<AnalyzedDbRecord>(
        dbMatrix,
        payload.dbFile.name,
        dbColumns.value,
      )

      loadingStage.value = 'Leyendo Archivo 2 (Cruce - ONPE SEDES)...'
      await waitNextPaint(100)
      const cruceMatrix = await reader.readMatrix(payload.cruceFile, {
        anchorHeaders: ['CID'],
      })

      loadingStage.value = 'Estructurando columnas de Tabla Cruce...'
      await waitNextPaint(100)
      const cruceResult = mapper.mapMatrixToTickets<AnalyzedCruceRecord>(
        cruceMatrix,
        payload.cruceFile.name,
        cruceColumns.value,
      )

      loadingStage.value = 'Ejecutando reglas de duplicidad y cruce por CID...'
      await waitNextPaint(140)
      const ruleEngine = new TicketRuleEngine([
        new AdministrativeDuplicateBackupRule<AnalyzedDbRecord>(),
        new OutOfContractByCidRule<AnalyzedDbRecord>(cruceResult.rows),
        new AdministrativeSingleLinkImpactRule<AnalyzedDbRecord>(),
      ])
      const evaluatedDbRows = ruleEngine.evaluateAll(dbResult.rows)

      dbFileName.value = dbResult.fileName
      dbRows.value = evaluatedDbRows
      dbUnmatchedHeaders.value = dbResult.unmatchedExpectedHeaders

      cruceFileName.value = cruceResult.fileName
      cruceRows.value = cruceResult.rows
      cruceUnmatchedHeaders.value = cruceResult.unmatchedExpectedHeaders
    } catch (error) {
      errorMessage.value =
        error instanceof Error ? error.message : 'Error al procesar los archivos Excel.'
    } finally {
      isLoading.value = false
      loadingStage.value = ''
    }
  }

  const exportActiveTabExcel = (): void => {
    if (activeTab.value === 'db') {
      if (dbRows.value.length === 0) return
      exporter.exportToExcel(dbRows.value, dbColumns.value, dbFileName.value || 'tabla_db')
    } else {
      if (cruceRows.value.length === 0) return
      exporter.exportToExcel(cruceRows.value, cruceColumns.value, cruceFileName.value || 'tabla_cruce')
    }
  }

  return {
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
  }
}
