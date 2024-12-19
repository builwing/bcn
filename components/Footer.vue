<template>
    <footer class="bg-gray-900 text-white">
      <div class="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <!-- フッターの上部 -->
        <div class="flex flex-wrap justify-between items-center mb-6">
          <div class="text-xl font-bold">
            Beauty Compass
          </div>
          <nav class="flex space-x-4">
            <NuxtLink
              to="/about"
              class="text-gray-400 hover:text-pink-400 transition-colors"
            >
              このサイトについて
            </NuxtLink>
            <NuxtLink
            <NuxtLink
              to="/posts"
              class="text-gray-400 hover:text-pink-400 transition-colors"
            >
              投稿一覧
            </NuxtLink>
            <NuxtLink
              to="/contact"
              class="text-gray-400 hover:text-pink-400 transition-colors"
            >
              お問い合わせ
            </NuxtLink>
            <NuxtLink
              to="/register"
              class="text-gray-400 hover:text-pink-400 transition-colors"
            >
              新規登録
            </NuxtLink>
            <NuxtLink
              to="/dashboard"
              class="text-gray-400 hover:text-pink-400 transition-colors"
            >
              ダッシュボード
            </NuxtLink>
          </nav>
        </div>
        <!-- フッターの下部 -->
        <div class="text-center text-sm text-gray-400">
          &copy; 2024 Beauty Compass. All rights reserved.
        </div>
      </div>
    </footer>
  </template>
  
  <style scoped>
  footer {
    background-color: #1a202c; /* グレーの濃い背景色 */
    color: #cbd5e0; /* テキストの薄いグレー */
  }
  </style>
  