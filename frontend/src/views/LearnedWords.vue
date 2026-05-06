<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getLearnedWords } from '../api'
import type { UserWord } from '../types'

const words = ref<UserWord[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await getLearnedWords()
    words.value = res.data
  } catch (e) {
    console.error('Failed to load learned words:', e)
  } finally {
    loading.value = false
  }
})

const statusConfig: Record<string, { label: string; cls: string }> = {
  LEARNING: { label: '学习中', cls: 's-learning' },
  REVIEWING: { label: '复习中', cls: 's-reviewing' },
  MASTERED: { label: '已掌握', cls: 's-mastered' },
}

const levelBadge: Record<string, string> = {
  JUNIOR: '初中', SENIOR: '高中', CET4: '四级',
  CET6: '六级', KAOYAN: '考研', TOEFL: '托福', SAT: 'SAT',
}
</script>

<template>
  <div class="learned-words">
    <div class="page-header">
      <h1 class="page-title">已学习</h1>
      <p class="page-desc">共 {{ words.length }} 个单词</p>
    </div>

    <div v-if="loading" class="loading" />

    <div v-else-if="words.length === 0" class="empty-state">
      <span class="icon">📖</span>
      <p>还没有学习过单词</p>
      <router-link to="/word-books" class="btn-link">开始学习</router-link>
    </div>

    <div v-else class="word-list">
      <div v-for="uw in words" :key="uw.id" class="word-item">
        <div class="word-main">
          <div class="word-top">
            <span class="word-text">{{ uw.word.word }}</span>
            <span v-if="uw.word.phonetic" class="word-phonetic">{{ uw.word.phonetic }}</span>
          </div>
          <div class="word-meaning">{{ uw.word.meaning }}</div>
          <div class="word-meta">
            <span v-if="uw.word.wordBook" class="book-tag">{{ levelBadge[uw.word.wordBook.level] || uw.word.wordBook.name }}</span>
            <span class="review-count">复习 {{ uw.reviewCount }} 次</span>
          </div>
        </div>
        <span class="status-badge" :class="statusConfig[uw.status]?.cls || ''">
          {{ statusConfig[uw.status]?.label || uw.status }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.learned-words {
  max-width: 600px;
  margin: 0 auto;
}
.page-header {
  margin-bottom: 24px;
}
.page-title { margin-bottom: 2px; }
.page-desc { color: var(--text-muted); font-size: 14px; }

.word-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.word-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--card);
  padding: 16px 18px;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  transition: all 0.15s;
}
.word-item:hover {
  border-color: var(--accent);
}
.word-main {
  flex: 1;
  min-width: 0;
}
.word-top {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 2px;
}
.word-text {
  font-size: 17px;
  font-weight: 600;
  color: var(--text);
}
.word-phonetic {
  font-size: 13px;
  color: var(--text-muted);
}
.word-meaning {
  font-size: 15px;
  color: var(--accent);
  font-weight: 500;
  margin-bottom: 6px;
}
.word-meta {
  display: flex;
  align-items: center;
  gap: 10px;
}
.book-tag {
  font-size: 11px;
  color: var(--accent);
  background: var(--accent-bg);
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}
.review-count {
  font-size: 11px;
  color: var(--text-muted);
}

/* Status badges */
.status-badge {
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 6px;
}
.s-learning {
  color: #3b82f6;
  background: #eff6ff;
}
.s-reviewing {
  color: var(--accent);
  background: var(--accent-bg);
}
.s-mastered {
  color: #16a34a;
  background: #f0fdf4;
}
</style>
