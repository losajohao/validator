import type { ICellValueParser, ITicketRowMapper } from '@/domain/contracts/excel-parser.contract'
import type {
  ColumnDefinition,
  ExcelImportResult,
  TicketRecord,
} from '@/domain/models/ticket.model'
import { TICKET_COLUMNS_SCHEMA } from '@/domain/schemas/ticket-columns.schema'
import { setRawSgaTimestamp } from '@/utils/date-time.util'

export class TicketRowMapper implements ITicketRowMapper {
  constructor(private readonly cellParser: ICellValueParser) {}

  mapMatrixToTickets<T extends Record<string, any> = TicketRecord>(
    matrix: unknown[][],
    fileName: string,
    schema: readonly ColumnDefinition<string>[] = TICKET_COLUMNS_SCHEMA,
  ): ExcelImportResult<T> {
    if (matrix.length === 0) {
      return {
        fileName,
        columns: schema,
        rows: [],
        unmatchedExpectedHeaders: schema.filter((col) => !col.isComputed).map((col) => col.header),
      }
    }

    const rawHeaders = (matrix[0] ?? []).map((cell) => this.normalizeHeader(String(cell ?? '')))

    const columnIndexMap = new Map<string, number>()
    const unmatchedExpectedHeaders: string[] = []

    for (const columnDef of schema) {
      const candidateNames = [columnDef.header, ...(columnDef.headerAliases ?? [])]
      let foundIndex = -1

      for (const candidate of candidateNames) {
        const normalizedTarget = this.normalizeHeader(candidate)
        foundIndex = rawHeaders.findIndex((header) => header === normalizedTarget)
        if (foundIndex !== -1) break
      }

      if (
        foundIndex === -1 &&
        columnDef.fallbackColumnIndex !== undefined &&
        rawHeaders.length > columnDef.fallbackColumnIndex
      ) {
        foundIndex = columnDef.fallbackColumnIndex
      }

      if (foundIndex !== -1) {
        columnIndexMap.set(columnDef.key, foundIndex)
      } else if (!columnDef.isComputed) {
        unmatchedExpectedHeaders.push(columnDef.header)
      }
    }

    const dataRows = matrix.slice(1).filter((row) =>
      Array.isArray(row) && row.some((cell) => cell !== null && cell !== undefined && String(cell).trim() !== ''),
    )

    const rows: T[] = dataRows.map((rawRow) => {
      const record: Record<string, string | number> = {}

      for (const columnDef of schema) {
        const colIdx = columnIndexMap.get(columnDef.key)
        const rawCellValue = colIdx !== undefined ? rawRow[colIdx] : ''
        if (columnDef.key === 'fechaGeneracionSga') {
          setRawSgaTimestamp(record, rawCellValue)
        }
        record[columnDef.key] = this.cellParser.parse(rawCellValue, columnDef)
      }

      return record as T
    })

    return {
      fileName,
      columns: schema,
      rows,
      unmatchedExpectedHeaders,
    }
  }

  private normalizeHeader(header: string): string {
    return header
      .trim()
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
  }
}
