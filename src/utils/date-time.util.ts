/**
 * Parsea cadenas de fecha en formato DD/MM/YYYY HH:mm[:ss], MM/DD/YY HH:mm o con AM/PM
 * habituales en reportes SGA/Excel y devuelve el timestamp en milisegundos, o null si no es válida.
 */
export function parseSgaDateTime(raw: string | number | null | undefined): number | null {
  if (raw === null || raw === undefined) return null
  if (typeof raw === 'number' && !Number.isNaN(raw)) {
    // Número serial de fecha de Excel (días desde 1899-12-30)
    const excelEpoch = Date.UTC(1899, 11, 30)
    return excelEpoch + Math.round(raw * 86400 * 1000)
  }

  const text = String(raw).trim()
  if (!text) return null

  const match = text.match(
    /^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})(?:,?\s+(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\s*(AM|PM|A\.?\s*M\.?|P\.?\s*M\.?))?)?$/i,
  )

  if (match) {
    let first = Number(match[1])
    let second = Number(match[2])
    let year = Number(match[3])
    if (year < 100) {
      year += 2000
    }

    // Si el segundo número supera 12 (ej. 10/14/26 de SheetJS), viene como MM/DD/YY
    let day = first
    let month = second - 1
    if (second > 12 && first <= 12) {
      month = first - 1
      day = second
    }

    let hours = match[4] !== undefined ? Number(match[4]) : 0
    const minutes = match[5] !== undefined ? Number(match[5]) : 0
    const seconds = match[6] !== undefined ? Number(match[6]) : 0
    const meridiem = match[7]?.toUpperCase().replace(/[\s.]/g, '')

    if (meridiem === 'PM' && hours < 12) {
      hours += 12
    } else if (meridiem === 'AM' && hours === 12) {
      hours = 0
    }

    const date = new Date(year, month, day, hours, minutes, seconds)
    const time = date.getTime()
    return Number.isNaN(time) ? null : time
  }

  const fallback = Date.parse(text)
  return Number.isNaN(fallback) ? null : fallback
}

/**
 * Calcula la diferencia absoluta en minutos entre dos timestamps en milisegundos.
 */
export function getMinutesDifference(timestampA: number, timestampB: number): number {
  return Math.abs(timestampA - timestampB) / (1000 * 60)
}
