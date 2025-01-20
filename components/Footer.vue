<template>
  <footer class="bg-gray-900 text-white">
    <div class="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <!-- フッターの上部 -->
      <div class="flex flex-wrap justify-between items-center mb-6">
        <div class="text-xl font-bold">
          Beauty Compass
        </div>
        <nav class="flex space-x-4">
          <!-- 既存のナビゲーションリンク -->
          <NuxtLink
            to="/about"
            class="text-gray-400 hover:text-pink-400 transition-colors"
          >
            このサイトについて
          </NuxtLink>
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

          <template v-if="!isLogin">
            <NuxtLink
              to="/register"
              class="text-gray-400 hover:text-pink-400 transition-colors"
            >
              新規登録
            </NuxtLink>
          </template>

          <template v-if="isLogin && user">
            <NuxtLink
              to="/dashboard"
              class="text-gray-400 hover:text-pink-400 transition-colors"
            >
              ダッシュボード
            </NuxtLink>
          </template>
        </nav>
      </div>

      <!-- 特徴セクション -->
      <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <!-- 特徴1 -->
        <div class="bg-gray-800 rounded-lg p-6 transform hover:scale-105 transition-transform duration-300">
          <div class="w-12 h-12 bg-pink-200 rounded-full flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6 text-pink-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
              />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-white mb-2">リアルな体験談</h3>
          <p class="text-gray-400">実際の利用者による信頼できる情報を提供します。</p>
        </div>

        <!-- 特徴2 -->
        <div class="bg-gray-800 rounded-lg p-6 transform hover:scale-105 transition-transform duration-300">
          <div class="w-12 h-12 bg-pink-200 rounded-full flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6 text-pink-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-white mb-2">詳細な比較</h3>
          <p class="text-gray-400">製品やサービスの詳細な比較情報を提供します。</p>
        </div>

        <!-- 特徴3 -->
        <div class="bg-gray-800 rounded-lg p-6 transform hover:scale-105 transition-transform duration-300">
          <div class="w-12 h-12 bg-pink-200 rounded-full flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6 text-pink-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
              />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-white mb-2">活発なコミュニティ</h3>
          <p class="text-gray-400">ユーザー同士で情報交換が可能なコミュニティを提供します。</p>
        </div>
      </div>
      
      <!-- フッターの下部 -->
      <div class="flex justify-between items-center border-t border-gray-800 pt-4">
        <div class="text-sm text-gray-400">
          &copy; 2025 Beauty Compass. All rights reserved.
        </div>
        <div class="flex items-center space-x-2">
          <span class="text-xs px-2 py-1 bg-gray-800 rounded-md text-pink-400 font-mono">
            v{{ version }}
          </span>
          <span class="text-xs text-gray-500">
            {{ buildDate }}
          </span>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue';
import { useUserStore } from '~/stores/user';

const config = useRuntimeConfig();
const version = config.public.appVersion;
const buildDate = new Date().toLocaleDateString('ja-JP');

const userStore = useUserStore();
const isLogin = computed(() => userStore.isLogin);
const user = computed(() => userStore.user);
</script>

<style scoped>
footer {
  background-color: #1a202c;
  color: #cbd5e0;
}
</style>