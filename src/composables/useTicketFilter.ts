import { computed, reactive, shallowRef, watch, type Ref } from 'vue'
import type {
  ColumnDefinition,
  ColumnFilterMode,
  TicketFieldKey,
  TicketRecord,
} from '@/domain/models/ticket.model'

export type PresenceFilterValue = '' | 'WITH_CONTENT' | 'EMPTY'

interface AppliedFilterEntry {
  key: TicketFieldKey
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

export function isPresenceColumn(col: ColumnDefinition): boolean {
  return col.filterMode === 'presence' || col.key === 'motivoRetiro'
}

export function useTicketFilter(
  rows: Ref<readonly TicketRecord[]>,
  columns: Ref<readonly ColumnDefinition[]>,
) {
  const initialFilters = {} as Record<TicketFieldKey, string>
  for (const col of columns.value) {
    initialFilters[col.key] = ''
  }

  const columnFilters = reactive<Record<TicketFieldKey, string>>(initialFilters)
  const appliedColumnFilters = shallowRef<AppliedFilterEntry[]>([])

  const normalizeForSearch = (value: unknown): string => {
    return String(value ?? '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
  }

  const applyFilters = () => {
    const entries: AppliedFilterEntry[] = []
    for (const col of columns.value) {
      const mode: ColumnFilterMode = isPresenceColumn(col) ? 'presence' : 'text'
      const rawVal = String(columnFilters[col.key] ?? '').trim()

      if (mode === 'presence') {
        if (rawVal === 'WITH_CONTENT' || rawVal === 'EMPTY') {
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

  const setPresenceFilter = (key: TicketFieldKey, value: string) => {
    columnFilters[key] = value
    applyFilters()
  }

  watch(rows, () => {
    applyFilters()
  })

  const hasActiveFilters = computed(() => {
    return appliedColumnFilters.value.length > 0
  })

  const hasDraftInput = computed(() => {
    return columns.value.some((col) => String(columnFilters[col.key] ?? '').trim() !== '')
  })

  const filteredRows = computed<readonly TicketRecord[]>(() => {
    const activeCols = appliedColumnFilters.value

    if (activeCols.length === 0) {
      return rows.value
    }

    return rows.value.filter((row) => {
      for (const filter of activeCols) {
        if (filter.mode === 'presence') {
          const contentPresent = hasCellContent(row[filter.key])
          if (filter.value === 'WITH_CONTENT' && !contentPresent) {
            return false
          }
          if (filter.value === 'EMPTY' && contentPresent) {
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
