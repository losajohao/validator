import * as XLSX from 'xlsx'
import type { ISpreadsheetReader, ReadSheetOptions } from '@/domain/contracts/excel-parser.contract'
import { formatExcelSerialToDateTimeString } from '@/utils/date-time.util'

export class XlsxFileReader implements ISpreadsheetReader {
  async readMatrix(file: File, options?: ReadSheetOptions): Promise<unknown[][]> {
    const arrayBuffer = await file.arrayBuffer()
    const workbook = XLSX.read(arrayBuffer, {
      type: 'array',
      cellDates: false,
      cellNF: true,
    })

    if (workbook.SheetNames.length === 0) {
      return []
    }

    const targetSheetName = this.resolveSheetName(workbook, options)
    const worksheet = workbook.Sheets[targetSheetName]
    if (!worksheet) {
      return []
    }

    this.normalizeWorksheetDateCells(worksheet)

    const rawMatrix = XLSX.utils.sheet_to_json<unknown[]>(worksheet, {
      header: 1,
      defval: '',
      raw: false,
      dateNF: 'dd/mm/yyyy',
    })

    return this.trimLeadingRowsBeforeHeader(rawMatrix, options?.anchorHeaders)
  }

  /**
   * Convierte las celdas numéricas de fecha de Excel directamente desde su serial (cell.v)
   * a DD/MM/YYYY[ HH:mm:ss] para evitar que SheetJS invierta día y mes con el formato US (m/d/yy).
   */
  private normalizeWorksheetDateCells(worksheet: XLSX.WorkSheet): void {
    for (const key of Object.keys(worksheet)) {
      if (key.startsWith('!')) continue
      const cell = worksheet[key] as XLSX.CellObject | undefined
      if (!cell || cell.t !== 'n' || typeof cell.v !== 'number') continue

      // Rango de seriales de fechas Excel (~1954 a ~2119) cuya representación formateada contiene '/' o '-'
      if (cell.v >= 20000 && cell.v <= 80000 && typeof cell.w === 'string') {
        if (/^\d{1,4}[/-]\d{1,2}[/-]\d{1,4}/.test(cell.w.trim())) {
          cell.w = formatExcelSerialToDateTimeString(cell.v)
        }
      }
    }
  }

  private resolveSheetName(workbook: XLSX.WorkBook, options?: ReadSheetOptions): string {
    const sheetNames = workbook.SheetNames
    if (options?.preferredSheetNames && options.preferredSheetNames.length > 0) {
      for (const preferred of options.preferredSheetNames) {
        const normalizedPref = this.normalizeText(preferred)
        const found = sheetNames.find((name) => this.normalizeText(name) === normalizedPref)
        if (found) return found

        const partial = sheetNames.find((name) =>
          this.normalizeText(name).includes(normalizedPref),
        )
        if (partial) return partial
      }
    }

    if (options?.anchorHeaders && options.anchorHeaders.length > 0) {
      const normalizedAnchors = options.anchorHeaders.map((h) => this.normalizeText(h))
      for (const sheetName of sheetNames) {
        const ws = workbook.Sheets[sheetName]
        if (!ws) continue
        const preview = XLSX.utils.sheet_to_json<unknown[]>(ws, {
          header: 1,
          defval: '',
          raw: false,
          range: 0,
        }).slice(0, 15)

        const hasAnchors = preview.some((row) => {
          if (!Array.isArray(row)) return false
          const normalizedRow = row.map((cell) => this.normalizeText(String(cell ?? '')))
          return normalizedAnchors.every((anchor) => normalizedRow.includes(anchor))
        })

        if (hasAnchors) return sheetName
      }
    }

    return sheetNames[0]!
  }

  private trimLeadingRowsBeforeHeader(
    matrix: unknown[][],
    anchorHeaders?: readonly string[],
  ): unknown[][] {
    if (!anchorHeaders || anchorHeaders.length === 0 || matrix.length === 0) {
      return matrix
    }

    const normalizedAnchors = anchorHeaders.map((h) => this.normalizeText(h))
    const maxScan = Math.min(matrix.length, 20)

    for (let i = 0; i < maxScan; i++) {
      const row = matrix[i]
      if (!Array.isArray(row)) continue
      const normalizedRow = row.map((cell) => this.normalizeText(String(cell ?? '')))
      const matchesAll = normalizedAnchors.every((anchor) => normalizedRow.includes(anchor))
      if (matchesAll) {
        return matrix.slice(i)
      }
    }

    return matrix
  }

  private normalizeText(value: string): string {
    return value
      .trim()
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
  }
}
