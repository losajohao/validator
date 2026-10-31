import type {
  ITicketRuleEngine,
  ITicketValidationRule,
} from '@/domain/contracts/validation-rule.contract'
import type { TicketRecord } from '@/domain/models/ticket.model'
import { AdministrativeDuplicateBackupRule } from '@/domain/rules/administrative-duplicate-backup.rule'

export class TicketRuleEngine implements ITicketRuleEngine {
  constructor(
    private readonly rules: readonly ITicketValidationRule[] = [
      new AdministrativeDuplicateBackupRule(),
    ],
  ) {}

  evaluateAll(records: TicketRecord[]): TicketRecord[] {
    return this.rules.reduce(
      (currentRecords, rule) => rule.apply(currentRecords),
      records,
    )
  }
}

