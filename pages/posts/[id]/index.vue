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

      <!-- ページネーション -->
      <PageLink
        v-if="meta.last_page > 1"
        :meta="meta"
        :links="links"
        @pageChange="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRuntimeConfig } from 'nuxt/app';
import { useHead } from '@unhead/vue';
import type { Post, PostImage } from '~/types/api';
import { usePosts } from '~/composables/usePosts';
import PageLink from '~/components/posts/PageLink.vue';
import { getPosts } from '~/composables/useApi';

// コンポーネントのインポート
import BackButton from '~/components/posts/BackButton.vue';
import LoadingState from '~/components/posts/LoadingState.vue';
import ErrorDisplay from '~/components/posts/ErrorDisplay.vue';
import PostDetail from '~/components/posts/PostDetail.vue';

// 状態管理
const post = ref<Post | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);
const currentImageIndex = ref(0);

// ページネーション用の状態
const meta = ref({
  current_page: 1,
  last_page: 1,
  per_page: 12,
  total: 0
});

type LinkValue = string | null;

const links = ref<Record<string, LinkValue>>({
  first: null,
  last: null,
  prev: null,
  next: null
});

// ルーティング
const route = useRoute();
const router = useRouter();

// 投稿関連のcomposablesを使用
const { getPost } = usePosts();

// APIレスポンスの型を修正
interface PostResponse {
  data: Post;
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

// 戻る機能
const goBack = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push('/posts');
  }
};

// 画像の正規化処理
const normalizeImages = (images: any[]): PostImage[] => {
  return images.map((image, index) => ({
    id: index + 1,
    url: typeof image === 'string' ? image : image.url,
    content: typeof image === 'string' ? '' : image.content || ''
  }))
}

// データ取得
const fetchPost = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    const postId = parseInt(route.params.id as string);
    const { data, error: fetchError } = await getPost(postId) as { 
      data: PostResponse | null; 
      error: any; 
    };

    if (fetchError) throw fetchError;

    // 投稿データを正規化してセット
    post.value = data?.data
      ? {
          ...data.data,
          images: normalizeImages(data.data.images), // 必要なら画像を正規化
        }
      : null;

    // ページネーション情報の更新
    if (data?.meta) {
      meta.value = data.meta;
      links.value = {
        first: meta.value.current_page > 1 ? 'yes' : null,
        last: meta.value.current_page < meta.value.last_page ? 'yes' : null,
        prev: meta.value.current_page > 1 ? 'yes' : null,
        next: meta.value.current_page < meta.value.last_page ? 'yes' : null
      };
    }
  } catch (err) {
    console.error('投稿取得エラー:', err);
    error.value = '投稿の取得に失敗しました。';
  } finally {
    isLoading.value = false;
  }
};

// ページ変更時の処理
const handlePageChange = async (page: number) => {
  try {
    const { data, error: fetchError } = await getPosts({ page });
    if (fetchError) throw fetchError;
    if (data) {
      post.value = data.data[0];
      meta.value = data.meta;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  } catch (err) {
    console.error('ページ変更エラー:', err);
    error.value = 'ページの変更に失敗しました。';
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