export interface DuplicableTicketRecord {
  motivoRetiro: string
  ticket: number | string
  red: string
  priBk: string
  enlace: string
  fechaGeneracionSga: string
  vaAlSla: string
}

export interface ITicketValidationRule<T extends DuplicableTicketRecord = DuplicableTicketRecord> {
  readonly id: string
  readonly name: string
  readonly description: string
  apply(records: T[]): T[]
}

export interface ITicketRuleEngine {
  evaluateAll<T extends DuplicableTicketRecord>(records: T[]): T[]
}
