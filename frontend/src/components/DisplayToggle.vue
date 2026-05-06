<script setup lang="ts">
import { useWordStore } from '../stores/wordStore'

const store = useWordStore()

const modes = [
  { value: 'chinese' as const, label: '仅中文' },
  { value: 'english' as const, label: '仅英文' },
  { value: 'both' as const, label: '全显' },
]
</script>

<template>
  <div class="toggle-group">
    <button
      v-for="mode in modes"
      :key="mode.value"
      class="toggle-btn"
      :class="{ active: store.displayMode === mode.value }"
      @click="store.setDisplayMode(mode.value)"
    >
      {{ mode.label }}
    </button>
  </div>
</template>

<style scoped>
.toggle-group {
  display: flex;
  background: var(--border-light);
  border-radius: 10px;
  padding: 3px;
  flex-shrink: 0;
}
.toggle-btn {
  border: none;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  background: transparent;
  color: var(--text-muted);
  transition: all 0.2s;
  cursor: pointer;
  font-family: inherit;
}
.toggle-btn.active {
  background: var(--card);
  color: var(--accent);
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
</style>
