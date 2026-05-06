<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getExamPapers, lookupWord, getPdfText } from '../api'
import type { ExamPaper } from '../types'

const route = useRoute()
const router = useRouter()
const sessionId = route.params.sessionId as string

const papers = ref<ExamPaper[]>([])
const content = ref('')
const loading = ref(true)
const errorMsg = ref('')
const viewMode = ref<'loading' | 'choice' | 'text' | 'scanned'>('loading')

const popup = ref({
  show: false,
  word: '',
  meaning: null as string | null,
  phonetic: null as string | null,
  example: null as string | null,
  x: 0,
  y: 0,
})

let lastSelection = ''
let currentPaperPath = ''

const formattedContent = computed(() => {
  if (!content.value) return ''
  let html = content.value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const lines = html.split('\n')
  const out: string[] = []
  let i = 0

  while (i < lines.length) {
    const s = lines[i].trim()

    if (!s) {
      out.push('<div class="l-sp"></div>')
      i++
      continue
    }

    // Page marker → dim
    if (/^--\s*\d+\s+of\s+\d+\s*--$/.test(s)) {
      out.push(`<div class="l-pm">${s}</div>`)
      i++
      continue
    }

    // Part heading
    if (/^Part\s/i.test(s)) {
      out.push(`<div class="l-ph">${s}</div>`)
      i++
      continue
    }

    // Section heading
    if (/^Section\s+[A-C]/i.test(s)) {
      out.push(`<div class="l-sh">${s}</div>`)
      i++
      continue
    }

    // Directions — collect consecutive text lines
    if (/^Directions?:/i.test(s)) {
      const para = [s.replace(/^Directions?:/, 'Directions:')]
      i++
      while (i < lines.length) {
        const t = lines[i].trim()
        if (!t || isStructuralLine(t)) break
        para.push(t)
        i++
      }
      out.push(`<div class="l-dir"><b>${para.join(' ')}</b></div>`)
      continue
    }

    // Writing / Listening / Reading / Translation sub-heading
    if (/^(Writing|Listening Comprehension|Reading Comprehension|Translation)/i.test(s)) {
      out.push(`<div class="l-sub">${s}</div>`)
      i++
      continue
    }

    // "Questions 1 to 4 are based on…"
    if (/^Questions?\s+\d/.test(s)) {
      out.push(`<div class="l-qg">${s}</div>`)
      i++
      continue
    }

    // Question number
    const qm = s.match(/^(\d+[.)])\s*(.*)/)
    if (qm) {
      const [, num, rest] = qm
      if (rest) {
        const parts = rest.split(/\t+/).filter(Boolean)
        if (parts.length > 1) {
          const opts = parts.map(p => fmtOpt(p.trim())).join(' ')
          out.push(`<div class="l-q"><span class="qn">${num}</span> ${opts}</div>`)
        } else {
          out.push(`<div class="l-q"><span class="qn">${num}</span> ${fmtOpt(rest.trim())}</div>`)
        }
      } else {
        out.push(`<div class="l-q"><span class="qn">${num}</span></div>`)
      }
      i++
      continue
    }

    // Option line / paragraph marker
    const om = s.match(/^([A-Z]\))\s*(.*)/)
    if (om) {
      const parts = s.split(/\t+/).filter(Boolean)
      if (parts.length > 1) {
        const opts = parts.map(p => fmtOpt(p.trim())).join(' ')
        out.push(`<div class="l-o">${opts}</div>`)
      } else {
        out.push(`<div class="l-o"><span class="ok">${om[1]}</span> ${om[2]}</div>`)
      }
      i++
      continue
    }

    // Regular text paragraph — collect consecutive lines
    const para: string[] = [s]
    i++
    while (i < lines.length) {
      const t = lines[i].trim()
      if (!t || isStructuralLine(t)) break
      para.push(t)
      i++
    }
    out.push(`<p class="l-p">${para.join(' ')}</p>`)
  }

  return out.join('\n')
})

