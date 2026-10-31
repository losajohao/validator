import { hasCellContent } from '@/composables/useTicketFilter'
import type {
  DuplicableTicketRecord,
  ITicketValidationRule,
} from '@/domain/contracts/validation-rule.contract'

export interface SingleLinkImpactTicketRecord extends DuplicableTicketRecord {
  proactivoReclamo: string
  detalleDelImpacto: string
  existioIndisponibilidad: string
}

const ALLOWED_IMPACT_DETAILS = new Set([
  'INCIDENTES RELACIONADOS A LA RED ADMINISTRATIVA - AFECTACION SOLO PRINCIPAL',
  'INCIDENTES RELACIONADOS A LA RED ADMINISTRATIVA - AFECTACION SOLO BACKUP',
  'INCIDENTES RELACIONADOS A LA RED ADMINISTRATIVA - AFECTACION BACKUP',
])

export class AdministrativeSingleLinkImpactRule<
  T extends SingleLinkImpactTicketRecord = SingleLinkImpactTicketRecord,
> implements ITicketValidationRule<T>
{
  readonly id = 'ADMIN_SINGLE_LINK_NO_OUTAGE'
  readonly name = 'Afectación Individual de Enlace en Red Administrativa sin Indisponibilidad'
  readonly description =
    'En red Administrativa, si el ticket es PROACTIVO, el Detalle del Impacto indica afectación solo Principal o Backup y ¿Existió indisponibilidad del servicio? es NO, se retira indicando la operatividad del enlace alterno.'

  apply(records: T[]): T[] {
    return records.map((record) => {
      // Regla anidada: si ya tiene un motivo de retiro asignado por una regla previa, se respeta
      if (hasCellContent(record.motivoRetiro)) {
        return record
      }

      if (!this.matchesConditions(record)) {
        return record
      }

      const role = this.resolveLinkRole(record.priBk)
      if (!role) {
        return record
      }

      const affectedLinkLabel = role === 'PRINCIPAL' ? 'Principal' : 'Backup'
      const operationalLinkLabel = role === 'PRINCIPAL' ? 'Backup' : 'Principal'

      return {
        ...record,
        vaAlSla: 'NO',
        motivoRetiro: `El ticket fue retirado debido a que solo se afectó enlace ${affectedLinkLabel} de la red Administrativa y se validó la operatividad del enlace ${operationalLinkLabel}`,
      }
    })
  }

  private matchesConditions(record: T): boolean {
    const isAdministrativa = this.normalizeText(record.red) === 'ADMINISTRATIVA'
    if (!isAdministrativa) return false

    const isProactivo = this.normalizeText(record.proactivoReclamo) === 'PROACTIVO'
    if (!isProactivo) return false

    const normalizedImpact = this.normalizeText(record.detalleDelImpacto)
    if (!ALLOWED_IMPACT_DETAILS.has(normalizedImpact)) return false

    const noOutage = this.normalizeText(record.existioIndisponibilidad) === 'NO'
    if (!noOutage) return false

    return true
  }

  private resolveLinkRole(priBk: string): 'PRINCIPAL' | 'BACKUP' | null {
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
      .replace(/[\u2013\u2014]/g, '-')
      .replace(/\s+/g, ' ')
  }
}

