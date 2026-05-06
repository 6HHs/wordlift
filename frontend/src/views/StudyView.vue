<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getNewWords, getWordBooks, submitReview, fillPhonetics } from '../api'
import type { Word, WordBook } from '../types'
import DisplayToggle from '../components/DisplayToggle.vue'
import FlashCard from '../components/FlashCard.vue'

const route = useRoute()
const router = useRouter()

const bookId = computed(() => +route.params.bookId)
const bookName = ref('词书')
const allWords = ref<Word[]>([])
const sessionWords = ref<Word[]>([])
const currentIndex = ref(0)
const loading = ref(true)
const message = ref('')

// Goal state
const showGoalDialog = ref(false)
const goalInput = ref(10)
const shuffledMode = ref(false)
const goal = ref(0)               // user-set target
const completed = ref(false)       // all words in book used up

// Completion state
const showCompletion = ref(false)
const remainingCount = ref(0)
const motivationalQuotes = [
  '🎉 太棒了！坚持就是胜利！',
  '🌟 今天的努力是明天的实力！',
  '💪 学无止境，你已经迈出了坚实的一步！',
  '📚 每一个单词都是你进步的阶梯！',
  '🎯 目标达成！为自己感到骄傲！',
  '🚀 日积月累，终成大器！',
  '✨ 滴水穿石，你的毅力令人钦佩！',
  '🏆 又离英语大神近了一步！',
]
const quote = ref('')

// Phonetic fill state
const fillingPhonetics = ref(false)
const phoneticMsg = ref('')

async function handleFillPhonetics() {
  fillingPhonetics.value = true
  phoneticMsg.value = '获取音标中...'
  try {
    const res = await fillPhonetics(bookId.value)
    phoneticMsg.value = `更新了 ${res.data.updated} 个音标`
    // Reload words to get updated phonetic data
    await loadWords()
  } catch (e) {
    phoneticMsg.value = '获取音标失败'
  } finally {
    fillingPhonetics.value = false
    setTimeout(() => (phoneticMsg.value = ''), 3000)
  }
}

onMounted(async () => {
  await loadBookName()
  await loadWords()
})

watch(bookId, async () => {
  resetSession()
  await loadBookName()
  await loadWords()
})

function resetSession() {
  currentIndex.value = 0
  goal.value = 0
  showGoalDialog.value = false
  showCompletion.value = false
  completed.value = false
  sessionWords.value = []
}

async function loadBookName() {
  try {
    const res = await getWordBooks()
    const book = res.data.find((b: WordBook) => b.id === bookId.value)
    if (book) bookName.value = book.name
  } catch { /* ignore */ }
}

async function loadWords() {
  loading.value = true
  completed.value = false
  try {
    const res = await getNewWords(bookId.value)
    allWords.value = res.data
    if (allWords.value.length === 0) {
      completed.value = true
    } else {
      // Show goal dialog after words load
      showGoalDialog.value = true
      goalInput.value = Math.min(allWords.value.length, 10)
    }
  } catch (e) {
    console.error('Failed to load words:', e)
  } finally {
    loading.value = false
  }
}

function startSession() {
  let g = Math.max(1, Math.min(goalInput.value, allWords.value.length))
  goal.value = g

  // Build session word list
  let list = [...allWords.value]
  if (shuffledMode.value) {
    list = list.sort(() => Math.random() - 0.5)
  }
  sessionWords.value = list.slice(0, g)
  currentIndex.value = 0
  showGoalDialog.value = false
}

const currentWord = computed(() => sessionWords.value[currentIndex.value] ?? null)

const progressPct = computed(() => {
  if (goal.value === 0) return 0
  return Math.round(((currentIndex.value + 1) / goal.value) * 100)
})

async function handleRate(rating: 'again' | 'good' | 'easy') {
  if (!currentWord.value) return
  try {
    await submitReview(currentWord.value.id, rating)
    const labels = { again: '标记为忘记', good: '标记为记得', easy: '标记为太简单' }
    message.value = labels[rating]
    setTimeout(() => (message.value = ''), 1500)
    handleNext()
  } catch (e) {
    console.error(e)
  }
}

function handleNext() {
  const next = currentIndex.value + 1
  if (next >= goal.value) {
    // Goal reached — show completion dialog
    quote.value = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]
    remainingCount.value = Math.max(0, allWords.value.length - goal.value)
    // Remove studied words from pool
    const studiedIds = new Set(sessionWords.value.map(w => w.id))
    allWords.value = allWords.value.filter(w => !studiedIds.has(w.id))
    showCompletion.value = true
  } else {
    currentIndex.value = next
  }
}

