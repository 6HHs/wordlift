<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getExamSessions } from '../api'
import type { ExamSession } from '../types'

const router = useRouter()
const sessions = ref<ExamSession[]>([])
const loading = ref(true)
const error = ref('')

const groupedSessions = computed(() => {
  const groups: { year: number; sessions: ExamSession[] }[] = []
  let currentYear = 0
  let currentGroup: ExamSession[] = []

  for (const s of sessions.value) {
    if (s.year !== currentYear) {
      if (currentGroup.length > 0) {
        groups.push({ year: currentYear, sessions: [...currentGroup] })
      }
      currentYear = s.year
      currentGroup = [s]
    } else {
      currentGroup.push(s)
    }
  }
  if (currentGroup.length > 0) {
    groups.push({ year: currentYear, sessions: [...currentGroup] })
  }
  return groups
})

onMounted(async () => {
  try {
    const res = await getExamSessions()
    sessions.value = res.data
  } catch (e) {
    error.value = '加载失败，请检查后端是否运行'
  } finally {
    loading.value = false
  }
})

function openSession(session: ExamSession) {
  router.push(`/exam/${session.id}`)
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <h1 class="page-title">真题练习</h1>
      <p class="page-desc">历年CET-6真题，点击开始练习</p>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <span>加载中...</span>
    </div>

    <div v-else-if="error" class="empty-state">
      <p>{{ error }}</p>
    </div>

    <div v-else-if="sessions.length === 0" class="empty-state">
      <p>暂无真题资源</p>
    </div>

    <div v-else class="exam-list">
      <div v-for="group in groupedSessions" :key="group.year" class="year-group">
        <h2 class="year-label">{{ group.year }}年</h2>
        <div class="session-grid">
          <button
            v-for="session in group.sessions"
            :key="session.id"
            class="session-card"
            @click="openSession(session)"
          >
            <div class="session-month">{{ session.month }}月</div>
            <div class="session-arrow">&rarr;</div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  max-width: 720px;
  margin: 0 auto;
  padding: 32px 24px;
}
.page-header {
  margin-bottom: 32px;
}
.page-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 6px;
}
.page-desc {
  font-size: 14px;
  color: var(--text-muted);
}
.loading-state,
.empty-state {
  text-align: center;
  padding: 60px 0;
  color: var(--text-muted);
  font-size: 14px;
}
.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--border-light);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  margin: 0 auto 12px;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.year-group {
  margin-bottom: 28px;
}
.year-label {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 12px;
  padding-left: 2px;
}
.session-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 10px;
}
.session-card {
  background: var(--card);
  border: 1px solid var(--border-light);
  border-radius: 10px;
  padding: 18px 16px;
  cursor: pointer;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-align: left;
  font: inherit;
}
.session-card:hover {
  border-color: var(--accent);
  box-shadow: 0 2px 8px rgba(217, 119, 6, 0.08);
}
.session-month {
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
}
.session-arrow {
  font-size: 16px;
  color: var(--text-muted);
  transition: transform 0.15s;
}
.session-card:hover .session-arrow {
  color: var(--accent);
  transform: translateX(3px);
}
</style>
