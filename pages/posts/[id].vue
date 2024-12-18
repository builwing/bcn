<template>
    <div class="bg-gray-100 min-h-screen py-8">
      <div class="max-w-4xl mx-auto px-4">
        <!-- 戻るボタン -->
        <div class="mb-4">
          <NuxtLink
            to="/posts"
            class="btn-primary inline-block text-center"
            >
            ← 投稿一覧へ戻る
          </NuxtLink>
        </div>
  
        <!-- ローディング中 -->
        <div v-if="loading" class="text-center text-gray-600">データを読み込み中...</div>
  
        <!-- エラーメッセージ -->
        <div v-else-if="error" class="text-center text-red-500 font-semibold">
          {{ error }}
        </div>
  
        <!-- 投稿詳細 -->
        <div v-else class="bg-white rounded-lg shadow-md p-6 space-y-6">
          <h1 class="text-3xl font-bold text-gray-800">{{ post.title }}</h1>
          <div class="flex justify-between items-center text-sm text-gray-600">
            <span>カテゴリー: <strong>{{ post.category }}</strong></span>
            <span>評価: <strong class="text-yellow-500">{{ post.rating }}</strong></span>
          </div>
          <img
            v-if="post.image"
            :src="post.image"
            alt="投稿画像"
            class="w-full rounded-md shadow-md"
          />
          <p class="text-gray-700 leading-relaxed">{{ post.content }}</p>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from "vue";
  import { useRoute } from "vue-router";
  
  const route = useRoute();
  const post = ref(null);
  const loading = ref(true);
  const error = ref(null);
  
  // 投稿詳細を取得
  const fetchPost = async () => {
    try {
      const response = await fetch(`https://bcl.winroad.biz/api/posts/${route.params.id}`);
      if (!response.ok) throw new Error("投稿の取得に失敗しました。");
      const data = await response.json();
      post.value = data.data; // LaravelのJSONレスポンスに合わせる
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };
  
  onMounted(fetchPost);
  </script>  