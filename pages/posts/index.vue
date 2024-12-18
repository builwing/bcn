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
      <div v-if="loading" class="text-center text-gray-600">
        データを読み込み中...
      </div>

      <!-- エラーメッセージ -->
      <div v-else-if="error" class="text-center text-red-500 font-semibold">
        {{ error }}
      </div>

      <!-- 投稿データの表示 -->
      <div
        v-if="!loading && !error"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        <div
          v-for="post in posts"
          :key="post.id"
          class="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
        >
          <!-- カードヘッダー -->
          <div class="p-4 bg-pink-400 text-white">
            <h2 class="text-xl font-semibold truncate">{{ post.title }}</h2>
          </div>

          <!-- カードコンテンツ -->
          <div class="p-6 space-y-4">
            <p class="text-gray-700 line-clamp-3 overflow-hidden">{{ post.content }}</p>
            <div class="flex justify-between items-center text-sm text-gray-600">
              <span>カテゴリー: <strong>{{ post.category }}</strong></span>
              <span>評価: <strong class="text-yellow-500">{{ post.rating }}</strong></span>
            </div>
          </div>

          <!-- カードフッター -->
          <div class="p-4 bg-gray-50 text-right">
            <NuxtLink
              :to="`/posts/${post.id}`"
              class="text-pink-500 font-semibold hover:underline"
            >
              詳細を見る
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const posts = ref([]); // 投稿データを格納する変数
const loading = ref(true); // 読み込み中フラグ
const error = ref(null); // エラーメッセージ

// APIデータ取得関数
const fetchPosts = async () => {
  try {
    const response = await fetch("https://bcl.winroad.biz/api/posts");
    if (!response.ok) throw new Error("データの取得に失敗しました。");
    const data = await response.json();
    posts.value = data.data; // Laravel APIのJSON��造に合わせて取得
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

onMounted(fetchPosts);
</script>

<style scoped>
.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
