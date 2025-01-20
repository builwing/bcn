<template>
  <div class="bg-white rounded-lg shadow-md p-6 space-y-6">
    <!-- ヘッダー: タイトルとメタ情報 -->
    <header class="space-y-2">
      <!-- タイトル -->
      <h1 class="text-4xl p-4 font-bold text-gray-800 leading-tight tracking-tight mt-2">
        {{ post.title }}
      </h1>
    </header>

    <!-- 画像スライダー -->
    <ImageSlider
      :images="post.images"
      :currentIndex="localImageIndex"
      @update:currentIndex="updateImageIndex"
    />

    <!-- 現在の画像のcontent -->
    <div v-if="currentImageContent" class="text-gray-700 mt-4">
      <h2 class="text-2xl font-semibold mb-2">画像の説明</h2>
      <p>{{ currentImageContent }}</p>
    </div>

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
import { ref, computed, watch } from 'vue';
import ImageSlider from './ImageSlider.vue';
import type { Post } from '~/types/api';

// **Props定義**
interface Props {
  post: Post;
  currentImageIndex: number;
}

const props = defineProps<Props>();
const emit = defineEmits(['update:currentImageIndex']);

// ローカルで画像インデックスを管理
const localImageIndex = ref(props.currentImageIndex);

// Propsの変更を監視してローカルのインデックスを更新
watch(() => props.currentImageIndex, (newIndex) => {
  localImageIndex.value = newIndex;
});

// インデックスを更新して親に通知
const updateImageIndex = (index: number) => {
  localImageIndex.value = index;
  emit('update:currentImageIndex', index);
};

// 現在の画像のcontentを取得
const currentImageContent = computed(() => {
  const currentImage = props.post.images[localImageIndex.value];
  return currentImage?.content || '説明はありません。';
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
    minute: '2-digit',
  }).format(date);
};
</script>
