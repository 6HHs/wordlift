<script setup lang="ts">
import NavBar from './components/NavBar.vue'
</script>

<template>
  <NavBar />
  <main class="main">
    <div class="container">
      <router-view />
    </div>
  </main>
</template>

<style scoped>
.main {
  padding: 28px 24px 48px;
}
.container {
  max-width: 720px;
  margin: 0 auto;
}
</style>
