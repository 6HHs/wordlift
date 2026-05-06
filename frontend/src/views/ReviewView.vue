<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getTodayReview, submitReview } from '../api'
import type { UserWord, ReviewStats } from '../types'
import DisplayToggle from '../components/DisplayToggle.vue'
import FlashCard from '../components/FlashCard.vue'

const userWords = ref<UserWord[]>([])
const currentIndex = ref(0)
const stats = ref<ReviewStats | null>(null)
const loading = ref(true)
const message = ref('')
const completed = ref(false)

onMounted(async () => {
  try {
    const res = await getTodayReview()
    userWords.value = res.data.words
    stats.value = res.data.stats
    if (userWords.value.length === 0) completed.value = true
  } catch (e) {
    console.error('Failed to load review:', e)
  } finally { loading.value = false }
})

const currentWord = computed(() => userWords.value[currentIndex.value]?.word ?? null)

async function handleRate(rating: 'again' | 'good' | 'easy') {
  if (!currentWord.value) return
  try {
    await submitReview(currentWord.value.id, rating)
    userWords.value.splice(currentIndex.value, 1)
    if (currentIndex.value >= userWords.value.length && userWords.value.length > 0)
      currentIndex.value = userWords.value.length - 1
    if (userWords.value.length === 0) completed.value = true
    const labels = { again: '标记为忘记', good: '下次见', easy: '太简单了' }
    message.value = labels[rating]
    setTimeout(() => (message.value = ''), 1500)
  } catch (e) { console.error(e) }
}

function handleNext() { if (currentIndex.value < userWords.value.length - 1) currentIndex.value++ }
function handlePrev() { if (currentIndex.value > 0) currentIndex.value-- }

const total = computed(() => stats.value?.dueCount ?? 0)
const done = computed(() => total.value - userWords.value.length)
const progressPct = computed(() => total.value > 0 ? (done.value / total.value) * 100 : 0)
</script>

<template>
  <div class="review">
    <div class="page-header">
      <h1 class="page-title">复习</h1>
      <p class="page-desc">间隔重复巩固记忆</p>
      <DisplayToggle class="toggle-mobile" />
    </div>

    <div v-if="loading" class="loading" />

    <div v-else-if="completed" class="empty-state">
      <span class="icon">🎉</span>
      <p>今日复习已完成</p>
      <router-link to="/word-books" class="btn-link">学习新词</router-link>
    </div>

    <template v-else>
      <div class="review-stats">
        <div class="rs-item">
          <span class="rs-value due">{{ userWords.length }}</span>
          <span class="rs-label">剩余</span>
        </div>
        <div class="rs-item">
          <span class="rs-value done">{{ done }}</span>
          <span class="rs-label">已完成</span>
        </div>
        <div class="rs-item">
          <span class="rs-value fire">{{ stats?.streak ?? 0 }}</span>
          <span class="rs-label">连续</span>
        </div>
      </div>

      <div class="progress-track">
        <div class="progress-fill" :style="{ width: progressPct + '%' }" />
      </div>

      <FlashCard
        v-if="currentWord"
        :key="currentWord.id"
        :word="currentWord"
        @rate="handleRate"
        @next="handleNext"
        @prev="handlePrev"
      />

      <Transition name="toast">
        <div v-if="message" class="toast">{{ message }}</div>
      </Transition>
    </template>
  </div>
</template>

<style scoped>
.toggle-mobile {
  margin-top: 12px;
}
.page-header {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 20px;
}

.review-stats {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}
.rs-item {
  flex: 1;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 12px;
  text-align: center;
}
.rs-value {
  font-size: 20px;
  font-weight: 600;
  display: block;
  line-height: 1.3;
  color: var(--text);
}
.rs-value.due { color: var(--danger); }
.rs-value.done { color: var(--success); }
.rs-value.fire { color: var(--accent); }
.rs-label {
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 500;
}

.progress-track {
  height: 4px;
  background: #f5f5f4;
  border-radius: 2px;
  margin-bottom: 20px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: var(--success);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.toast {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--text);
  color: #fff;
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  z-index: 200;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}
.toast-enter-active, .toast-leave-active { transition: all 0.25s ease; }
.toast-enter-from { opacity: 0; transform: translateX(-50%) translateY(12px); }
.toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(12px); }
</style>
