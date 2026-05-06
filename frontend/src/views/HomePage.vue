<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getTodayReview, getOverviewStats, getWordBooks, getStreak, checkIn } from '../api'
import type { ReviewStats, OverviewStats, WordBook, StreakInfo } from '../types'

const router = useRouter()
const reviewStats = ref<ReviewStats | null>(null)
const overview = ref<OverviewStats | null>(null)
const books = ref<WordBook[]>([])
const loading = ref(true)
const streakInfo = ref<StreakInfo | null>(null)
const checkingIn = ref(false)

const STORAGE_KEY = 'wordlift_selected_book'

const selectedBookId = ref<number | null>(null)

const selectedBook = computed(() =>
  books.value.find(b => b.id === selectedBookId.value) ?? null,
)

async function loadStats() {
  try {
    const [reviewRes, booksRes] = await Promise.all([
      getTodayReview(),
      getWordBooks(),
    ])
    reviewStats.value = reviewRes.data.stats
    books.value = booksRes.data

    // Restore saved book selection, default to first book
    const saved = localStorage.getItem(STORAGE_KEY)
    const savedId = saved ? parseInt(saved) : null
    if (savedId && books.value.some(b => b.id === savedId)) {
      selectedBookId.value = savedId
    } else if (books.value.length > 0) {
      selectedBookId.value = books.value[0].id
    }

    // Load book-specific stats
    await loadBookStats()

    // Load streak info
    const streakRes = await getStreak()
    streakInfo.value = streakRes.data
  } catch (e) {
    console.error('Failed to load stats:', e)
  } finally {
    loading.value = false
  }
}

async function loadBookStats() {
  if (!selectedBookId.value) return
  try {
    const res = await getOverviewStats(selectedBookId.value)
    overview.value = res.data
  } catch (e) {
    console.error('Failed to load book stats:', e)
  }
}

function onBookChange(event: Event) {
  const id = parseInt((event.target as HTMLSelectElement).value)
  selectedBookId.value = id
  localStorage.setItem(STORAGE_KEY, String(id))
  loadBookStats()
}

async function handleCheckIn() {
  if (checkingIn.value || streakInfo.value?.checkedInToday) return
  checkingIn.value = true
  try {
    const res = await checkIn()
    streakInfo.value = res.data
  } catch (e) {
    console.error('Check-in failed:', e)
  } finally {
    checkingIn.value = false
  }
}

const progressPct = computed(() => {
  if (!overview.value || overview.value.totalWords === 0) return 0
  return Math.round((overview.value.totalLearned / overview.value.totalWords) * 100)
})

onMounted(loadStats)
</script>

<template>
  <div class="home">
    <div class="page-header">
      <p class="greeting">早上好 👋</p>
      <h1 class="page-title">学习概览</h1>
    </div>

    <div v-if="loading" class="loading" />

    <template v-else>
      <!-- Book selector -->
      <div class="book-selector">
        <label class="book-label">当前词书</label>
        <select class="book-select" :value="selectedBookId ?? undefined" @change="onBookChange">
          <option v-for="b in books" :key="b.id" :value="b.id">
            {{ b.name }} ({{ b._count.words }}词)
          </option>
        </select>
      </div>

      <!-- Key metrics -->
      <div class="metrics">
        <div class="metric" @click="router.push('/review')">
          <div class="metric-value due">{{ reviewStats?.dueCount ?? 0 }}</div>
          <div class="metric-label">待复习</div>
        </div>
        <div class="metric" @click="router.push('/learned-words')">
          <div class="metric-value">{{ overview?.totalLearned ?? 0 }}</div>
          <div class="metric-label">已学习</div>
        </div>
        <div class="metric">
          <div class="metric-value mastered">{{ reviewStats?.masteredCount ?? 0 }}</div>
          <div class="metric-label">已掌握</div>
        </div>
        <div class="metric" @click="handleCheckIn">
          <div class="metric-value streak"
            :class="{ 'checked-in': streakInfo?.checkedInToday }">
            {{ streakInfo?.streak ?? 0 }}
          </div>
          <div class="metric-label">
            <span v-if="streakInfo?.checkedInToday">今日已打卡</span>
            <span v-else>点击打卡</span>
          </div>
        </div>
      </div>

      <!-- Progress -->
      <div class="card progress-card">
        <div class="progress-header">
          <span class="progress-title">{{ selectedBook?.name ?? '词书' }} 进度</span>
          <span class="progress-pct">{{ progressPct }}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPct + '%' }" />
        </div>
        <div class="progress-footer">
          <span>{{ overview?.totalLearned ?? 0 }} / {{ overview?.totalWords ?? 0 }} 词</span>
        </div>
      </div>

      <!-- Quick actions -->
      <h2 class="section-title">快速入口</h2>
      <div class="actions">
        <button class="action primary" @click="router.push('/review')">
          <span class="action-label">开始复习</span>
          <span class="action-desc">{{ reviewStats?.dueCount ?? 0 }} 个单词待复习</span>
        </button>
        <button class="action" @click="router.push('/word-books')">
          <span class="action-label">学习新词</span>
          <span class="action-desc">选择词书继续学习</span>
        </button>
        <button class="action" @click="router.push('/statistics')">
          <span class="action-label">学习统计</span>
          <span class="action-desc">查看你的学习数据</span>
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.greeting {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 2px;
}

/* Book selector */
.book-selector {
  margin-bottom: 16px;
}
.book-label {
  display: block;
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 4px;
  font-weight: 500;
}
.book-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--card);
  font: inherit;
  font-size: 14px;
  color: var(--text);
  cursor: pointer;
  appearance: auto;
}
.book-select:focus {
  outline: none;
  border-color: var(--accent);
}

/* Metrics */
.metrics {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 20px;
}
.metric {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.15s;
}
.metric:hover {
  border-color: var(--accent);
}
.metric-value {
  font-size: 26px;
  font-weight: 600;
  line-height: 1.2;
  margin-bottom: 2px;
  color: var(--text);
}
.metric-value.due { color: var(--danger); }
.metric-value.mastered { color: var(--success); }
.metric-value.streak { color: var(--accent); }
.metric-value.streak.checked-in { color: var(--success); }
.metric-label {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 500;
}

@media (max-width: 640px) {
  .metrics { grid-template-columns: repeat(2, 1fr); }
}

/* Progress */
.progress-card {
  padding: 18px 20px;
  margin-bottom: 24px;
}
.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.progress-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
}
.progress-pct {
  font-size: 13px;
  font-weight: 600;
  color: var(--accent);
}
.progress-bar {
  height: 6px;
  background: #f5f5f4;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 8px;
}
.progress-fill {
  height: 100%;
  background: var(--accent);
  border-radius: 3px;
  transition: width 0.5s ease;
}
.progress-footer {
  font-size: 12px;
  color: var(--text-muted);
}

/* Section */
.section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Actions */
.actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.action {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  padding: 14px 18px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;
  font-family: inherit;
}
.action:hover {
  border-color: var(--accent);
}
.action.primary {
  background: var(--accent);
  border-color: var(--accent);
}
.action.primary .action-label { color: #fff; }
.action.primary .action-desc { color: rgba(255, 255, 255, 0.75); }
.action.primary:hover {
  background: var(--accent-hover);
  border-color: var(--accent-hover);
}
.action-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}
.action-desc {
  font-size: 12px;
  color: var(--text-muted);
}
</style>
