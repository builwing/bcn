<template>
  <div class="min-h-screen w-full bg-gradient-to-b from-pink-100 to-pink-300 m-0 p-0 overflow-hidden">
    <!-- コンテンツエリア -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- ヒーローセクション -->
      <div class="text-center">
        <h1 class="text-4xl sm:text-5xl font-bold text-gray-800 mb-6">
          Beauty Compass
          <span class="block text-pink-600">あなたの美の道標に</span>
        </h1>
        <!-- CTAボタン -->
        <div class="mt-10 flex justify-center gap-4 mb-12">
          <NuxtLink
            to="/posts/create"
            class="btn-primary inline-block text-center"
          >
            投稿する
          </NuxtLink>
        </div>
      </div>

      <!-- 投稿一覧セクション -->
      <div class="mt-8">
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
              <h2 class="text-xl font-semibold truncate">{{ post.title }}</h2>
            </div>

            <!-- カードコンテンツ -->
            <div class="p-6 space-y-4">
              <!-- 画像セクション -->
              <NuxtLink :to="`/posts/${post.id}`" class="block w-full">
                <div class="aspect-w-16 aspect-h-9 mb-4">
                  <img
                    :src="post.images?.[0]?.url || '/images/no-image.jpg'"
                    :alt="post.images?.[0]?.content || post.title"
                    class="object-cover w-full h-48 rounded-lg hover:opacity-80 transition-opacity"
                  />
                </div>
              </NuxtLink>
            </div>

            <!-- カードフッター -->
            <div class="p-4 bg-gray-50 border-t border-gray-100">
              <div class="flex justify-between items-center text-sm text-gray-500">
                <div class="flex items-center">
                  <span>{{ post.user?.name }}</span>
                </div>
                <span>{{ formatDate(post.created_at) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- データがない場合 -->
        <div v-else-if="!isLoading && !error" class="text-center text-gray-600">
          投稿がありません。
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
  </div>
</template>


<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { Post, PaginatedResponse } from '~/types/api';
import { getPosts } from '~/composables/useApi';
import PageLink from '~/components/posts/PageLink.vue';

// SEOメタデータの設定
useHead({
  title: 'Beauty Compass - あなたの美の道標',
  meta: [
    {
      name: 'description',
      content: 'Beauty Compassは、美容整形・化粧品・健康器具の口コミ・体験談を共有するプラットフォームです。'
    }
  ]
});

// 状態の定義
const posts = ref<Post[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);
const currentPage = ref(1);

// ページネーション用の状態
type LinkValue = string | null;

const meta = ref<PaginatedResponse<Post>['meta']>({
  current_page: 1,
  last_page: 1,
  per_page: 12,
  total: 0
});

const links = ref<Record<string, LinkValue>>({
  first: null,
  last: null,
  prev: null,
  next: null
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
const fetchPosts = async (page: number = 1) => {
  isLoading.value = true;
  error.value = null;

  try {
    const { data, error: fetchError } = await getPosts({ page });
    
    if (fetchError) throw fetchError;
    
    if (data) {
      posts.value = data.data;
      meta.value = data.meta;
      // リンク情報を更新
      links.value = {
        first: page > 1 ? 'yes' : null,
        last: page < data.meta.last_page ? 'yes' : null,
        prev: page > 1 ? 'yes' : null,
        next: page < data.meta.last_page ? 'yes' : null
      };
    }
  } catch (err) {
    console.error('投稿取得エラー:', err);
    error.value = 'データの取得に失敗しました。';
  } finally {
    isLoading.value = false;
  }
};

// ページ変更時の処理
const handlePageChange = async (page: number) => {
  currentPage.value = page;
  await fetchPosts(page);
  // ページトップにスクロール
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// 初期データの取得
onMounted(() => {
  fetchPosts();
});
</script>

<style scoped>
.btn-primary {
  @apply px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors;
}
</style>