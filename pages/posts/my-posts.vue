<template>
  <div class="bg-gray-100 min-h-screen py-8">
    <div class="max-w-7xl mx-auto px-4">
      <!-- 戻るボタン -->
      <BackButton @click="goBack" />

      <!-- <div class="mb-8">
        <button @click="router.back()" class="btn-primary inline-block mb-4">
          ← 前のページへ戻る
        </button>
      </div> -->

      <!-- タイトル -->
      <h1 class="text-4xl font-bold text-center text-gray-800 mb-8">
        マイ投稿一覧
      </h1>

      <!-- カテゴリーフィルター -->
      <div class="mb-6">
        <select 
          v-model="selectedCategory"
          @change="fetchMyPosts"
          class="w-full sm:w-auto px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
        >
          <option value="">全てのカテゴリー</option>
          <option value="美容整形">美容整形</option>
          <option value="化粧品">化粧品</option>
          <option value="健康器具">健康器具</option>
          <option value="健康器具">その他</option>
        </select>
      </div>

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
          <div class="p-4 bg-pink-400 text-white flex justify-between items-center">
            <span class="text-sm bg-white text-pink-500 px-2 py-1 rounded">
              {{ post.id }}
            </span>
              <h2 class="text-xl font-semibold truncate">{{ post.title }}</h2>
            <span class="text-sm bg-white text-pink-500 px-2 py-1 rounded">
              {{ post.is_published ? '公開中' : '非公開' }}
            </span>
          </div>

          <!-- カードコンテンツ -->
          <div class="p-6 space-y-4">
            <p class="text-gray-700 line-clamp-3">{{ post.content }}</p>
            <div class="flex justify-between items-center text-sm text-gray-600">
              <span>カテゴリー: <strong>{{ post.category }}</strong></span>
              <span>評価: <strong class="text-yellow-500">{{ post.rating }}/5</strong></span>
            </div>
            <!-- 投稿日時 -->
            <div class="text-sm text-gray-500">
              <p>投稿日: {{ formatDate(post.created_at) }}</p>
              <p>最終更新: {{ formatDate(post.updated_at) }}</p>
            </div>
          </div>

          <!-- カードフッター -->
          <div class="p-4 bg-gray-50 flex justify-between items-center">
            <NuxtLink
              :to="`/posts/${post.id}/edit`"
              class="text-blue-500 font-semibold hover:underline"
            >
              編集
            </NuxtLink>
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
        投稿がありません。新しい投稿を作成しましょう！
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { usePosts } from '~/composables/usePosts';
import { useRouter, useRoute } from 'vue-router';
import BackButton from '~/components/posts/BackButton.vue';

// ルータの取得
const router = useRouter();
const route = useRoute();

const { getMyPosts } = usePosts();
const posts = ref([]);
const isLoading = ref(true);
const error = ref(null);
const selectedCategory = ref('');

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

// 戻る機能
const goBack = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push('/posts');
  }
};


// マイ投稿データ取得
const fetchMyPosts = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    const { data, error: fetchError } = await getMyPosts(selectedCategory.value);
    if (fetchError) throw fetchError;
    
    posts.value = data.data;
  } catch (err) {
    console.error('投稿取得エラー:', err);
    error.value = 'データの取得に失敗しました。';
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchMyPosts();
});
</script>