function isStructuralLine(s: string): boolean {
  return (
    /^Part\s/i.test(s) ||
    /^Section\s+[A-C]/i.test(s) ||
    /^Directions?:/i.test(s) ||
    /^(Writing|Listening Comprehension|Reading Comprehension|Translation)/i.test(s) ||
    /^Questions?\s+\d/.test(s) ||
    /^\d+[.)]/.test(s) ||
    /^[A-Z]\)/.test(s) ||
    /^--\s*\d+\s+of\s+\d+\s*--$/.test(s)
  )
}

function fmtOpt(t: string): string {
  const m = t.match(/^([A-D]\))\s*(.*)/)
  return m ? `<span class="oi"><span class="ok">${m[1]}</span> ${m[2]}</span>` : t
}

const sessionLabel = (() => {
  const m = sessionId.match(/CET6_(\d{4})\.(\d{2})/)
  return m ? `${m[1]}年${m[2]}月` : sessionId
})()

onMounted(async () => {
  try {
    const res = await getExamPapers(sessionId)
    papers.value = res.data
    if (papers.value.length > 0) {
      await loadPaper(papers.value[0])
    } else {
      errorMsg.value = '该场次暂无真题试卷'
    }
  } catch (e: any) {
    errorMsg.value = '加载失败: ' + (e?.message || '请检查后端是否运行')
  } finally {
    loading.value = false
  }
  document.addEventListener('selectionchange', onSelectionChange)
  document.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('selectionchange', onSelectionChange)
  document.removeEventListener('keydown', onKeyDown)
})

function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape') closePopup()
}

async function loadPaper(paper: ExamPaper) {
  loading.value = true
  errorMsg.value = ''
  content.value = ''
  viewMode.value = 'loading'
  currentPaperPath = paper.relativePath

  try {
    const res = await getPdfText(sessionId, paper.relativePath)
    let text = res.data.text || ''
    text = text.replace(/([一-鿿])\s+([一-鿿])/g, '$1$2')
    text = text.replace(/\s+([,.;:!?，。；：！？])/g, '$1')
    text = text.replace(/\n{4,}/g, '\n\n\n')

    content.value = text
    // If text is too short, it's a scanned PDF — no text version available
    viewMode.value = text.trim().length < 500 ? 'scanned' : 'choice'
  } catch (e: any) {
    errorMsg.value = '加载失败: ' + (e?.message || '未知错误')
  } finally {
    loading.value = false
  }
}

function showTextContent() {
  viewMode.value = 'text'
}

function getPdfViewerUrl() {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
  return `${base}/exams/pdf?session=${encodeURIComponent(sessionId)}&path=${encodeURIComponent(currentPaperPath)}`
}

function openPdfDirectly() {
  window.open(getPdfViewerUrl(), '_blank')
}

function onPaperChange(e: Event) {
  const id = (e.target as HTMLSelectElement).value
  const p = papers.value.find(x => x.id === id)
  if (p) loadPaper(p)
}

