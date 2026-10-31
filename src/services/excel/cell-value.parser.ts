import type { ICellValueParser } from '@/domain/contracts/excel-parser.contract'
import type { ColumnDefinition } from '@/domain/models/ticket.model'

export class CellValueParser implements ICellValueParser {
  parse(rawValue: unknown, column: ColumnDefinition): string | number {
    if (rawValue === null || rawValue === undefined) {
      return column.dataType === 'number' ? 0 : ''
    }

    const strValue = String(rawValue).trim()
    if (strValue === '') {
      return column.dataType === 'number' ? 0 : ''
    }

    switch (column.dataType) {
      case 'number': {
        const numericValue = Number(strValue.replace(/,/g, ''))
        return Number.isNaN(numericValue) ? strValue : numericValue
      }
      case 'duration': {
        if (typeof rawValue === 'number') {
          return this.excelFractionToDuration(rawValue)
        }
        return strValue
      }
      case 'datetime':
      case 'enum':
      case 'string':
      default:
        return strValue
    }
  }

  private excelFractionToDuration(fractionOfDay: number): string {
    const totalMinutes = Math.round(fractionOfDay * 24 * 60)
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
  }
}

