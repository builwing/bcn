<template>
    <header class="bg-gradient-to-r from-pink-500 to-pink-400 text-white shadow-lg">
      <div class="container mx-auto flex justify-between items-center p-4">
        <!-- ロゴ -->
        <div class="text-2xl font-bold">
          <NuxtLink to="/" class="hover:text-pink-200 transition-colors">
            Beauty Compass
          </NuxtLink>
        </div>
        <!-- ナビゲーションメニュー -->
        <nav class="hidden md:flex space-x-6">
          <NuxtLink
            to="/login"
            class="hover:text-pink-200 transition-colors"
          >
            ログイン
          </NuxtLink>
          <NuxtLink
            to="/posts"
            class="hover:text-pink-200 transition-colors"
          >
            投稿一覧
          </NuxtLink>
          <NuxtLink
            to="/about"
            class="hover:text-pink-200 transition-colors"
          >
            サイトについて
          </NuxtLink>
        </nav>
        <!-- ハンバーガーメニュー（モバイル用） -->
        <div class="md:hidden">
          <button @click="toggleMenu" class="focus:outline-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </button>
        </div>
      </div>
      <!-- モバイルメニュー -->
      <div
        v-if="menuOpen"
        class="md:hidden bg-pink-500 text-white shadow-lg"
      >
        <nav class="flex flex-col space-y-4 p-4">
          <NuxtLink
            to="/"
            class="hover:text-pink-200 transition-colors"
            @click="closeMenu"
          >
            ホーム
          </NuxtLink>
          <NuxtLink
            to="/posts"
            class="hover:text-pink-200 transition-colors"
            @click="closeMenu"
          >
            投稿一覧
          </NuxtLink>
          <NuxtLink
            to="/about"
            class="hover:text-pink-200 transition-colors"
            @click="closeMenu"
          >
            サイトについて
          </NuxtLink>
        </nav>
      </div>
    </header>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  const menuOpen = ref(false);
  const toggleMenu = () => {
    menuOpen.value = !menuOpen.value;
  };
  const closeMenu = () => {
    menuOpen.value = false;
  };
  </script>
  
  <style scoped>
  header {
    background: linear-gradient(to right, #ed64a6, #ec4899);
  }
  </style>
  