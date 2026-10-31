import type { AnalyzedCruceFieldKey } from '../models/analyzed.model'
import type { ColumnDefinition } from '../models/ticket.model'

export const ANALYZED_CRUCE_COLUMNS_SCHEMA: readonly ColumnDefinition<AnalyzedCruceFieldKey>[] = [
  {
    key: 'sede',
    header: 'SEDE',
    headerAliases: ['RED'],
    dataType: 'enum',
    required: true,
  },
  {
    key: 'principalBackup',
    header: 'principal/backup',
    headerAliases: ['PRI/BK', 'PRINCIPAL/BACKUP'],
    dataType: 'enum',
    required: true,
  },
  {
    key: 'cid',
    header: 'CID',
    dataType: 'number',
    required: true,
  },
  {
    key: 'nombreParaRegionales',
    header: 'NOMBRE PARA REGIONALES',
    headerAliases: ['ENLACE'],
    dataType: 'string',
    required: true,
  },
  {
    key: 'puestaEnOperacion',
    header: 'PUESTA EN OPERACIÓN',
    headerAliases: ['PUESTA EN OPERACION', 'FECHA PUESTA EN OPERACION', 'FECHA PUESTA EN OPERACIÓN'],
    fallbackColumnIndex: 22, // Columna W en Excel (índice 22 base 0)
    dataType: 'datetime',
  },
] as const

