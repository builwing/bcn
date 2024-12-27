<template>
  <div class="bg-white rounded-lg shadow-md p-2 space-y-6">
    <!-- ヘッダー: タイトルとメタ情報 -->
    <header class="space-y-2">
  <!-- タイトル -->
      <h1 class="text-4xl p-4 font-bold text-gray-800 leading-tight tracking-tight mt-2">
        {{ post.title }}
      </h1>

      <!-- メタ情報（カテゴリーと評価） -->
      <div class="flex flex-wrap justify-between items-center gap-6 text-sm text-gray-600">
        <div class="flex items-center gap-3">
          <span class="px-2 m-2 py-2 bg-pink-200 text-pink-900 font-medium rounded-lg shadow-lg">
            {{ categoryLabel[post.category] || post.category }}
          </span>
        </div>
        <div class="flex p-2 items-center gap-3">
          <span class="mr-2 text-base font-semibold">評価:</span>
          <div class="flex items-center">
            <span class="text-yellow-400 text-lg">{{ "★".repeat(post.rating) }}</span>
            <span class="text-gray-300 text-lg">{{ "★".repeat(5 - post.rating) }}</span>
          </div>
        </div>
      </div>
    </header>


    <!-- 画像スライダー -->
    <div v-if="post.images?.length" class="relative">
      <!-- メイン画像 -->
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
            aria-label="前の画像"
          >
            ←
          </button>
          <button
            @click="nextImage"
            class="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity"
            aria-label="次の画像"
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
            @click="updateCurrentImageIndex(index)"
            class="w-2 h-2 rounded-full transition-colors"
            :class="index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'"
            :aria-label="`画像 ${index + 1} に移動`"
          />
        </div>
      </div>

      <!-- サムネイル -->
      <div 
        v-if="post.images.length > 1"
        class="mt-4 flex space-x-2 overflow-x-auto py-2"
      >
        <button
          v-for="(image, index) in post.images"
          :key="index"
          @click="updateCurrentImageIndex(index)"
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

    <!-- 投稿内容 -->
    <div 
      v-html="parsedContent" 
      class="prose prose-pink max-w-none"
    />

    <!-- フッター -->
    <footer class="pt-4 border-t border-gray-200 space-y-2">
      <div class="flex items-center justify-between text-sm text-gray-600">
        <p class="flex items-center gap-2">
          <span>投稿者:</span>
          <span class="font-medium">{{ post.user?.name }}</span>
        </p>
        <time :datetime="post.created_at">
          {{ formatDate(post.created_at) }}
        </time>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Post } from '~/types/api';
import { useMarkdown } from '~/composables/useMarkdown';

interface Props {
  post: Post;
  currentImageIndex: number;
}

const props = withDefaults(defineProps<Props>(), {
  currentImageIndex: 0
});

const emit = defineEmits<{
  (e: 'update:currentImageIndex', index: number): void;
}>();

const { parseMarkdown } = useMarkdown();

// カテゴリーのラベル
const categoryLabel: Record<string, string> = {
  'cosmetics': '化粧品',
  'surgery': '美容整形',
  'equipment': '美容機器',
  'etc': 'その他'
};

// 画像スライダーの制御
const updateCurrentImageIndex = (index: number) => {
  emit('update:currentImageIndex', index);
};

const nextImage = () => {
  if (!props.post.images) return;
  const nextIndex = (props.currentImageIndex + 1) % props.post.images.length;
  updateCurrentImageIndex(nextIndex);
};

const prevImage = () => {
  if (!props.post.images) return;
  const prevIndex = props.currentImageIndex === 0 
    ? props.post.images.length - 1 
    : props.currentImageIndex - 1;
  updateCurrentImageIndex(prevIndex);
};

// Markdownコンテンツのパース
const parsedContent = computed(() => {
  return parseMarkdown(props.post.content || '');
});

// 日付フォーマット
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
</script>