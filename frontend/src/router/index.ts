import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: () => import('../views/HomePage.vue') },
    { path: '/word-books', name: 'wordBooks', component: () => import('../views/WordBooks.vue') },
    { path: '/study/:bookId', name: 'study', component: () => import('../views/StudyView.vue') },
    { path: '/review', name: 'review', component: () => import('../views/ReviewView.vue') },
    { path: '/statistics', name: 'statistics', component: () => import('../views/Statistics.vue') },
    { path: '/custom-words', name: 'customWords', component: () => import('../views/CustomWords.vue') },
    { path: '/learned-words', name: 'learnedWords', component: () => import('../views/LearnedWords.vue') },
    { path: '/exams', name: 'exams', component: () => import('../views/ExamList.vue') },
    { path: '/exam/:sessionId', name: 'examReader', component: () => import('../views/ExamReader.vue') },
  ],
})

export default router