function handlePrev() {
  if (currentIndex.value > 0) currentIndex.value--
}

function toggleShuffleLive() {
  shuffledMode.value = !shuffledMode.value
  if (shuffledMode.value) {
    const current = currentWord.value
    sessionWords.value = [...sessionWords.value].sort(() => Math.random() - 0.5)
    // Try to keep current position if possible
    if (current) {
      const idx = sessionWords.value.findIndex(w => w.id === current.id)
      if (idx >= 0) currentIndex.value = idx
    }
  }
}

function continueStudy() {
  showCompletion.value = false
  showGoalDialog.value = true
  goalInput.value = Math.min(allWords.value.length, 10)
}

function goBack() {
  router.push('/word-books')
}
</script>

<template>
  <div class="study">
    <div class="top-bar">
      <button class="back" @click="goBack">← {{ bookName }}</button>
      <div class="top-right">
        <button
          v-if="!showGoalDialog && !showCompletion && goal > 0"
          class="phonetic-btn"
          :disabled="fillingPhonetics"
          @click="handleFillPhonetics"
          title="获取音标"
        >🔤</button>
        <button
          v-if="goal > 0 && !showCompletion"
          class="shuffle-btn"
          :class="{ active: shuffledMode }"
          @click="toggleShuffleLive"
          title="乱序"
        >🔀</button>
        <DisplayToggle />
      </div>
    </div>

    <div v-if="loading" class="loading" />

    <div v-else-if="completed" class="empty-state">
      <span class="icon">🎉</span>
      <p>当前词书的单词已全部学过</p>
      <router-link to="/word-books" class="btn-link">选择其他词书</router-link>
    </div>

    <!-- Goal setting dialog -->
    <Teleport to="body">
      <div v-if="showGoalDialog" class="dialog-overlay" @click.self="allWords.length === 0 ? goBack() : undefined">
        <div class="dialog">
          <h2 class="dialog-title">今日学习设置</h2>
          <p class="dialog-sub">{{ bookName }} · 剩余 {{ allWords.length }} 词</p>

          <label class="dialog-label">今天打算学习多少个单词？</label>
          <div class="input-wrap">
            <button class="step-btn" @click="goalInput = Math.max(1, goalInput - 5)">−5</button>
            <input
              type="number"
              class="num-input"
              :min="1"
              :max="allWords.length"
              v-model.number="goalInput"
              @keyup.enter="startSession"
            />
            <button class="step-btn" @click="goalInput = Math.min(allWords.length, goalInput + 5)">+5</button>
          </div>
          <div class="quick-btns">
            <button
              v-for="n in [5, 10, 20, 50]"
              :key="n"
              class="quick-btn"
              :class="{ active: goalInput === n }"
              @click="goalInput = Math.min(n, allWords.length)"
            >{{ n }}词</button>
            <button
              class="quick-btn"
              :class="{ active: goalInput === allWords.length }"
              @click="goalInput = allWords.length"
            >全部</button>
          </div>

          <label class="dialog-label" style="margin-top:16px">学习顺序</label>
          <div class="order-btns">
            <button
              class="order-btn"
              :class="{ active: !shuffledMode }"
              @click="shuffledMode = false"
            >📖 顺序</button>
            <button
              class="order-btn"
              :class="{ active: shuffledMode }"
              @click="shuffledMode = true"
            >🔀 乱序</button>
          </div>

          <button class="start-btn" @click="startSession">开始学习</button>
        </div>
      </div>
    </Teleport>

    <!-- Completion dialog -->
    <Teleport to="body">
      <div v-if="showCompletion" class="dialog-overlay">
        <div class="dialog completion-dialog">
          <p class="completion-quote">{{ quote }}</p>
          <p class="completion-detail">
            已完成 {{ goal }} 个单词的学习
            <span v-if="remainingCount > 0">，还有 {{ remainingCount }} 个单词待学习</span>
          </p>
          <div class="completion-actions">
            <button v-if="remainingCount > 0" class="start-btn" @click="continueStudy">继续学习</button>
            <button class="back-btn" @click="goBack">返回词书</button>
          </div>
        </div>
      </div>
    </Teleport>

    <template v-if="currentWord && goal > 0 && !showGoalDialog && !showCompletion">
      <div class="session-bar">
        <span class="session-label">{{ bookName }}</span>
        <span class="session-count">{{ currentIndex + 1 }} / {{ goal }}</span>
      </div>
      <div class="progress-track">
        <div class="progress-fill" :style="{ width: progressPct + '%' }" />
      </div>

      <FlashCard
        :key="currentWord.id"
        :word="currentWord"
        @rate="handleRate"
        @next="handleNext"
        @prev="handlePrev"
      />

      <Transition name="toast">
        <div v-if="message" class="toast">{{ message }}</div>
      </Transition>
      <Transition name="toast">
        <div v-if="phoneticMsg" class="toast phonetic-toast">{{ phoneticMsg }}</div>
      </Transition>
    </template>
  </div>
