import type { ICellValueParser } from '@/domain/contracts/excel-parser.contract'
import type { ColumnDefinition } from '@/domain/models/ticket.model'
import { formatDateDdMmYyyy, formatDateTimeDdMmYyyy } from '@/utils/date-time.util'

export class CellValueParser implements ICellValueParser {
  parse(rawValue: unknown, column: ColumnDefinition<string>): string | number {
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
      case 'date': {
        return formatDateDdMmYyyy(rawValue)
      }
      case 'datetime': {
        return formatDateTimeDdMmYyyy(rawValue)
      }
      case 'enum':
      case 'string':
      default:
        return strValue
    }
  }

  private excelFractionToDuration(fractionOfDay: number): string {
    const totalSeconds = Math.round(fractionOfDay * 86400)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    if (seconds > 0) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    }
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
  }
}
