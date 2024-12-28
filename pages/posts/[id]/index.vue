<template>
  <div class="bg-gray-100 min-h-screen py-8">
    <div class="max-w-4xl mx-auto px-4">
      <!-- 戻るボタン -->
      <BackButton @click="goBack" />

      <!-- ローディング状態 -->
      <LoadingState v-if="isLoading" />

      <!-- エラー表示 -->
      <ErrorDisplay 
        v-else-if="error" 
        :message="error"
        :onRetry="fetchPost"
      />

      <!-- デバッグ情報（開発時のみ） -->
      <div v-if="isDev" class="mb-4 p-4 bg-yellow-100 rounded">
        <pre class="text-sm">{{ post }}</pre>
      </div>

      <!-- 投稿詳細 -->
      <PostDetail
        v-if="post"
        :post="{ ...post, images: normalizeImages(post.images) }"
        :currentImageIndex="currentImageIndex"
        @update:currentImageIndex="currentImageIndex = $event"
      />

      <!-- データが見つからない場合 -->
      <div 
        v-if="!isLoading && !error && !post" 
        class="text-center py-12 bg-white rounded-lg shadow-md"
      >
        <p class="text-gray-600">投稿が見つかりませんでした。</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRuntimeConfig } from 'nuxt/app';
import { useHead } from '@unhead/vue';
import type { Post } from '~/composables/usePosts';
import { usePosts } from '~/composables/usePosts';

// コンポーネントのインポート
import BackButton from '~/components/posts/BackButton.vue';
import LoadingState from '~/components/posts/LoadingState.vue';
import ErrorDisplay from '~/components/posts/ErrorDisplay.vue';
import PostDetail from '~/components/posts/PostDetail.vue';

// 開発環境かどうかのフラグ
const config = useRuntimeConfig();
const isDev = process.env.NODE_ENV === 'development';

// 状態管理
const post = ref<Post | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);
const currentImageIndex = ref(0);

// ルーティング
const route = useRoute();
const router = useRouter();

// 投稿関連のcomposablesを使用
const { getPost } = usePosts();

// 戻る機能
const goBack = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push('/posts');
  }
};

// 画像の正規化処理
const normalizeImages = (images: (string | { url: string })[]): string[] => {
    return images.map(image => {
        if (typeof image === 'string') {
            return image; // 文字列の場合はそのまま
        } else if (image && 'url' in image) {
            return image.url; // オブジェクトの場合はurl
        }
        return ''; // 不明な形式は空文字
    });
};


// データ取得
const fetchPost = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    const postId = parseInt(route.params.id as string);
    const { data, error: fetchError } = await getPost(postId);

    if (fetchError) throw fetchError;

    // 投稿データを正規化してセット
    post.value = data?.data
    ? {
        ...data.data,
        images: normalizeImages(data.data.images), // 必要なら画像を正規化
    }
    : null;
  } catch (err) {
    console.error('投稿取得エラー:', err);
    error.value = '投稿の取得に失敗しました。';
  } finally {
    isLoading.value = false;
  }
};


// SEO
useHead(() => ({
  title: post.value ? `${post.value.title} - Beauty Compass` : 'Loading...',
  meta: [
    {
      name: 'description',
      content: post.value?.content?.substring(0, 160) || '投稿詳細ページ'
    }
  ]
}));

// ライフサイクルフック
onMounted(() => {
  fetchPost();
});
</script>