</template>

<style scoped>
.study {
  max-width: 520px;
  margin: 0 auto;
}
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.top-right {
  display: flex;
  align-items: center;
  gap: 8px;
}
.back {
  background: none;
  border: none;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  padding: 0;
  cursor: pointer;
  transition: color 0.15s;
}
.back:hover { color: var(--accent); }

.shuffle-btn {
  background: none;
  border: 1px solid var(--border-light);
  border-radius: 7px;
  padding: 4px 10px;
  font-size: 16px;
  cursor: pointer;
  line-height: 1;
  transition: all 0.15s;
}
.shuffle-btn:hover { border-color: var(--accent); }
.shuffle-btn.active {
  background: var(--accent-bg);
  border-color: var(--accent);
}

.phonetic-btn {
  background: none;
  border: 1px solid var(--border-light);
  border-radius: 7px;
  padding: 4px 10px;
  font-size: 16px;
  cursor: pointer;
  line-height: 1;
  transition: all 0.15s;
}
.phonetic-btn:hover { border-color: var(--accent); }
.phonetic-btn:disabled { opacity: 0.4; cursor: not-allowed; }

/* ── Goal dialog ── */
.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}
.dialog {
  background: var(--card);
  border-radius: 14px;
  padding: 28px 32px;
  width: 360px;
  max-width: 90vw;
  box-shadow: 0 16px 48px rgba(0,0,0,0.18);
}
.dialog-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text);
  margin: 0 0 2px;
}
.dialog-sub {
  font-size: 13px;
  color: var(--text-muted);
  margin: 0 0 18px;
}
.dialog-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 8px;
}
.dialog-label:first-of-type {
  margin-top: 0;
}
.input-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}
.step-btn {
  width: 44px;
  height: 44px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--card);
  font-size: 15px;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.12s;
}
.step-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}
.num-input {
  flex: 1;
  height: 44px;
  text-align: center;
  font-size: 22px;
  font-weight: 700;
  border: 2px solid var(--accent);
  border-radius: 10px;
  outline: none;
  color: var(--text);
  background: var(--card);
  font-family: inherit;
  -moz-appearance: textfield;
}
.num-input::-webkit-outer-spin-button,
.num-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.num-input:focus {
  border-color: var(--accent-hover);
}
.quick-btns {
  display: flex;
  gap: 6px;
  margin-top: 10px;
}
.quick-btn {
  flex: 1;
  padding: 7px 0;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--card);
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.12s;
  font-family: inherit;
}
.quick-btn:hover { border-color: var(--accent); }
.quick-btn.active {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}
.order-btns {
  display: flex;
  gap: 8px;
}
.order-btn {
  flex: 1;
  padding: 10px 0;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--card);
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.12s;
  font-family: inherit;
}
.order-btn:hover { border-color: var(--accent); }
.order-btn.active {
  background: var(--accent-bg);
  border-color: var(--accent);
  color: var(--accent);
  font-weight: 600;
}
.start-btn {
  width: 100%;
  margin-top: 20px;
  padding: 12px;
  border: none;
  border-radius: 10px;
  background: var(--accent);
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.12s;
  font-family: inherit;
}
.start-btn:hover {
  background: var(--accent-hover);
}

/* ── Completion dialog ── */
.completion-dialog {
  text-align: center;
  padding: 36px 32px;
}
.completion-quote {
  font-size: 22px;
  font-weight: 700;
  color: var(--text);
  margin: 0 0 12px;
  line-height: 1.4;
}
.completion-detail {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0 0 24px;
}
.completion-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.completion-actions .start-btn {
  margin-top: 0;
}
.back-btn {
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--card);
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.12s;
  font-family: inherit;
}
.back-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

/* Session */
.session-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.session-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
}
.session-count {
  font-size: 12px;
  color: var(--text-muted);
}
.progress-track {
  height: 4px;
  background: #f5f5f4;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 24px;
}
.progress-fill {
  height: 100%;
  background: var(--accent);
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
