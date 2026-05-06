export interface WordBook {
  id: number
  name: string
  description: string | null
  level: string
  _count: { words: number }
}

export interface Word {
  id: number
  word: string
  phonetic: string | null
  meaning: string
  example: string | null
  wordBookId: number
  wordBook?: { id: number; name: string; level: string }
}

export interface UserWord {
  id: number
  userId: number
  wordId: number
  status: 'NEW' | 'LEARNING' | 'REVIEWING' | 'MASTERED'
  difficulty: number
  stability: number
  reviewCount: number
  lastReviewAt: string | null
  nextReviewAt: string | null
  word: Word
}

export interface ReviewStats {
  dueCount: number
  newCount: number
  masteredCount: number
  streak: number
}

export interface ReviewResponse {
  status: string
  nextReviewAt: string
  reviewCount: number
}

export interface OverviewStats {
  totalWords: number
  totalLearned: number
  dueCount: number
  streak: number
}

export interface StreakInfo {
  streak: number
  checkedInToday: boolean
}

export interface Distribution {
  NEW: number
  LEARNING: number
  REVIEWING: number
  MASTERED: number
}

export interface ExamSession {
  id: string
  label: string
  year: number
  month: number
}

export interface ExamPaper {
  id: string
  name: string
  relativePath: string
}

export interface WordLookup {
  word: string
  found: boolean
  meaning: string | null
  phonetic: string | null
  example: string | null
}
