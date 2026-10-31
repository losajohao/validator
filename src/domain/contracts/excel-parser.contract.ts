import type { ColumnDefinition, ExcelImportResult, TicketRecord } from '../models/ticket.model'

export interface ISpreadsheetReader {
  readMatrix(file: File): Promise<unknown[][]>
}

export interface ISpreadsheetExporter {
  exportToExcel(
    rows: readonly TicketRecord[],
    columns: readonly ColumnDefinition[],
    outputFileName: string,
  ): void
}

export interface ICellValueParser {
  parse(rawValue: unknown, column: ColumnDefinition): string | number
}

export interface ITicketRowMapper {
  mapMatrixToTickets(
    matrix: unknown[][],
    fileName: string,
    schema?: readonly ColumnDefinition[],
  ): ExcelImportResult
}

