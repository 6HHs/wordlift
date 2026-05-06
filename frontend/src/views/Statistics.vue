<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  getOverviewStats,
  getDistribution,
  getForgettingCurve,
} from '../api'
import type { OverviewStats, Distribution } from '../types'

const overview = ref<OverviewStats | null>(null)
const distribution = ref<Distribution | null>(null)
const curve = ref<{ date: string; count: number }[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const [ovRes, distRes, curveRes] = await Promise.all([
      getOverviewStats(),
      getDistribution(),
      getForgettingCurve(),
    ])
    overview.value = ovRes.data
    distribution.value = distRes.data
    curve.value = curveRes.data
  } catch (e) {
    console.error('Failed to load stats:', e)
  } finally {
    loading.value = false
  }
})

function maxCurveCount(): number {
  if (curve.value.length === 0) return 1
  return Math.max(...curve.value.map((c) => c.count), 1)
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  const fmt = `${d.getMonth() + 1}/${d.getDate()}`
  const today = new Date()
  const diff = Math.round((d.getTime() - today.getTime()) / 86400000)
  if (diff === 0) return '今天'
  if (diff === 1) return '明天'
  if (diff === 2) return '后天'
  return fmt
}
</script>

<template>
  <div class="statistics">
    <div class="page-header">
      <h1 class="page-title">学习统计</h1>
      <p class="page-desc">追踪你的学习进展</p>
    </div>

    <div v-if="loading" class="loading" />

    <template v-else>
      <!-- Overview cards -->
      <div class="overview-grid">
        <div class="ov-card">
          <div class="ov-value">{{ overview?.totalLearned ?? 0 }}</div>
          <div class="ov-label">已学习</div>
        </div>
        <div class="ov-card">
          <div class="ov-value">{{ overview?.totalWords ?? 0 }}</div>
          <div class="ov-label">总词库</div>
        </div>
        <div class="ov-card">
          <div class="ov-value due">{{ overview?.dueCount ?? 0 }}</div>
          <div class="ov-label">待复习</div>
        </div>
        <div class="ov-card">
          <div class="ov-value fire">{{ overview?.streak ?? 0 }}</div>
          <div class="ov-label">连续打卡(天)</div>
        </div>
      </div>

      <!-- Distribution -->
      <div class="chart-card">
        <h2 class="chart-title">熟练度分布</h2>
        <div v-if="distribution" class="dist-list">
          <div class="dist-item">
            <div class="dist-label">
              <span class="dot new" />
              <span>未学</span>
            </div>
            <div class="dist-bar">
              <div
                class="dist-fill new"
                :style="{ width: `${(distribution.NEW / Math.max(overview?.totalWords ?? 1, 1)) * 100}%` }"
              />
            </div>
            <span class="dist-value">{{ distribution.NEW }}</span>
          </div>
          <div class="dist-item">
            <div class="dist-label">
              <span class="dot learning" />
              <span>学习中</span>
            </div>
            <div class="dist-bar">
              <div
                class="dist-fill learning"
                :style="{ width: `${(distribution.LEARNING / Math.max(overview?.totalWords ?? 1, 1)) * 100}%` }"
              />
            </div>
            <span class="dist-value">{{ distribution.LEARNING }}</span>
          </div>
          <div class="dist-item">
            <div class="dist-label">
              <span class="dot reviewing" />
              <span>复习中</span>
            </div>
            <div class="dist-bar">
              <div
                class="dist-fill reviewing"
                :style="{ width: `${(distribution.REVIEWING / Math.max(overview?.totalWords ?? 1, 1)) * 100}%` }"
              />
            </div>
            <span class="dist-value">{{ distribution.REVIEWING }}</span>
          </div>
          <div class="dist-item">
            <div class="dist-label">
              <span class="dot mastered" />
              <span>已掌握</span>
            </div>
            <div class="dist-bar">
              <div
                class="dist-fill mastered"
                :style="{ width: `${(distribution.MASTERED / Math.max(overview?.totalWords ?? 1, 1)) * 100}%` }"
              />
            </div>
            <span class="dist-value">{{ distribution.MASTERED }}</span>
          </div>
        </div>
      </div>

      <!-- Forgetting curve -->
      <div class="chart-card">
        <h2 class="chart-title">未来复习压力</h2>
        <p class="chart-sub">接下来 14 天预计需要复习的单词数</p>
        <div class="curve-container">
          <div class="curve-bars">
            <div
              v-for="(item, idx) in curve"
              :key="idx"
              class="bar-col"
            >
              <div class="bar-wrapper">
                <div
                  class="bar-fill"
                  :class="{ today: idx === 0 }"
                  :style="{ height: `${(item.count / maxCurveCount()) * 100}%` }"
                >
                  <span v-if="item.count > 0" class="bar-num">{{ item.count }}</span>
                </div>
              </div>
              <div class="bar-date">{{ formatDate(item.date) }}</div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.statistics {
  max-width: 720px;
  margin: 0 auto;
}
.page-header {
  margin-bottom: 24px;
}
.page-title { margin-bottom: 2px; }
.page-desc { color: var(--text-muted); font-size: 14px; }

/* Overview grid */
.overview-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}
.ov-card {
  background: var(--card);
  border-radius: var(--radius);
  padding: 20px 16px;
  text-align: center;
  border: 1px solid var(--border);
}
.ov-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--accent);
  line-height: 1.2;
  margin-bottom: 4px;
}
.ov-value.due { color: var(--danger); }
.ov-value.fire { color: var(--accent); }
.ov-label {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 500;
}

@media (max-width: 640px) {
  .overview-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Chart card */
.chart-card {
  background: var(--card);
  border-radius: var(--radius);
  padding: 24px;
  margin-bottom: 16px;
  border: 1px solid var(--border);
}
.chart-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text);
  margin: 0 0 4px;
}
.chart-sub {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 20px;
}

/* Distribution */
.dist-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.dist-item {
  display: flex;
  align-items: center;
  gap: 12px;
}
.dist-label {
  width: 70px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--text);
  font-weight: 500;
  flex-shrink: 0;
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}
.dot.new { background: #d1d5db; }
.dot.learning { background: #60a5fa; }
.dot.reviewing { background: #fbbf24; }
.dot.mastered { background: #34d399; }
.dist-bar {
  flex: 1;
  height: 22px;
  background: var(--border-light);
  border-radius: 11px;
  overflow: hidden;
}
.dist-fill {
  height: 100%;
  border-radius: 11px;
  transition: width 0.5s ease;
}
.dist-fill.new { background: #d1d5db; }
.dist-fill.learning { background: linear-gradient(90deg, #60a5fa, #3b82f6); }
.dist-fill.reviewing { background: linear-gradient(90deg, #fbbf24, var(--accent)); }
.dist-fill.mastered { background: linear-gradient(90deg, #34d399, #10b981); }
.dist-value {
  width: 50px;
  text-align: right;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
}

/* Curve */
.curve-container {
  height: 200px;
  display: flex;
  align-items: flex-end;
}
.curve-bars {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  width: 100%;
  height: 180px;
}
.bar-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}
.bar-wrapper {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}
.bar-fill {
  width: 100%;
  max-width: 32px;
  background: linear-gradient(to top, #d97706, #fbbf24);
  border-radius: 6px 6px 2px 2px;
  min-height: 4px;
  position: relative;
  transition: height 0.5s ease;
}
.bar-fill.today {
  background: linear-gradient(to top, #b45309, #d97706);
}
.bar-num {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
  white-space: nowrap;
}
.bar-date {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 6px;
  white-space: nowrap;
}
</style>
