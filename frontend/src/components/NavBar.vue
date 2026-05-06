<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()

const navItems = [
  { path: '/', label: '概览' },
  { path: '/word-books', label: '词书' },
  { path: '/review', label: '复习' },
  { path: '/exams', label: '真题' },
  { path: '/statistics', label: '统计' },
  { path: '/custom-words', label: '生词本' },
]
</script>

<template>
  <header class="header">
    <div class="header-inner">
      <router-link to="/" class="logo">
        <span class="logo-mark">W</span>
        <span class="logo-text">WordLift</span>
      </router-link>
      <nav class="nav">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ active: route.path === item.path }"
        >
          {{ item.label }}
        </router-link>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.header {
  background: var(--card);
  border-bottom: 1px solid var(--border-light);
  position: sticky;
  top: 0;
  z-index: 50;
}
.header-inner {
  max-width: 720px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 52px;
  padding: 0 24px;
}
.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}
.logo-mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: var(--accent);
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  border-radius: 7px;
  letter-spacing: 0;
}
.logo-text {
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
  letter-spacing: -0.2px;
}
.nav {
  display: flex;
  gap: 1px;
}
.nav-item {
  padding: 6px 14px;
  text-decoration: none;
  color: var(--text-muted);
  border-radius: 7px;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.15s;
}
.nav-item:hover {
  color: var(--text-secondary);
  background: #f5f5f4;
}
.nav-item.active {
  color: var(--accent);
  background: var(--accent-bg);
  font-weight: 600;
}
</style>
