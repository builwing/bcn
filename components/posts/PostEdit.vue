<template>
    <div class="bg-white rounded-lg shadow-md p-6 space-y-6">
      <!-- ヘッダー: タイトルとメタ情報 -->
      <header class="space-y-2">
        <!-- タイトル編集 -->
        <input
          v-model="editedPost.title"
          class="text-4xl p-4 font-bold text-gray-800 leading-tight tracking-tight mt-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="タイトルを入力"
        />
      </header>
  
      <!-- 画像スライダー -->
      <ImageSlider
        :images="editedPost.images"
        :currentIndex="localImageIndex"
        @update:currentIndex="updateImageIndex"
      />
  
      <!-- 現在の画像のcontent編集 -->
      <div class="mt-4">
        <h2 class="text-2xl font-semibold mb-2">画像の説明</h2>
        <textarea
          v-model="currentImageContent"
          class="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[150px]"
          placeholder="画像の説明を入力してください"
        ></textarea>
      </div>
  
      <!-- アクションボタン -->
      <div class="flex justify-end gap-4 pt-4">
        <button
          @click="cancelEdit"
          class="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100"
        >
          キャンセル
        </button>
        <button
          @click="saveChanges"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          保存
        </button>
      </div>
  
      <!-- フッター -->
      <footer class="pt-4 border-t border-gray-200 space-y-2">
        <div class="flex items-center justify-between text-sm text-gray-600">
          <p class="flex items-center gap-2">
            <span>投稿者:</span>
            <span class="font-medium">{{ editedPost.user?.name }}</span>
          </p>
          <time :datetime="editedPost.created_at">
            {{ formatDate(editedPost.created_at) }}
          </time>
        </div>
      </footer>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, watch } from 'vue';
  import ImageSlider from './ImageSlider.vue';
  import type { Post, PostImage } from '~/types/api';
  
  // Props定義
  interface Props {
    post: Post;
    currentImageIndex: number;
  }
  
  const props = defineProps<Props>();
  const emit = defineEmits(['update:currentImageIndex', 'save', 'cancel']);
  
  // 編集用の投稿データをコピー
  const editedPost = ref({ ...props.post });
  
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
  
  // 現在の画像のcontent
  const currentImageContent = computed({
    get: () => {
      const currentImage = editedPost.value.images[localImageIndex.value];
      return currentImage?.content || '';
    },
    set: (newContent: string) => {
      if (editedPost.value.images[localImageIndex.value]) {
        editedPost.value.images[localImageIndex.value].content = newContent;
      }
    }
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
  
  // キャンセルボタンのハンドラー
  const cancelEdit = () => {
    emit('cancel');
  };
  
  // 保存ボタンのハンドラー
  const saveChanges = () => {
    emit('save', editedPost.value);
  };
  </script>