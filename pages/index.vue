<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gray-100">
    <div class="p-8 bg-white shadow-lg rounded-lg text-center">
      <!-- タイトル -->
      <h1 class="text-3xl font-bold text-blue-600">Hello, Nuxt 3 with Tailwind CSS!</h1>
      <p class="mt-4 text-gray-700">Tailwind CSSが正常に動作しています。</p>

      <!-- 投稿一覧ページへのリンクボタン -->
      <NuxtLink
        to="/posts"
        class="mt-6 inline-block px-6 py-2 text-white font-semibold bg-blue-500 rounded hover:bg-blue-600 transition duration-300"
      >
        投稿一覧を見る
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
// ここにJavaScriptのロジックを書く（必要な場合）
</script>
