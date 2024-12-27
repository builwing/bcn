<template>
  <div class="bg-gray-100 min-h-screen py-8">
    <div class="max-w-7xl mx-auto px-4">
      <!-- 戻るボタン -->
      <div class="mb-4">
        <NuxtLink
          to="/"
          class="btn-primary inline-block text-center"
        >
          ← トップページへ戻る
        </NuxtLink>
      </div>

      <!-- タイトル -->
      <h1 class="text-4xl font-bold text-center text-gray-800 mb-8">
        投稿一覧
      </h1>

      <!-- ローディング中 -->
      <div v-if="isLoading" class="text-center text-gray-600">
        データを読み込み中...
      </div>

      <!-- エラーメッセージ -->
      <div v-else-if="error" class="text-center text-red-500 font-semibold">
        {{ error }}
      </div>

      <!-- 投稿データの表示 -->
      <div
        v-if="!isLoading && !error && posts.length > 0"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        <div
          v-for="post in posts"
          :key="post.id"
          class="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
        >
          <!-- カードヘッダー -->
          <div class="p-4 bg-pink-400 text-white">
            <span class="text-sm bg-white text-pink-500 px-2 py-1 rounded">
              {{ post.id }}
            </span>
            <h2 class="text-xl font-semibold truncate">{{ post.title }}</h2>
          </div>

          <!-- カードコンテンツ -->
          <div class="p-6 space-y-4">
            <p class="text-gray-700 line-clamp-3">{{ post.content }}</p>
            <div class="flex justify-between items-center text-sm text-gray-600">
              <span>カテゴリー: <strong>{{ post.category }}</strong></span>
              <span>評価: <strong class="text-yellow-500">{{ post.rating }}/5</strong></span>
            </div>
            <!-- 投稿者と日付 -->
            <div class="text-sm text-gray-500">
              <p>投稿者: {{ post.user?.name }}</p>
              <p>投稿日: {{ formatDate(post.created_at) }}</p>
            </div>
          </div>

          <!-- カードフッター -->
          <div class="p-4 bg-gray-50 text-right">
            <NuxtLink
              :to="`/posts/${post.id}`"
              class="text-pink-500 font-semibold hover:underline"
            >
              詳細を見る →
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- データがない場合 -->
      <div v-else-if="!isLoading && !error" class="text-center text-gray-600">
        投稿がありません。
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRuntimeConfig } from 'nuxt/app';
import { useHead } from '@unhead/vue';
import type { Post, ApiResponse } from '~/types/api';

const config = useRuntimeConfig();
const posts = ref<Post[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);

// SEOメタデータの設定
useHead({
  title: '投稿一覧 - Beauty Compass',
  meta: [
    {
      name: 'description',
      content: 'Beauty Compassの投稿一覧ページです。美容に関する様々な体験や情報をご覧いただけます。'
    }
  ]
});

// 日付フォーマット関数
const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// 投稿データ取得
const fetchPosts = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    const response = await $fetch<ApiResponse<Post[]>>(`${config.public.apiBase}/posts`, {
      credentials: 'include'
    });
    posts.value = response.data;
  } catch (err) {
    console.error('投稿取得エラー:', err);
    error.value = 'データの取得に失敗しました。';
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchPosts();
});
</script>

<style scoped>
.btn-primary {
  @apply px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors;
}
</style>