const RAW_SGA_TIMESTAMP_SYMBOL = Symbol('rawSgaTimestamp')

export interface ExtractedDateParts {
  day: number
  month: number
  year: number
  hours: number
  minutes: number
  seconds: number
  hasTime: boolean
}

/**
 * Convierte un número serial de fecha de Excel (sistema 1900) a sus componentes exactos.
 */
export function excelSerialToDateParts(serial: number): ExtractedDateParts {
  const totalSeconds = Math.round(serial * 86400)
  const wholeDays = Math.floor(totalSeconds / 86400)
  const daySeconds = totalSeconds - wholeDays * 86400

  const utcDate = new Date(Date.UTC(1899, 11, 30) + wholeDays * 86400 * 1000)
  const day = utcDate.getUTCDate()
  const month = utcDate.getUTCMonth() + 1
  const year = utcDate.getUTCFullYear()

  const hours = Math.floor(daySeconds / 3600)
  const minutes = Math.floor((daySeconds % 3600) / 60)
  const seconds = daySeconds % 60

  return {
    day,
    month,
    year,
    hours,
    minutes,
    seconds,
    hasTime: daySeconds > 0,
  }
}

/**
 * Formatea un serial numérico de fecha de Excel a cadena DD/MM/YYYY[ HH:mm:ss] sin ambigüedad MM/DD.
 */
export function formatExcelSerialToDateTimeString(serial: number): string {
  const parts = excelSerialToDateParts(serial)
  const dd = String(parts.day).padStart(2, '0')
  const mm = String(parts.month).padStart(2, '0')
  const yyyy = String(parts.year)

  if (!parts.hasTime) {
    return `${dd}/${mm}/${yyyy}`
  }

  const hh = String(parts.hours).padStart(2, '0')
  const min = String(parts.minutes).padStart(2, '0')
  const ss = String(parts.seconds).padStart(2, '0')
  return `${dd}/${mm}/${yyyy} ${hh}:${min}:${ss}`
}

/**
 * Extrae día, mes, año y hora de una celda o cadena de fecha.
 */
export function extractDateParts(raw: unknown): ExtractedDateParts | null {
  if (raw === null || raw === undefined) return null

  if (typeof raw === 'number' && !Number.isNaN(raw) && raw > 1000) {
    return excelSerialToDateParts(raw)
  }

  const text = String(raw).trim()
  if (!text) return null

  // 1. Formato DD/MM/YYYY[ HH:mm[:ss]] o MM/DD/YY[ HH:mm[:ss]]
  const dmyMatch = text.match(
    /^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})(?:,?\s+(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\s*(AM|PM|A\.?\s*M\.?|P\.?\s*M\.?))?)?$/i,
  )

  if (dmyMatch) {
    const first = Number(dmyMatch[1])
    const second = Number(dmyMatch[2])
    let year = Number(dmyMatch[3])
    if (year < 100) {
      year += 2000
    }

    let day = first
    let month = second
    if (second > 12 && first <= 12) {
      month = first
      day = second
    }

    let hours = dmyMatch[4] !== undefined ? Number(dmyMatch[4]) : 0
    const minutes = dmyMatch[5] !== undefined ? Number(dmyMatch[5]) : 0
    const seconds = dmyMatch[6] !== undefined ? Number(dmyMatch[6]) : 0
    const meridiem = dmyMatch[7]?.toUpperCase().replace(/[\s.]/g, '')

    if (meridiem === 'PM' && hours < 12) {
      hours += 12
    } else if (meridiem === 'AM' && hours === 12) {
      hours = 0
    }

    return {
      day,
      month,
      year,
      hours,
      minutes,
      seconds,
      hasTime: dmyMatch[4] !== undefined,
    }
  }

  // 2. Formato ISO YYYY-MM-DD[ HH:mm[:ss]]
  const isoMatch = text.match(
    /^(\d{4})[/-](\d{1,2})[/-](\d{1,2})(?:[T\s]+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/,
  )
  if (isoMatch) {
    return {
      year: Number(isoMatch[1]),
      month: Number(isoMatch[2]),
      day: Number(isoMatch[3]),
      hours: isoMatch[4] !== undefined ? Number(isoMatch[4]) : 0,
      minutes: isoMatch[5] !== undefined ? Number(isoMatch[5]) : 0,
      seconds: isoMatch[6] !== undefined ? Number(isoMatch[6]) : 0,
      hasTime: isoMatch[4] !== undefined,
    }
  }

  return null
}

/**
 * Formatea cualquier valor de fecha al formato dd/mm/aaaa.
 * Si el valor está vacío devuelve ''; si no es una fecha reconocible devuelve el texto original.
 */
export function formatDateDdMmYyyy(raw: unknown): string {
  if (raw === null || raw === undefined) return ''
  const text = String(raw).trim()
  if (!text) return ''

  const parts = extractDateParts(raw)
  if (!parts) return text

  const dd = String(parts.day).padStart(2, '0')
  const mm = String(parts.month).padStart(2, '0')
  const yyyy = String(parts.year).padStart(4, '0')
  return `${dd}/${mm}/${yyyy}`
}

/**
 * Parsea cadenas de fecha en formato DD/MM/YYYY HH:mm[:ss], MM/DD/YY HH:mm o con AM/PM
 * habituales en reportes SGA/Excel y devuelve el timestamp en milisegundos, o null si no es válida.
 */
export function parseSgaDateTime(raw: string | number | null | undefined): number | null {
  const parts = extractDateParts(raw)
  if (parts) {
    const date = new Date(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hours,
      parts.minutes,
      parts.seconds,
    )
    const time = date.getTime()
    return Number.isNaN(time) ? null : time
  }

  if (raw === null || raw === undefined) return null
  const text = String(raw).trim()
  if (!text) return null

  const fallback = Date.parse(text)
  return Number.isNaN(fallback) ? null : fallback
}

/**
 * Asocia el timestamp exacto (con horas y minutos) a un registro antes de formatear la fecha a dd/mm/aaaa.
 */
export function setRawSgaTimestamp(record: object, rawValue: unknown): void {
  const timestamp = parseSgaDateTime(rawValue as string | number | null | undefined)
  if (timestamp !== null) {
    ;(record as Record<symbol, number>)[RAW_SGA_TIMESTAMP_SYMBOL] = timestamp
  }
}

/**
 * Obtiene el timestamp exacto del registro (conservando horas y minutos originales del Excel).
 */
export function getRecordSgaTimestamp(record: { fechaGeneracionSga: string }): number | null {
  const rawTimestamp = (record as unknown as Record<symbol, number | undefined>)[
    RAW_SGA_TIMESTAMP_SYMBOL
  ]
  if (typeof rawTimestamp === 'number' && !Number.isNaN(rawTimestamp)) {
    return rawTimestamp
  }
  return parseSgaDateTime(record.fechaGeneracionSga)
}

/**
 * Calcula la diferencia absoluta en minutos entre dos timestamps en milisegundos.
 */
export function getMinutesDifference(timestampA: number, timestampB: number): number {
  return Math.abs(timestampA - timestampB) / (1000 * 60)
}
