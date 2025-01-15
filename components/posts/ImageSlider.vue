<template>
  <div class="relative">
    <!-- メイン画像表示エリア -->
    <div class="relative w-full h-[400px] rounded-lg overflow-hidden">
      <img
        v-if="currentImageUrl"
        :src="currentImageUrl"
        :alt="`画像 ${currentIndex + 1}`"
        class="w-full h-full object-cover"
      />
      <div v-else class="w-full h-full flex items-center justify-center bg-gray-100">
        画像がありません
      </div>
            
      <!-- 画像ナビゲーションボタン -->
      <div v-if="images.length > 1" class="absolute inset-0 flex items-center justify-between px-4">
        <button
          @click="prev"
          class="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity"
          aria-label="前の画像"
        >
          ←
        </button>
        <button
          @click="next"
          class="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity"
          aria-label="次の画像"
        >
          →
        </button>
      </div>

      <!-- 画像インジケーター -->
      <div 
        v-if="images.length > 1"
        class="absolute bottom-4 left-0 right-0 flex justify-center space-x-2"
      >
        <button
          v-for="(_, index) in images"
          :key="index"
          @click="updateIndex(index)"
          class="w-2 h-2 rounded-full transition-colors"
          :class="index === currentIndex ? 'bg-white' : 'bg-white bg-opacity-50'"
          :aria-label="`画像 ${index + 1} に移動`"
        />
      </div>
    </div>

    <!-- サムネイル -->
    <div 
      v-if="images.length > 1"
      class="mt-4 flex space-x-2 overflow-x-auto py-2"
    >
      <button
        v-for="(image, index) in images"
        :key="index"
        @click="updateIndex(index)"
        class="flex-shrink-0 w-20 h-20 rounded-md overflow-hidden relative group"
        :class="{ 'ring-2 ring-pink-500': index === currentIndex }"
      >
        <img
          :src="getImageUrl(image)"
          :alt="`サムネイル ${index + 1}`"
          class="w-full h-full object-cover"
        />
        <!-- 削除ボタン（編集モードの場合のみ表示） -->
        <div
          v-if="editable"
          @click.stop="handleDelete(index)"
          class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  images: (string | { url: string })[];  // 文字列またはオブジェクトの配列に対応
  currentIndex: number;
  editable?: boolean;  // 編集モードかどうか
}

interface Emits {
  (e: 'update:currentIndex', value: number): void;
  (e: 'delete', index: number): void;
}

const props = withDefaults(defineProps<Props>(), {
  editable: false,
  currentIndex: 0
});

const emit = defineEmits<Emits>();

// 現在の画像URLを取得
const currentImageUrl = computed(() => {
  // 画像配列が空、またはcurrentIndexが有効範囲外の場合のチェック
  if (!props.images.length || props.currentIndex >= props.images.length) {
    return ''; // またはデフォルト画像のURL
  }
  return getImageUrl(props.images[props.currentIndex]);
});
// const currentImageUrl = computed(() => getImageUrl(props.images[props.currentIndex]));

// 画像URLを取得（文字列またはオブジェクトに対応）
function getImageUrl(image: string | { url: string } | undefined): string {
  if (!image) {
    return ''; // またはデフォルト画像のURL
  }
  return typeof image === 'string' ? image : image.url;
}

// インデックスの更新
const updateIndex = (index: number) => {
  emit('update:currentIndex', index);
};

// 次の画像へ
const next = () => {
  const nextIndex = (props.currentIndex + 1) % props.images.length;
  updateIndex(nextIndex);
};

// 前の画像へ
const prev = () => {
  const prevIndex = props.currentIndex === 0 
    ? props.images.length - 1 
    : props.currentIndex - 1;
  updateIndex(prevIndex);
};

// 画像削除
const handleDelete = (index: number) => {
  emit('delete', index);
};
</script>