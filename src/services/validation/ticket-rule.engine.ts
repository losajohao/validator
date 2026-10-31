import type {
  DuplicableTicketRecord,
  ITicketRuleEngine,
  ITicketValidationRule,
} from '@/domain/contracts/validation-rule.contract'
import { AdministrativeDuplicateBackupRule } from '@/domain/rules/administrative-duplicate-backup.rule'

export class TicketRuleEngine implements ITicketRuleEngine {
  constructor(
    private readonly rules: readonly ITicketValidationRule<any>[] = [
      new AdministrativeDuplicateBackupRule(),
    ],
  ) {}

  evaluateAll<T extends DuplicableTicketRecord>(records: T[]): T[] {
    return this.rules.reduce(
      (currentRecords, rule) => rule.apply(currentRecords),
      records,
    )
  }
}
