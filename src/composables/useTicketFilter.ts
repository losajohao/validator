import { computed, reactive, shallowRef, watch, type Ref } from 'vue'
import type {
  ColumnDefinition,
  ColumnFilterMode,
} from '@/domain/models/ticket.model'

export type MotivoRetiroFilterValue =
  | ''
  | 'WITH_CONTENT'
  | 'EMPTY'
  | 'RULE_DUPLICATE'
  | 'RULE_OUT_OF_CONTRACT'
  | 'RULE_SINGLE_LINK'

export const MOTIVO_RETIRO_FILTER_OPTIONS: ReadonlyArray<{
  value: MotivoRetiroFilterValue
  label: string
}> = [
  { value: '', label: 'Todos' },
  { value: 'WITH_CONTENT', label: 'Con contenido (Todos los retirados)' },
  { value: 'EMPTY', label: 'Sin contenido' },
  { value: 'RULE_DUPLICATE', label: '1. Por duplicidad' },
  { value: 'RULE_OUT_OF_CONTRACT', label: '2. Fuera de contrato' },
  { value: 'RULE_SINGLE_LINK', label: '3. Afectación solo 1 enlace' },
]

interface AppliedFilterEntry {
  key: string
  mode: ColumnFilterMode
  value: string
}

export function hasCellContent(value: unknown): boolean {
  if (value === null || value === undefined) return false
  const cleaned = String(value)
    .replace(/[\s\u00A0\u200B-\u200D\uFEFF]+/g, '')
    .trim()
  if (
    cleaned === '' ||
    cleaned.toLowerCase() === 'undefined' ||
    cleaned.toLowerCase() === 'null'
  ) {
    return false
  }
  return true
}

export function isPresenceColumn(col: ColumnDefinition<string>): boolean {
  return col.filterMode === 'presence' || col.key === 'motivoRetiro'
}

function normalizeForSearch(value: unknown): string {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function matchesMotivoRetiroFilter(cellValue: unknown, filterValue: string): boolean {
  const contentPresent = hasCellContent(cellValue)

  if (filterValue === 'WITH_CONTENT') {
    return contentPresent
  }
  if (filterValue === 'EMPTY') {
    return !contentPresent
  }
  if (!contentPresent) {
    return false
  }

  const normalizedCell = normalizeForSearch(cellValue)
  switch (filterValue as MotivoRetiroFilterValue) {
    case 'RULE_DUPLICATE':
      return normalizedCell.includes('retira por duplicidad')
    case 'RULE_OUT_OF_CONTRACT':
      return normalizedCell.includes('fuera de contrato')
    case 'RULE_SINGLE_LINK':
      return normalizedCell.includes('solo se afecto enlace')
    default:
      return true
  }
}

export function useTicketFilter<T extends Record<string, any> = Record<string, any>>(
  rows: Ref<readonly T[]>,
  columns: Ref<readonly ColumnDefinition<string>[]>,
) {
  const initialFilters: Record<string, string> = {}
  for (const col of columns.value) {
    initialFilters[col.key] = ''
  }

  const columnFilters = reactive<Record<string, string>>(initialFilters)
  const appliedColumnFilters = shallowRef<AppliedFilterEntry[]>([])

  const applyFilters = () => {
    const entries: AppliedFilterEntry[] = []
    for (const col of columns.value) {
      const mode: ColumnFilterMode = isPresenceColumn(col) ? 'presence' : 'text'
      const rawVal = String(columnFilters[col.key] ?? '').trim()

      if (mode === 'presence') {
        if (rawVal !== '') {
          entries.push({ key: col.key, mode: 'presence', value: rawVal })
        }
      } else {
        const normalized = normalizeForSearch(rawVal)
        if (normalized !== '') {
          entries.push({ key: col.key, mode: 'text', value: normalized })
        }
      }
    }
    appliedColumnFilters.value = entries
  }

  const setPresenceFilter = (key: string, value: string) => {
    columnFilters[key] = value
    applyFilters()
  }

  watch(rows, () => {
    applyFilters()
  })

  watch(columns, (newCols) => {
    for (const col of newCols) {
      if (!(col.key in columnFilters)) {
        columnFilters[col.key] = ''
      }
    }
    appliedColumnFilters.value = []
  })

  const hasActiveFilters = computed(() => {
    return appliedColumnFilters.value.length > 0
  })

  const hasDraftInput = computed(() => {
    return columns.value.some((col) => String(columnFilters[col.key] ?? '').trim() !== '')
  })

  const filteredRows = computed<readonly T[]>(() => {
    const activeCols = appliedColumnFilters.value

    if (activeCols.length === 0) {
      return rows.value
    }

    return rows.value.filter((row) => {
      for (const filter of activeCols) {
        if (filter.mode === 'presence') {
          if (!matchesMotivoRetiroFilter(row[filter.key], filter.value)) {
            return false
          }
        } else {
          const cellText = normalizeForSearch(row[filter.key])
          if (!cellText.includes(filter.value)) {
            return false
          }
        }
      }
      return true
    })
  })

  const clearAllFilters = () => {
    for (const col of columns.value) {
      columnFilters[col.key] = ''
    }
    appliedColumnFilters.value = []
  }

  return {
    columnFilters,
    hasActiveFilters,
    hasDraftInput,
    filteredRows,
    applyFilters,
    setPresenceFilter,
    clearAllFilters,
  }
}
