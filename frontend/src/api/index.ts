import axios from 'axios'
import type {
  WordBook,
  Word,
  UserWord,
  ReviewResponse,
  OverviewStats,
  Distribution,
  ReviewStats,
  ExamSession,
  ExamPaper,
  WordLookup,
  StreakInfo,
} from '../types'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
})

// Word Books
export const getWordBooks = () => api.get<WordBook[]>('/word-books')
export const getWordBookStats = (id: number) =>
  api.get(`/word-books/${id}/stats`)

// Words
export const getWordsByBook = (bookId: number, limit?: number) =>
  api.get<Word[]>(`/word-books/${bookId}/words`, { params: limit ? { limit } : {} })
export const getNewWords = (bookId: number, limit?: number) =>
  api.get<Word[]>(`/word-books/${bookId}/words/new`, { params: limit ? { limit } : {} })

// Review
export const getTodayReview = () =>
  api.get<{ words: UserWord[]; stats: ReviewStats }>('/review/today')
export const getLearnedWords = () =>
  api.get<UserWord[]>('/review/learned')
export const submitReview = (wordId: number, rating: 'again' | 'good' | 'easy') =>
  api.post<ReviewResponse>(`/review/${wordId}`, { rating })

// Streak / Check-in
export const getStreak = () => api.get<StreakInfo>('/review/streak')
export const checkIn = () => api.post<StreakInfo>('/review/checkin')

// Statistics
export const getOverviewStats = (bookId?: number) =>
  api.get<OverviewStats>('/statistics/overview', { params: bookId ? { bookId } : {} })
export const getDistribution = () =>
  api.get<Distribution>('/statistics/distribution')
export const getForgettingCurve = () =>
  api.get<{ date: string; count: number }[]>('/statistics/forgetting-curve')

// Phonetics
export const fillPhonetics = (bookId: number) =>
  api.post<{ updated: number; failed: number; total: number }>(`/word-books/${bookId}/fill-phonetics`)

// Custom Words
export const getCustomWords = () => api.get<Word[]>('/custom-words')
export const createCustomWord = (data: {
  word: string
  meaning: string
  phonetic?: string
  example?: string
}) => api.post<Word>('/custom-words', data)
export const deleteCustomWord = (id: number) =>
  api.delete(`/custom-words/${id}`)

// Exams
export const getExamSessions = () => api.get<ExamSession[]>('/exams/sessions')
export const getExamPapers = (sessionId: string) => api.get<ExamPaper[]>(`/exams/${sessionId}/papers`)
export const getPdfUrl = (sessionId: string, relativePath: string) =>
  `http://localhost:3000/api/exams/pdf?session=${encodeURIComponent(sessionId)}&path=${encodeURIComponent(relativePath)}`
export const lookupWord = (word: string) =>
  api.get<WordLookup>('/exams/lookup', { params: { word } })
export const getPdfText = (sessionId: string, relativePath: string) =>
  api.get<{ text: string }>('/exams/text', { params: { session: sessionId, path: relativePath } })
