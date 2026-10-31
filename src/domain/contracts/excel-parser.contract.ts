import type { ColumnDefinition, ExcelImportResult, TicketRecord } from '../models/ticket.model'

export interface ReadSheetOptions {
  preferredSheetNames?: readonly string[]
  anchorHeaders?: readonly string[]
}

export interface ISpreadsheetReader {
  readMatrix(file: File, options?: ReadSheetOptions): Promise<unknown[][]>
}

export interface ISpreadsheetExporter {
  exportToExcel<T extends Record<string, any> = TicketRecord>(
    rows: readonly T[],
    columns: readonly ColumnDefinition<string>[],
    outputFileName: string,
  ): void
}

export interface ICellValueParser {
  parse(rawValue: unknown, column: ColumnDefinition<string>): string | number
}

export interface ITicketRowMapper {
  mapMatrixToTickets<T extends Record<string, any> = TicketRecord>(
    matrix: unknown[][],
    fileName: string,
    schema?: readonly ColumnDefinition<string>[],
  ): ExcelImportResult<T>
}
