<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useWordStore } from '../stores/wordStore'
import type { Word } from '../types'

const props = defineProps<{
  word: Word
}>()

const emit = defineEmits<{
  (e: 'rate', rating: 'again' | 'good' | 'easy'): void
  (e: 'next'): void
  (e: 'prev'): void
}>()

const store = useWordStore()
const flipped = ref(false)
const currentWord = ref(props.word)
let currentAudio: HTMLAudioElement | null = null

function speak(text?: string) {
  const word = text ?? currentWord.value.word
  if (!word) return
  // Stop any ongoing audio
  if (currentAudio) { currentAudio.pause(); currentAudio = null }
  // Use TTS audio API for cross-platform compatibility (works on HTTP, Android, iOS)
  const audio = new Audio()
  currentAudio = audio
  audio.src = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(word)}&type=1`
  audio.volume = 1
  audio.play().catch(e => {
    // Fallback: try browser speech synthesis if audio fails
    const synth = window.speechSynthesis
    if (synth) {
      synth.cancel()
      const u = new SpeechSynthesisUtterance(word)
      u.lang = 'en-US'
      u.rate = 0.9
      synth.speak(u)
    }
  })
}

const isBothMode = computed(() => store.displayMode === 'both')

const showFront = computed(() => {
  if (store.displayMode === 'chinese' && !flipped.value) return 'meaning'
  if (store.displayMode === 'english' && !flipped.value) return 'word'
  if (!flipped.value) return 'word'
  return 'meaning'
})

function toggleFlip() {
  if (isBothMode.value) return
  flipped.value = !flipped.value
}

function handleRate(rating: 'again' | 'good' | 'easy') {
  emit('rate', rating)
  flipped.value = false
}

function handleNext() {
  emit('next')
  flipped.value = false
}

function handlePrev() {
  emit('prev')
  flipped.value = false
}

watch(
  () => props.word,
  (val) => {
    currentWord.value = val
    flipped.value = false
    if (store.autoPlay) {
      speak(val.word)
    }
  },
  { immediate: true },
)

function handleKeydown(e: KeyboardEvent) {
  if (e.key === ' ') {
    e.preventDefault()
    toggleFlip()
  } else if (e.key === 'ArrowRight') {
    handleNext()
  } else if (e.key === 'ArrowLeft') {
    handlePrev()
  } else if (e.key === '1') {
    handleRate('again')
  } else if (e.key === '2') {
    handleRate('good')
  } else if (e.key === '3') {
    handleRate('easy')
  }
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => window.removeEventListener('keydown', handleKeydown))
</script>

<template>
  <div class="flashcard-container">
    <div
      class="flashcard"
      :class="{ flipped, 'no-flip': isBothMode }"
      @click="toggleFlip"
    >
      <!-- 全显模式：显示全部内容，不可翻转 -->
      <div v-if="isBothMode" class="card-both">
        <h2 class="word-text">{{ word.word }}</h2>
        <p v-if="word.phonetic" class="phonetic">{{ word.phonetic }}</p>
        <p class="meaning-text">{{ word.meaning }}</p>
        <p v-if="word.example" class="example">{{ word.example }}</p>
      </div>

      <!-- 仅中文/仅英文模式：翻转模式 -->
      <div v-else class="card-inner">
        <div class="card-front">
          <template v-if="showFront === 'word'">
            <h2 class="word-text">{{ word.word }}</h2>
            <p v-if="word.phonetic" class="phonetic">{{ word.phonetic }}</p>
          </template>
          <template v-else>
            <h2 class="meaning-text">{{ word.meaning }}</h2>
          </template>
          <p class="hint">点击翻转</p>
        </div>
        <div class="card-back">
          <h2 class="word-text">{{ word.word }}</h2>
          <p v-if="word.phonetic" class="phonetic">{{ word.phonetic }}</p>
          <p class="meaning-text">{{ word.meaning }}</p>
          <p v-if="word.example" class="example">{{ word.example }}</p>
        </div>
      </div>
    </div>

    <div class="card-actions">
      <button class="btn-speak" @click="speak()" title="发音">
        <span class="btn-icon">🔊</span> 发音
      </button>
      <button
        class="btn-auto"
        :class="{ active: store.autoPlay }"
        @click="store.autoPlay = !store.autoPlay"
        title="自动发音"
      >
        <span class="btn-icon">🎧</span>
        <span class="auto-label">{{ store.autoPlay ? '自动' : '手动' }}</span>
      </button>
    </div>

    <!-- 难度评分按钮（全显模式也显示） -->
    <div class="rate-buttons">
      <button class="btn-again" @click="handleRate('again')">
        <span class="rate-icon">✕</span>
        <span class="rate-label">忘记</span>
        <span class="rate-key">1</span>
      </button>
      <button class="btn-good" @click="handleRate('good')">
        <span class="rate-icon">✓</span>
        <span class="rate-label">记得</span>
        <span class="rate-key">2</span>
      </button>
      <button class="btn-easy" @click="handleRate('easy')">
        <span class="rate-icon">★</span>
        <span class="rate-label">太简单</span>
        <span class="rate-key">3</span>
      </button>
    </div>

    <div class="nav-buttons">
      <button class="btn-nav" @click="handlePrev">
        <span class="nav-arrow">←</span> 上一个
      </button>
      <button class="btn-nav" @click="handleNext">
        下一个 <span class="nav-arrow">→</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.flashcard-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  max-width: 520px;
  margin: 0 auto;
}

.flashcard {
  width: 100%;
  min-height: 280px;
  border-radius: 20px;
  cursor: pointer;
  perspective: 1000px;
}
.flashcard:hover .card-inner {
  box-shadow: 0 8px 32px rgba(217, 119, 6, 0.1), 0 2px 8px rgba(0, 0, 0, 0.06);
}
.flashcard.no-flip {
  cursor: default;
}
.flashcard.no-flip:hover .card-inner {
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0, 0, 0, 0.04);
}

.card-inner {
  position: relative;
  width: 100%;
  min-height: 280px;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;
  border-radius: 20px;
  background: var(--card);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0, 0, 0, 0.04);
  border: 1px solid var(--border);
}
.flashcard.flipped .card-inner {
  transform: rotateY(180deg);
}

.card-front,
.card-back,
.card-both {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 36px 32px;
  border-radius: 20px;
}
.card-back {
  transform: rotateY(180deg);
}
.card-both {
  position: relative;
  inset: auto;
  gap: 8px;
  padding: 36px 32px;
  min-height: 280px;
}

.word-text {
  font-size: 32px;
  font-weight: 700;
  color: var(--text);
  margin: 0 0 8px;
  letter-spacing: 0.5px;
}
.phonetic {
  color: var(--text-muted);
  font-size: 16px;
  margin: 0 0 12px;
  font-family: 'Times New Roman', serif;
}
.meaning-text {
  font-size: 20px;
  color: var(--accent);
  margin: 0;
  line-height: 1.7;
  font-weight: 500;
}
.example {
  color: var(--text-secondary);
  font-size: 14px;
  margin: 12px 0 0;
  font-style: italic;
  line-height: 1.6;
  padding: 0 16px;
  border-left: 3px solid var(--border);
}
.hint {
  color: var(--text-muted);
  font-size: 12px;
  margin-top: 16px;
}

.card-actions {
  display: flex;
  gap: 12px;
}
.btn-speak {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 24px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--card);
  cursor: pointer;
  font-size: 14px;
  color: var(--accent);
  transition: all 0.2s;
  font-weight: 500;
  font-family: inherit;
}
.btn-speak:hover {
  background: var(--accent-bg);
  border-color: var(--accent);
  box-shadow: 0 2px 8px rgba(217, 119, 6, 0.1);
}
.btn-icon {
  font-size: 18px;
}
.btn-auto {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--card);
  cursor: pointer;
  font-size: 14px;
  color: var(--text-muted);
  transition: all 0.2s;
  font-weight: 500;
  font-family: inherit;
}
.btn-auto:hover {
  background: var(--accent-bg);
  border-color: var(--accent);
}
.btn-auto.active {
  color: var(--accent);
  border-color: var(--accent);
  background: var(--accent-bg);
}

.rate-buttons {
  display: flex;
  gap: 12px;
  width: 100%;
}
.rate-buttons button {
  flex: 1;
  padding: 14px 12px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  position: relative;
  font-family: inherit;
}
.rate-icon { font-size: 18px; }
.rate-key {
  position: absolute;
  top: 4px;
  right: 8px;
  font-size: 10px;
  opacity: 0.6;
  font-weight: 400;
}
.btn-again {
  background: var(--danger);
}
.btn-again:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4); }
.btn-good {
  background: var(--accent);
}
.btn-good:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(217, 119, 6, 0.4); }
.btn-easy {
  background: var(--success);
}
.btn-easy:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(22, 163, 74, 0.4); }

.nav-buttons {
  display: flex;
  gap: 12px;
  width: 100%;
}
.btn-nav {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--card);
  cursor: pointer;
  font-size: 14px;
  color: var(--text-secondary);
  transition: all 0.2s;
  font-weight: 500;
  font-family: inherit;
}
.btn-nav:hover {
  background: var(--accent-bg);
  color: var(--accent);
  border-color: var(--accent);
}
.nav-arrow {
  font-size: 16px;
}
</style>
