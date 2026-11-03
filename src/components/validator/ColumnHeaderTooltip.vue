<script setup lang="ts">
import { ref } from 'vue'
import type { ColumnDataType } from '@/domain/models/ticket.model'

const props = defineProps<{
  header: string
  dataType: ColumnDataType
  typeLabel: string
}>()

const triggerRef = ref<HTMLElement | null>(null)
const isVisible = ref(false)
const tooltipStyle = ref<{ top: string; left: string }>({
  top: '0px',
  left: '0px',
})

const showTooltip = () => {
  if (!triggerRef.value) return
  const rect = triggerRef.value.getBoundingClientRect()
  const top = rect.bottom + 6
  const left = Math.max(8, Math.min(rect.left, window.innerWidth - 320))

  tooltipStyle.value = {
    top: `${top}px`,
    left: `${left}px`,
  }
  isVisible.value = true
}

const hideTooltip = () => {
  isVisible.value = false
}
</script>

<template>
  <div
    ref="triggerRef"
    class="column-header-cell"
    @mouseenter="showTooltip"
    @mouseleave="hideTooltip"
    @focus="showTooltip"
    @blur="hideTooltip"
    tabindex="0"
  >
    <span class="header-text">{{ props.header }}</span>
    <span class="type-tag" :class="`type-${props.dataType}`">
      {{ props.typeLabel }}
    </span>

    <Teleport to="body">
      <div
        v-if="isVisible"
        class="header-tooltip"
        :style="tooltipStyle"
        role="tooltip"
      >
        <div class="tooltip-title">{{ props.header }}</div>
        <div class="tooltip-meta">
          Tipo: <strong>{{ props.typeLabel }}</strong> ({{ props.dataType }})
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.column-header-cell {
  contain: inline-size;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.4rem;
  cursor: default;
  outline: none;
}

.header-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
}

.type-tag {
  flex-shrink: 0;
  font-size: 0.625rem;
  font-weight: 700;
  padding: 0.1rem 0.32rem;
  border-radius: 4px;
  letter-spacing: 0.03em;
}

.type-number {
  background-color: #dbeafe;
  color: #1d4ed8;
}

.type-string {
  background-color: #f1f5f9;
  color: #475569;
}

.type-date,
.type-datetime {
  background-color: #fef3c7;
  color: #b45309;
}

.type-duration {
  background-color: #ede9fe;
  color: #6d28d9;
}

.type-enum {
  background-color: #dcfce7;
  color: #15803d;
}

.header-tooltip {
  position: fixed;
  z-index: 9999;
  max-width: 320px;
  background-color: #0f172a;
  color: #f8fafc;
  padding: 0.55rem 0.75rem;
  border-radius: 6px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.25);
  pointer-events: none;
  font-size: 0.78rem;
  line-height: 1.35;
}

.tooltip-title {
  font-weight: 600;
  word-break: break-word;
  margin-bottom: 0.2rem;
}

.tooltip-meta {
  font-size: 0.7rem;
  color: #94a3b8;
}
</style>

