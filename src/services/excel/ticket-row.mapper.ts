import type { ICellValueParser, ITicketRowMapper } from '@/domain/contracts/excel-parser.contract'
import type {
  ColumnDefinition,
  ExcelImportResult,
  TicketFieldKey,
  TicketRecord,
} from '@/domain/models/ticket.model'
import { TICKET_COLUMNS_SCHEMA } from '@/domain/schemas/ticket-columns.schema'

export class TicketRowMapper implements ITicketRowMapper {
  constructor(private readonly cellParser: ICellValueParser) {}

  mapMatrixToTickets(
    matrix: unknown[][],
    fileName: string,
    schema: readonly ColumnDefinition[] = TICKET_COLUMNS_SCHEMA,
  ): ExcelImportResult {
    if (matrix.length === 0) {
      return {
        fileName,
        columns: schema,
        rows: [],
        unmatchedExpectedHeaders: schema.map((col) => col.header),
      }
    }

    const rawHeaders = (matrix[0] ?? []).map((cell) => this.normalizeHeader(String(cell ?? '')))

    const columnIndexMap = new Map<TicketFieldKey, number>()
    const unmatchedExpectedHeaders: string[] = []

    for (const columnDef of schema) {
      const normalizedTarget = this.normalizeHeader(columnDef.header)
      const foundIndex = rawHeaders.findIndex((header) => header === normalizedTarget)

      if (foundIndex !== -1) {
        columnIndexMap.set(columnDef.key, foundIndex)
      } else if (!columnDef.isComputed) {
        unmatchedExpectedHeaders.push(columnDef.header)
      }
    }

    const dataRows = matrix.slice(1).filter((row) =>
      Array.isArray(row) && row.some((cell) => cell !== null && cell !== undefined && String(cell).trim() !== ''),
    )

    const rows: TicketRecord[] = dataRows.map((rawRow) => {
      const record = {} as Record<TicketFieldKey, string | number>

      for (const columnDef of schema) {
        const colIdx = columnIndexMap.get(columnDef.key)
        const rawCellValue = colIdx !== undefined ? rawRow[colIdx] : ''
        record[columnDef.key] = this.cellParser.parse(rawCellValue, columnDef)
      }

      return record as unknown as TicketRecord
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

