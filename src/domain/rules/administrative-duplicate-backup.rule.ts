import type {
  DuplicableTicketRecord,
  ITicketValidationRule,
} from '@/domain/contracts/validation-rule.contract'
import { getMinutesDifference, getRecordSgaTimestamp } from '@/utils/date-time.util'

export interface DuplicateWindowOptions {
  minMinutes?: number
  maxMinutes?: number
}

export class AdministrativeDuplicateBackupRule<
  T extends DuplicableTicketRecord = DuplicableTicketRecord,
> implements ITicketValidationRule<T>
{
  readonly id = 'ADMIN_DUPLICATE_BACKUP_SLA'
  readonly name = 'Duplicidad Principal/Backup en Red Administrativa'
  readonly description =
    'En red Administrativa, si existen dos tickets del mismo enlace dentro del rango de minutos en Fecha Generación SGA donde uno es Principal y otro Backup, el Principal va al SLA (SÍ) y el Backup se retira por duplicidad (NO).'

  private readonly minMinutes: number
  private readonly maxMinutes: number

  constructor(options: DuplicateWindowOptions = {}) {
    this.minMinutes = options.minMinutes ?? 0
    this.maxMinutes = options.maxMinutes ?? 15
  }

  apply(records: T[]): T[] {
    const clonedRecords = records.map((rec) => ({ ...rec }))

    const adminIndices: number[] = []
    const parsedTimestamps = new Map<number, number>()

    clonedRecords.forEach((record, index) => {
      if (this.isAdministrativeNetwork(record.red)) {
        const timestamp = getRecordSgaTimestamp(record)
        if (timestamp !== null && this.normalizeText(record.enlace) !== '') {
          adminIndices.push(index)
          parsedTimestamps.set(index, timestamp)
        }
      }
    })

    for (let i = 0; i < adminIndices.length; i++) {
      const idxA = adminIndices[i]!
      const recordA = clonedRecords[idxA]!
      const timeA = parsedTimestamps.get(idxA)!
      const enlaceA = this.normalizeText(recordA.enlace)
      const roleA = this.normalizeRole(recordA.priBk)

      if (!roleA) continue

      for (let j = i + 1; j < adminIndices.length; j++) {
        const idxB = adminIndices[j]!
        const recordB = clonedRecords[idxB]!
        const timeB = parsedTimestamps.get(idxB)!
        const enlaceB = this.normalizeText(recordB.enlace)
        const roleB = this.normalizeRole(recordB.priBk)

        if (!roleB || enlaceA !== enlaceB || roleA === roleB) {
          continue
        }

        const diffMinutes = getMinutesDifference(timeA, timeB)
        if (diffMinutes >= this.minMinutes && diffMinutes <= this.maxMinutes) {
          const principalRecord = roleA === 'PRINCIPAL' ? recordA : recordB
          const backupRecord = roleA === 'BACKUP' ? recordA : recordB

          // Solo reemplaza ¿VA AL SLA? en los que cumplen la condición; el resto conserva su valor original
          principalRecord.vaAlSla = 'SÍ'
          if (!principalRecord.motivoRetiro) {
            principalRecord.motivoRetiro = ''
          }

          backupRecord.vaAlSla = 'NO'
          backupRecord.motivoRetiro = this.buildRetirementComment(
            principalRecord.ticket,
            backupRecord.ticket,
          )
        }
      }
    }

    return clonedRecords
  }

  private buildRetirementComment(
    principalTicket: string | number,
    backupTicket: string | number,
  ): string {
    return `El ticket se retira por duplicidad. Se afecto principal(${principalTicket}) y backup(${backupTicket}), como es red administrativa, solo se reporta el principal(${principalTicket})`
  }

  private isAdministrativeNetwork(red: string): boolean {
    return this.normalizeText(red) === 'ADMINISTRATIVA'
  }

  private normalizeRole(priBk: string): 'PRINCIPAL' | 'BACKUP' | null {
    const normalized = this.normalizeText(priBk)
    if (normalized === 'PRINCIPAL') return 'PRINCIPAL'
    if (normalized === 'BACKUP') return 'BACKUP'
    return null
  }

  private normalizeText(value: string): string {
    return String(value ?? '')
      .trim()
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
  }
}
