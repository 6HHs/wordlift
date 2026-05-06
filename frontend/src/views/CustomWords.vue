<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getCustomWords, createCustomWord, deleteCustomWord } from '../api'
import type { Word } from '../types'

const words = ref<Word[]>([])
const loading = ref(true)
const showForm = ref(false)
const submitting = ref(false)

const form = ref({ word: '', meaning: '', phonetic: '', example: '' })

onMounted(async () => {
  await loadWords()
})

async function loadWords() {
  loading.value = true
  try {
    const res = await getCustomWords()
    words.value = res.data
  } catch (e) {
    console.error('Failed to load custom words:', e)
  } finally {
    loading.value = false
  }
}

async function handleSubmit() {
  if (!form.value.word.trim() || !form.value.meaning.trim()) return
  submitting.value = true
  try {
    await createCustomWord(form.value)
    form.value = { word: '', meaning: '', phonetic: '', example: '' }
    showForm.value = false
    await loadWords()
  } catch (e) {
    console.error('Failed to create word:', e)
  } finally {
    submitting.value = false
  }
}

async function handleDelete(id: number) {
  if (!confirm('确定删除这个单词吗？')) return
  try {
    await deleteCustomWord(id)
    await loadWords()
  } catch (e) {
    console.error('Failed to delete word:', e)
  }
}
</script>

<template>
  <div class="custom-words">
    <div class="page-header">
      <div>
        <h1 class="page-title">自定义生词本</h1>
        <p class="page-desc">收藏你在别处遇到的生词</p>
      </div>
      <button class="btn-add" @click="showForm = !showForm">
        {{ showForm ? '取消' : '+ 添加单词' }}
      </button>
    </div>

    <!-- Add form -->
    <Transition name="slide">
      <div v-if="showForm" class="add-form">
        <div class="form-row">
          <input v-model="form.word" placeholder="单词 *" class="input" />
          <input v-model="form.phonetic" placeholder="音标 (可选)" class="input" />
        </div>
        <input v-model="form.meaning" placeholder="释义 *" class="input" />
        <input v-model="form.example" placeholder="例句 (可选)" class="input" />
        <button
          class="btn-save"
          :disabled="!form.word.trim() || !form.meaning.trim() || submitting"
          @click="handleSubmit"
        >
          {{ submitting ? '保存中...' : '保存' }}
        </button>
      </div>
    </Transition>

    <!-- Word list -->
    <div v-if="loading" class="loading" />

    <div v-else-if="words.length === 0" class="empty-state">
      <span class="icon">📝</span>
      <p>还没有自定义单词</p>
      <button class="btn-link" @click="showForm = true">添加第一个单词</button>
    </div>

    <div v-else class="word-list">
      <div v-for="word in words" :key="word.id" class="word-item">
        <div class="word-content">
          <div class="word-top">
            <span class="word-text">{{ word.word }}</span>
            <span v-if="word.phonetic" class="word-phonetic">{{ word.phonetic }}</span>
          </div>
          <div class="word-meaning">{{ word.meaning }}</div>
          <p v-if="word.example" class="word-example">{{ word.example }}</p>
        </div>
        <button class="btn-delete" @click="handleDelete(word.id)">
          ✕
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-words {
  max-width: 600px;
  margin: 0 auto;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  gap: 16px;
}
.page-title { margin-bottom: 2px; }
.page-desc { color: var(--text-muted); font-size: 14px; }

.btn-add {
  padding: 10px 20px;
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
  white-space: nowrap;
  cursor: pointer;
  font-family: inherit;
}
.btn-add:hover { background: var(--accent-hover); }

/* Form */
.add-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: var(--card);
  padding: 20px;
  border-radius: var(--radius);
  margin-bottom: 20px;
  border: 1px solid var(--accent-light);
}
.form-row {
  display: flex;
  gap: 10px;
}
.form-row .input {
  flex: 1;
}
.input {
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: 10px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
  font-family: inherit;
  background: var(--card);
  color: var(--text);
}
.input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.1);
}
.btn-save {
  padding: 12px;
  background: var(--success);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.2s;
  cursor: pointer;
  font-family: inherit;
}
.btn-save:hover { background: #15803d; }
.btn-save:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

/* Word list */
.word-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.word-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: var(--card);
  padding: 16px 18px;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  transition: all 0.2s;
}
.word-item:hover {
  border-color: var(--accent);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
.word-content {
  flex: 1;
  min-width: 0;
}
.word-top {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 4px;
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
}
.word-example {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 4px 0 0;
  font-style: italic;
}
.btn-delete {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: #fef2f2;
  color: var(--danger);
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
}
.btn-delete:hover {
  background: #fee2e2;
}

/* Transitions */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
