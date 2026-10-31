import * as XLSX from 'xlsx'
import type { ISpreadsheetExporter } from '@/domain/contracts/excel-parser.contract'
import type { ColumnDefinition, TicketRecord } from '@/domain/models/ticket.model'

export class XlsxFileExporter implements ISpreadsheetExporter {
  exportToExcel<T extends Record<string, any> = TicketRecord>(
    rows: readonly T[],
    columns: readonly ColumnDefinition<string>[],
    outputFileName: string,
  ): void {
    const headerRow = columns.map((col) => col.header)
    const dataRows = rows.map((row) =>
      columns.map((col) => (row[col.key] !== undefined && row[col.key] !== null ? row[col.key] : '')),
    )

    const worksheet = XLSX.utils.aoa_to_sheet([headerRow, ...dataRows])
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Validados')

    const cleanName = outputFileName.replace(/\.(xlsx|xls|csv)$/i, '')
    XLSX.writeFile(workbook, `${cleanName}_VALIDADO.xlsx`)
  }
}

