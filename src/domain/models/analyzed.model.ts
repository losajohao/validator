export interface AnalyzedDbRecord {
  motivoRetiro: string
  ticket: number | string
  cid: number | string
  obsRevision: string
  riesgoPenalidadConPausa: string
  riesgoSinPausas: string
  enviadoALegal: string
  evidenciaTerceros: string
  estatusEvidenciaTerceros: string
  red: string
  priBk: string
  enlace: string
  proactivoReclamo: string
  vaAlSla: string
  existioIndisponibilidad: string
  detalleDelImpacto: string
  fechaCorreoReclamo: string
  fechaGeneracionSga: string
  fechaFinSga: string
  inicioOplogin: string
  finOplogin: string
  pausaClienteInicio: string
  pausaClienteFin: string
  interrupcionInicio: string
  fechaFin: string
  tiemposFinInicio: string
  tiempoFinInicioConPausas: string
  tiempoDeAtencion: string
  tiempoEnElCuadroAzul: string
  tiempoDePausaTotal: string
  evidenciaPausa: string
  responsable: string
  imputacionEnCuadroAzul: string
  tipificacion: string
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
  responsableRevision: string
  estatus: string
  revisado: string
}

export type AnalyzedDbFieldKey = keyof AnalyzedDbRecord

export interface AnalyzedCruceRecord {
  sede: string
  principalBackup: string
  cid: number | string
  nombreParaRegionales: string
  puestaEnOperacion: string
}

export type AnalyzedCruceFieldKey = keyof AnalyzedCruceRecord

