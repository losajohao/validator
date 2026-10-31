import { hasCellContent } from '@/composables/useTicketFilter'
import type {
  DuplicableTicketRecord,
  ITicketValidationRule,
} from '@/domain/contracts/validation-rule.contract'
import type { AnalyzedCruceRecord } from '@/domain/models/analyzed.model'
import { formatDateDdMmYyyy } from '@/utils/date-time.util'

export interface TicketWithCidRecord extends DuplicableTicketRecord {
  cid: number | string
}

export class OutOfContractByCidRule<T extends TicketWithCidRecord = TicketWithCidRecord>
  implements ITicketValidationRule<T>
{
  readonly id = 'OUT_OF_CONTRACT_BY_CID'
  readonly name = 'Ticket Fuera de Contrato por Puesta en Operación (CID)'
  readonly description =
    'Cruza el CID del ticket con la tabla Cruce (ONPE SEDES). Si el CID registra un valor en la columna PUESTA EN OPERACIÓN (Columna W), retira el ticket por estar fuera de contrato.'

  private readonly cidToPuestaOperacion = new Map<string, string>()

  constructor(cruceRecords: readonly AnalyzedCruceRecord[] = []) {
    for (const item of cruceRecords) {
      const normalizedCid = this.normalizeCid(item.cid)
      if (normalizedCid !== '' && hasCellContent(item.puestaEnOperacion)) {
        this.cidToPuestaOperacion.set(normalizedCid, formatDateDdMmYyyy(item.puestaEnOperacion))
      }
    }
  }

  apply(records: T[]): T[] {
    if (this.cidToPuestaOperacion.size === 0) {
      return records
    }

    return records.map((record) => {
      if (hasCellContent(record.motivoRetiro)) {
        return record
      }

      const normalizedCid = this.normalizeCid(record.cid)
      const puestaEnOperacion = this.cidToPuestaOperacion.get(normalizedCid)

      if (!puestaEnOperacion) {
        return record
      }

      return {
        ...record,
        vaAlSla: 'NO',
        motivoRetiro: this.buildOutOfContractComment(puestaEnOperacion),
      }
    })
  }

  private buildOutOfContractComment(puestaEnOperacion: string): string {
    return `El ticket fue retirado por estar fuera de contrato según lo informado por ADP Jair Mdendez, la vigencia del servicio inicia ${puestaEnOperacion}`
  }

  private normalizeCid(cid: string | number | null | undefined): string {
    return String(cid ?? '').trim()
  }
}

