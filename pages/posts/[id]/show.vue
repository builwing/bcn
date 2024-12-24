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
      <div v-if="isLoading" class="text-center text-gray-600">
        データを読み込み中...
      </div>

      <!-- エラーメッセージ -->
      <div v-else-if="error" class="text-center text-red-500 font-semibold">
        {{ error }}
      </div>

      <!-- 投稿詳細 -->
      <div v-else-if="post" class="bg-white rounded-lg shadow-md p-6 space-y-6">
        <h1 class="text-3xl font-bold text-gray-800">{{ post.title }}</h1>
        <div class="flex justify-between items-center text-sm text-gray-600">
          <span>カテゴリー: <strong>{{ post.category }}</strong></span>
          <span>評価: <strong class="text-yellow-500">{{ post.rating }}/5</strong></span>
        </div>
        <img
          v-if="post.image"
          :src="post.image"
          alt="投稿画像"
          class="w-full rounded-md shadow-md"
        />
        <p class="text-gray-700 leading-relaxed">{{ post.content }}</p>

        <!-- 投稿者情報 -->
        <div class="pt-4 border-t border-gray-200">
          <p class="text-sm text-gray-600">
            投稿者: {{ post.user?.name }}
          </p>
          <p class="text-sm text-gray-600">
            投稿日: {{ formatDate(post.created_at) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const config = useRuntimeConfig();
const post = ref(null);
const isLoading = ref(true);
const error = ref(null);

// 日付フォーマット関数
const formatDate = (dateString) => {
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

// 投稿詳細を取得
const fetchPost = async () => {
isLoading.value = true;
error.value = null;

try {
  const response = await $fetch(`${config.public.apiBase}/posts/${route.params.id}`, {
    credentials: 'include',
  });

  post.value = response.data;
} catch (err) {
  console.error('投稿取得エラー:', err);
  error.value = '投稿の取得に失敗しました。';
} finally {
  isLoading.value = false;
}
};

// 初期データの取得
onMounted(() => {
fetchPost();
});
</script>