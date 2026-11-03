const RAW_SGA_TIMESTAMP_SYMBOL = Symbol('rawSgaTimestamp')

/**
 * Zona horaria oficial de Lima, Perú (America/Lima = UTC-05:00, sin horario de verano).
 */
export const LIMA_TIMEZONE = 'America/Lima'
const LIMA_UTC_OFFSET_HOURS = 5

export interface ExtractedDateParts {
  day: number
  month: number
  year: number
  hours: number
  minutes: number
  seconds: number
  hasTime: boolean
  hasSeconds: boolean
}

/**
 * Convierte un número serial de fecha de Excel (sistema 1900) a sus componentes exactos
 * evitando errores de redondeo de punto flotante (IEEE-754).
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
    hasSeconds: seconds > 0,
  }
}

/**
 * Formatea un serial numérico de fecha de Excel a cadena DD/MM/YYYY[ HH:mm[:ss]] sin ambigüedad MM/DD.
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

  if (parts.hasSeconds) {
    const ss = String(parts.seconds).padStart(2, '0')
    return `${dd}/${mm}/${yyyy} ${hh}:${min}:${ss}`
  }

  return `${dd}/${mm}/${yyyy} ${hh}:${min}`
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
      hasSeconds: dmyMatch[6] !== undefined && seconds > 0,
    }
  }

  // 2. Formato ISO YYYY-MM-DD[ HH:mm[:ss]]
  const isoMatch = text.match(
    /^(\d{4})[/-](\d{1,2})[/-](\d{1,2})(?:[T\s]+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/,
  )
  if (isoMatch) {
    const seconds = isoMatch[6] !== undefined ? Number(isoMatch[6]) : 0
    return {
      year: Number(isoMatch[1]),
      month: Number(isoMatch[2]),
      day: Number(isoMatch[3]),
      hours: isoMatch[4] !== undefined ? Number(isoMatch[4]) : 0,
      minutes: isoMatch[5] !== undefined ? Number(isoMatch[5]) : 0,
      seconds,
      hasTime: isoMatch[4] !== undefined,
      hasSeconds: isoMatch[6] !== undefined && seconds > 0,
    }
  }

  return null
}

/**
 * Formatea un campo de Solo Fecha al formato dd/mm/aaaa (ej. PUESTA EN OPERACIÓN).
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
 * Formatea un campo de Fecha y Hora al formato dd/mm/aaaa hh:mm (o dd/mm/aaaa hh:mm:ss si incluye segundos).
 * Conserva íntegramente la hora del registro tal cual viene en el Excel.
 */
export function formatDateTimeDdMmYyyy(raw: unknown): string {
  if (raw === null || raw === undefined) return ''
  const text = String(raw).trim()
  if (!text) return ''

  const parts = extractDateParts(raw)
  if (!parts) return text

  const dd = String(parts.day).padStart(2, '0')
  const mm = String(parts.month).padStart(2, '0')
  const yyyy = String(parts.year).padStart(4, '0')

  if (!parts.hasTime) {
    return `${dd}/${mm}/${yyyy}`
  }

  const hh = String(parts.hours).padStart(2, '0')
  const min = String(parts.minutes).padStart(2, '0')

  if (parts.hasSeconds) {
    const ss = String(parts.seconds).padStart(2, '0')
    return `${dd}/${mm}/${yyyy} ${hh}:${min}:${ss}`
  }

  return `${dd}/${mm}/${yyyy} ${hh}:${min}`
}

/**
 * Convierte los componentes de fecha/hora a timestamp en milisegundos fijado a la zona horaria
 * de Lima, Perú (America/Lima = UTC-05:00) a nivel de minuto exacto para evitar que segundos
 * residuales o redondeos de Excel dejen tickets fuera de la ventana de 0 a 15 minutos.
 */
export function parseSgaDateTime(raw: string | number | null | undefined): number | null {
  const parts = extractDateParts(raw)
  if (parts) {
    const timeMs = Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hours + LIMA_UTC_OFFSET_HOURS,
      parts.minutes,
      0,
      0,
    )
    return Number.isNaN(timeMs) ? null : timeMs
  }

  if (raw === null || raw === undefined) return null
  const text = String(raw).trim()
  if (!text) return null

  const fallback = Date.parse(text)
  return Number.isNaN(fallback) ? null : fallback
}

/**
 * Asocia el timestamp exacto en zona horaria America/Lima al registro.
 */
export function setRawSgaTimestamp(record: object, rawValue: unknown): void {
  const timestamp = parseSgaDateTime(rawValue as string | number | null | undefined)
  if (timestamp !== null) {
    ;(record as Record<symbol, number>)[RAW_SGA_TIMESTAMP_SYMBOL] = timestamp
  }
}

/**
 * Obtiene el timestamp exacto del registro en zona horaria America/Lima.
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
 * Calcula la diferencia exacta en minutos enteros entre dos timestamps (sin deriva decimal).
 */
export function getMinutesDifference(timestampA: number, timestampB: number): number {
  const minutesA = Math.round(timestampA / 60000)
  const minutesB = Math.round(timestampB / 60000)
  return Math.abs(minutesA - minutesB)
}
