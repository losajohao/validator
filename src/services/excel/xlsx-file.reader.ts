import * as XLSX from 'xlsx'
import type { ISpreadsheetReader } from '@/domain/contracts/excel-parser.contract'

export class XlsxFileReader implements ISpreadsheetReader {
  async readMatrix(file: File): Promise<unknown[][]> {
    const arrayBuffer = await file.arrayBuffer()
    const workbook = XLSX.read(arrayBuffer, {
      type: 'array',
      cellDates: false,
    })

    const firstSheetName = workbook.SheetNames[0]
    if (!firstSheetName) {
      return []
    }

    const worksheet = workbook.Sheets[firstSheetName]
    if (!worksheet) {
      return []
    }

    return XLSX.utils.sheet_to_json<unknown[]>(worksheet, {
      header: 1,
      defval: '',
      raw: false,
    })
  }
}

