import type { TicketRecord } from '../models/ticket.model'

export interface ITicketValidationRule {
  readonly id: string
  readonly name: string
  readonly description: string
  apply(records: TicketRecord[]): TicketRecord[]
}

export interface ITicketRuleEngine {
  evaluateAll(records: TicketRecord[]): TicketRecord[]
}

