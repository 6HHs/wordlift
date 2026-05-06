<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getWordBooks } from '../api'
import type { WordBook } from '../types'

const router = useRouter()
const books = ref<WordBook[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await getWordBooks()
    books.value = res.data
  } catch (e) {
    console.error('Failed to load word books:', e)
  } finally {
    loading.value = false
  }
})

const levelBadge: Record<string, { label: string }> = {
  JUNIOR: { label: '初中' },
  SENIOR: { label: '高中' },
  CET4: { label: '四级' },
  CET6: { label: '六级' },
  KAOYAN: { label: '考研' },
  TOEFL: { label: '托福' },
  SAT: { label: 'SAT' },
}
</script>

<template>
  <div class="word-books">
    <div class="page-header">
      <h1 class="page-title">词书</h1>
      <p class="page-desc">选择一本词书开始学习</p>
    </div>

    <div v-if="loading" class="loading" />

    <div v-else class="list">
      <div
        v-for="book in books"
        :key="book.id"
        class="book-row"
        @click="router.push(`/study/${book.id}`)"
      >
        <div class="book-left">
          <span class="book-badge">{{ levelBadge[book.level]?.label || book.level }}</span>
          <div class="book-info">
            <div class="book-name">{{ book.name }}</div>
            <div class="book-count">{{ book._count.words }} 词</div>
          </div>
        </div>
        <span class="book-arrow">→</span>
      </div>

      <!-- Custom words link -->
      <div class="book-row custom" @click="router.push('/custom-words')">
        <div class="book-left">
          <span class="book-badge custom-badge">+</span>
          <div class="book-info">
            <div class="book-name">自定义生词本</div>
            <div class="book-count">手动添加生词</div>
          </div>
        </div>
        <span class="book-arrow">→</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.book-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  cursor: pointer;
  transition: all 0.15s;
}
.book-row:hover {
  border-color: var(--accent);
}
.book-row.custom {
  border-style: dashed;
}
.book-left {
  display: flex;
  align-items: center;
  gap: 13px;
}
.book-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 28px;
  background: var(--accent-bg);
  color: var(--accent);
  font-size: 12px;
  font-weight: 600;
  border-radius: 6px;
  flex-shrink: 0;
}
.custom-badge {
  background: #f5f5f4;
  color: var(--text-muted);
  font-size: 16px;
}
.book-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.book-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}
.book-count {
  font-size: 12px;
  color: var(--text-muted);
}
.book-arrow {
  font-size: 14px;
  color: var(--text-muted);
  transition: transform 0.15s;
}
.book-row:hover .book-arrow {
  transform: translateX(3px);
  color: var(--accent);
}
</style>
