export type ColumnDataType = 'number' | 'string' | 'datetime' | 'duration' | 'enum'

export interface TicketRecord {
  motivoRetiro: string
  ticket: number | string
  cid: number | string
  periodo: string
  red: string
  priBk: string
  enlace: string
  proactivoReclamo: string
  vaAlSla: string
  afectoElServicio: string
  detalleDelImpacto: string
  fechaCorreoReclamo: string
  fechaGeneracionSga: string
  fechaFinSga: string
  inicioOplogin: string
  finOplogin: string
  pausaClienteInicio: string
  pausaClienteFin: string
  tiempoDePausaTotal: string
  interrupcionInicio: string
  fechaFin: string
  tiempoAtencionSinServicio: string
  tiempoEnElCuadroAzul: string
  evidenciaPausa: string
  evidenciaTerceros: string
  responsable: string
  imputacionEnElCuadroAzul: string
  tipificacion: string
  motivoRealDeAfectacion: string
  solucionAplicada: string
  observaciones: string
  contrato: string
  estado: string
  usuarioCierra: string
  medioTx: string
  horasOplogin: string
  masivo: string
  ticketPadre: string
  personalOnpe: string
  cantidadPausas: number
  usuarioPausa: string
  cantidadEvidenciasTerceros: number
  sincronizacion: string
  oplogin: string
  superaSla: string
  excesoSla: string
}

export type TicketFieldKey = keyof TicketRecord

export type ColumnFilterMode = 'text' | 'presence'

export interface ColumnDefinition<K extends TicketFieldKey = TicketFieldKey> {
  key: K
  header: string
  dataType: ColumnDataType
  filterMode?: ColumnFilterMode
  required?: boolean
  isDescriptive?: boolean
  isComputed?: boolean
  isHighlightedResult?: boolean
  allowedValues?: readonly string[]
}

export interface ExcelImportResult {
  fileName: string
  columns: readonly ColumnDefinition[]
  rows: TicketRecord[]
  unmatchedExpectedHeaders: string[]
}

