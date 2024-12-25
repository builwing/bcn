<template>
  <div class="bg-gray-100 min-h-screen py-8">
    <div class="max-w-4xl mx-auto px-4">
      <!-- 戻るボタン -->
      <div class="mb-4">
        <button
          @click="goBack"
          class="btn-primary inline-block text-center"
        >
          ← 前のページに戻る
        </button>
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
          <div class="flex items-center">
            <span class="mr-1">評価:</span>
            <span class="text-yellow-400">{{ "★".repeat(post.rating) }}</span>
            <span class="text-gray-300">{{ "★".repeat(5 - post.rating) }}</span>
          </div>
        </div>

        <!-- 画像スライダー -->
        <div v-if="post.images && post.images.length > 0" class="relative">
        <!-- デバッグ情報の表示 -->
        <!-- <div class="bg-gray-100 p-2 mb-2">
            <p>Debug - Current Image URL: {{ post.images[currentImageIndex] }}</p>
            <p>Debug - Total Images: {{ post.images.length }}</p>
          </div> -->
          <!-- メイン画像表示エリア -->
          <div class="relative w-full h-[400px] rounded-lg overflow-hidden">
            <img
              :src="post.images[currentImageIndex]"
              :alt="`画像 ${currentImageIndex + 1}`"
              class="w-full h-full object-cover"
            />
            
            <!-- 画像ナビゲーションボタン -->
            <div v-if="post.images.length > 1" class="absolute inset-0 flex items-center justify-between px-4">
              <button
                @click="prevImage"
                class="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity"
              >
                ←
              </button>
              <button
                @click="nextImage"
                class="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity"
              >
                →
              </button>
            </div>

            <!-- 画像インジケーター -->
            <div 
              v-if="post.images.length > 1"
              class="absolute bottom-4 left-0 right-0 flex justify-center space-x-2"
            >
              <button
                v-for="(_, index) in post.images"
                :key="index"
                @click="currentImageIndex = index"
                class="w-2 h-2 rounded-full transition-colors"
                :class="index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'"
              />
            </div>
          </div>

          <!-- サムネイルプレビュー -->
          <div 
            v-if="post.images.length > 1"
            class="mt-4 flex space-x-2 overflow-x-auto py-2"
          >
            <button
              v-for="(image, index) in post.images"
              :key="index"
              @click="currentImageIndex = index"
              class="flex-shrink-0 w-20 h-20 rounded-md overflow-hidden"
              :class="{ 'ring-2 ring-pink-500': index === currentImageIndex }"
            >
              <img
                :src="image"
                :alt="`サムネイル ${index + 1}`"
                class="w-full h-full object-cover"
              />
            </button>
          </div>
        </div>

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

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import type { Post } from '~/types/api';
import { usePosts } from '~/composables/usePosts';
import { useRouter } from 'vue-router';

// 投稿関連のcomposablesを使用
const { getPost } = usePosts();
const route = useRoute();
const router = useRouter();

// 状態管理
const post = ref<Post | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);
const currentImageIndex = ref(0);

// 戻る機能
const goBack = () => {
  if (window.history.length > 1) {
    router.back(); // ヒストリーがある場合は前のページに戻る
  } else {
    router.push('/posts'); // デフォルトの投稿一覧ページに戻る
  }
};

// 日付フォーマット関数
const formatDate = (dateString: string) => {
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

// 画像スライダーのナビゲーション関数
const nextImage = () => {
  if (!post.value?.images) return;
  currentImageIndex.value = (currentImageIndex.value + 1) % post.value.images.length;
};

const prevImage = () => {
  if (!post.value?.images) return;
  currentImageIndex.value = currentImageIndex.value === 0 
    ? post.value.images.length - 1 
    : currentImageIndex.value - 1;
};

// キーボードナビゲーションの設定
const handleKeydown = (e: KeyboardEvent) => {
  if (!post.value?.images || post.value.images.length <= 1) return;
  
  if (e.key === 'ArrowLeft') {
    prevImage();
  } else if (e.key === 'ArrowRight') {
    nextImage();
  }
};

// 投稿詳細を取得
const fetchPost = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    const postId = parseInt(route.params.id as string);
    const { data, error: fetchError } = await getPost(postId);

    // APIレスポンスの確認
    console.log('API Response:', data);
    console.log('Images URLs:', data?.data?.images);

    if (fetchError) {
      throw fetchError;
    }

    post.value = data?.data ?? null;
  } catch (err) {
    console.error('投稿取得エラー:', err);
    error.value = '投稿の取得に失敗しました。';
  } finally {
    isLoading.value = false;
  }
};

// SEO対策
useHead(() => ({
  title: post.value ? `${post.value.title} - Beauty Compass` : 'Loading...',
  meta: [
    {
      name: 'description',
      content: post.value?.content?.substring(0, 160) || '投稿詳細ページ'
    }
  ]
}));

// 初期化処理
onMounted(() => {
  fetchPost();
  // キーボードイベントリスナーの追加
  window.addEventListener('keydown', handleKeydown);
});

// クリーンアップ
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});

</script>

<style scoped>
.btn-primary {
  @apply px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors;
}

/* スライダーのアニメーション */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>