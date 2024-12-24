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
      
      <!-- フッターの下部 -->
      <div class="flex justify-between items-center border-t border-gray-800 pt-4">
        <div class="text-sm text-gray-400">
          &copy; 2024 Beauty Compass. All rights reserved.
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