async function onSelectionChange() {
  await nextTick()
  const sel = window.getSelection()
  if (!sel || sel.isCollapsed || !sel.rangeCount) return
  const text = sel.toString().trim()
  if (!text || text === lastSelection) return
  lastSelection = text

  const words = text.match(/[a-zA-Z'-]+/g)
  if (!words || !words[0]) return
  const word = words[0].replace(/[^a-zA-Z'-]/g, '').toLowerCase()
  if (!word) return

  const range = sel.getRangeAt(0)
  const rect = range.getBoundingClientRect()

  try {
    const res = await lookupWord(word)
    const d = res.data
    popup.value = {
      show: true,
      word: d.word,
      meaning: d.meaning,
      phonetic: d.phonetic,
      example: d.example,
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    }
  } catch { /* ignore */ }
}

function closePopup() {
  popup.value.show = false
  lastSelection = ''
}
</script>

<template>
  <div class="reader" @click.self="closePopup">
    <div class="top-bar">
      <button class="top-btn" @click="router.push('/exams')">&larr; 返回</button>
      <span class="top-title">{{ sessionLabel }}</span>
      <select v-if="papers.length" class="paper-select" @change="onPaperChange">
        <option v-for="p in papers" :key="p.id" :value="p.id">{{ p.name }}</option>
      </select>
    </div>

    <div v-if="loading" class="center-state">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-else-if="errorMsg" class="center-state">
      <p>{{ errorMsg }}</p>
    </div>

    <!-- Scanned PDF fallback (no extractable text) -->
    <div v-else-if="viewMode === 'scanned'" class="center-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color:var(--text-muted);margin-bottom:12px">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
      <p style="font-size:15px;font-weight:600;color:var(--text-secondary);margin-bottom:6px">该试卷为扫描版，暂不支持文字查看</p>
      <p style="font-size:13px;color:var(--text-muted);margin-bottom:20px">点击下方按钮在新标签页中打开PDF文件</p>
      <button class="top-btn" @click="openPdfDirectly" style="padding:10px 28px;font-size:14px">打开PDF文件</button>
    </div>

    <!-- Choice: text version (扫描件) vs PDF -->
    <div v-else-if="viewMode === 'choice'" class="center-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color:var(--text-muted);margin-bottom:12px">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
      <p style="font-size:15px;font-weight:600;color:var(--text-secondary);margin-bottom:6px">已识别试卷文字</p>
      <p style="font-size:13px;color:var(--text-muted);margin-bottom:20px">选择查看方式</p>
      <div class="choice-buttons">
        <button class="choice-btn" @click="showTextContent">
          <span class="choice-icon">📄</span>
          <span class="choice-label">扫描件</span>
          <span class="choice-desc">查看提取的文字内容</span>
        </button>
        <button class="choice-btn" @click="openPdfDirectly">
          <span class="choice-icon">📕</span>
          <span class="choice-label">PDF</span>
          <span class="choice-desc">打开原始PDF文件</span>
        </button>
      </div>
    </div>

    <!-- Text content -->
    <div v-else class="content-wrap">
      <div class="content formatted" v-html="formattedContent"></div>
    </div>

    <Teleport to="body">
      <div v-if="popup.show" class="word-popup"
        :style="{ left: popup.x + 'px', top: popup.y + 'px' }">
        <div class="popup-hd">
          <b>{{ popup.word }}</b>
          <span v-if="popup.phonetic">/{{ popup.phonetic }}/</span>
          <button @click="closePopup">&times;</button>
        </div>
        <template v-if="popup.meaning">
          <p class="popup-mean">{{ popup.meaning }}</p>
          <p v-if="popup.example" class="popup-ex">{{ popup.example }}</p>
        </template>
        <p v-else class="popup-notfound">词典中未找到该单词</p>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.reader { min-height: 100vh; display: flex; flex-direction: column; }
.top-bar {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 24px;
  background: var(--card);
  border-bottom: 1px solid var(--border-light);
  position: sticky; top: 0; z-index: 40;
}
.top-btn {
  padding: 6px 14px; border: 1px solid var(--border-light);
  border-radius: 7px; background: transparent;
  font: inherit; font-size: 13px; color: var(--text-secondary); cursor: pointer;
}
.top-btn:hover { border-color: var(--accent); color: var(--accent); }
.top-title { font-size: 14px; font-weight: 600; color: var(--text); }
.paper-select {
  margin-left: auto; padding: 6px 10px;
  border: 1px solid var(--border-light); border-radius: 7px;
  font: inherit; font-size: 13px; color: var(--text);
  background: var(--card); cursor: pointer; max-width: 220px;
}
.center-state {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 60px 24px; color: var(--text-muted); font-size: 14px;
}
.spinner {
  width: 24px; height: 24px; border: 2px solid var(--border-light);
  border-top-color: var(--accent); border-radius: 50%;
  animation: spin 0.7s linear infinite; margin: 0 auto 12px;
}
@keyframes spin { to { transform: rotate(360deg); } }
.choice-buttons {
  display: flex; gap: 16px; margin-top: 8px;
}
.choice-btn {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  padding: 24px 40px; border: 2px dashed var(--border);
  border-radius: 16px; background: var(--card);
  cursor: pointer; font-family: inherit;
  transition: all 0.2s;
}
.choice-btn:hover {
  border-color: var(--accent); background: var(--accent-bg);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(217, 119, 6, 0.12);
}
.choice-icon { font-size: 32px; }
.choice-label { font-size: 18px; font-weight: 700; color: var(--text); }
.choice-desc { font-size: 12px; color: var(--text-muted); }

.content-wrap {
  flex: 1; max-width: 900px; width: 100%;
  margin: 0 auto; padding: 28px 32px 80px;
}
/* ── Formatted content ── */
.content.formatted {
  font-size: 15px; line-height: 1.9; color: var(--text);
  word-wrap: break-word;
  user-select: text; -webkit-user-select: text;
}
/* Spacer between blocks */
.content.formatted .l-sp { height: 12px; }
/* Part heading: Part I, Part II … */
.content.formatted .l-ph {
  font-size: 17px; font-weight: 700; color: var(--text);
  margin: 28px 0 6px; padding-bottom: 4px;
  border-bottom: 2px solid var(--accent);
}
/* Sub-heading: Writing, Listening Comprehension … */
.content.formatted .l-sub {
  font-size: 15px; font-weight: 600; color: var(--text-secondary);
  margin: 14px 0 4px;
}
/* Section heading: Section A, Section B … */
.content.formatted .l-sh {
  font-size: 15px; font-weight: 700; color: var(--accent);
  margin: 18px 0 6px;
}
/* Directions */
.content.formatted .l-dir {
  font-size: 14px; color: var(--text-secondary);
  margin: 6px 0 12px; line-height: 1.75;
}
/* Question group: "Questions 1 to 4 are based on…" */
.content.formatted .l-qg {
  font-size: 14px; font-weight: 500; color: var(--text-secondary);
  margin: 14px 0 8px; padding: 6px 10px;
  background: rgba(217,119,6,0.06);
  border-left: 3px solid var(--accent);
  border-radius: 0 6px 6px 0;
}
/* Question line */
.content.formatted .l-q {
  margin: 14px 0 4px; padding-left: 0;
  line-height: 1.8;
}
.content.formatted .qn {
  font-weight: 700; font-size: 15px; color: var(--text);
  margin-right: 4px;
}
/* Option line */
.content.formatted .l-o {
  margin: 1px 0 2px; padding-left: 28px;
  line-height: 1.75;
}
.content.formatted .ok {
  font-weight: 600; color: var(--accent); margin-right: 2px;
}
/* Option item (inline, when two options on same line) */
.content.formatted .oi { display: inline; }
.content.formatted .oi + .oi { margin-left: 16px; }
.content.formatted .oi .ok { margin-right: 1px; }
/* Page marker */
.content.formatted .l-pm {
  text-align: center; font-size: 12px; color: var(--border-light);
  margin: 8px 0; user-select: none;
}
/* Regular paragraph */
.content.formatted .l-p {
  margin: 8px 0; line-height: 1.85;
}
</style>

<style>
.word-popup {
  position: fixed;
  transform: translate(-50%, calc(-100% - 8px));
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 12px 16px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  z-index: 999;
  max-width: 320px; min-width: 180px;
}
.popup-hd { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.popup-hd b { font-size: 15px; color: var(--text); }
.popup-hd span { font-size: 12px; color: var(--text-muted); }
.popup-hd button { margin-left: auto; background: none; border: none; font-size: 18px; cursor: pointer; color: var(--text-muted); padding: 0; line-height: 1; }
.popup-mean { font-size: 14px; color: var(--accent); font-weight: 500; margin: 4px 0; }
.popup-ex { font-size: 12px; color: var(--text-muted); font-style: italic; margin: 4px 0 0; }
.popup-notfound { font-size: 12px; color: var(--text-muted); margin: 4px 0 0; }
</style>
