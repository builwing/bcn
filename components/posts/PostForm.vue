<template>
  <form @submit.prevent="onSubmit" class="bg-white rounded-lg shadow-md p-6 space-y-6">
    <!-- タイトル入力 -->
    <div>
      <label for="title" class="block text-gray-700 font-medium mb-2">
        タイトル*
      </label>
      <input
        id="title"
        v-model="formData.title"
        type="text"
        required
        class="input-field w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
        placeholder="投稿のタイトルを入力してください"
      />
    </div>

    <!-- カテゴリーと評価を横並びに -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- カテゴリー選択 -->
      <div>
        <label for="category" class="block text-gray-700 font-medium mb-2">
          カテゴリー*
        </label>
        <select
          id="category"
          v-model="formData.category"
          required
          class="input-field w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
        >
          <option value="">カテゴリーを選択してください</option>
          <option
            v-for="option in categoryOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </div>

      <!-- 評価 -->
      <div class="flex flex-col items-center">
        <label class="block text-gray-700 font-medium mb-2">
          評価*
        </label>
        <div class="flex space-x-4">
          <template v-for="ratingValue in 5" :key="ratingValue">
            <button
              type="button"
              @click="formData.rating = ratingValue"
              class="focus:outline-none"
            >
              <span
                class="text-2xl"
                :class="ratingValue <= formData.rating ? 'text-yellow-400' : 'text-gray-300'"
              >
                ★
              </span>
            </button>
          </template>
        </div>
      </div>
    </div>

    <!-- 本文入力 -->
    <div>
      <label for="content" class="block text-gray-700 font-medium mb-2">
        本文*
      </label>
      <textarea
        id="content"
        v-model="formData.content"
        rows="10"
        required
        class="input-field w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
        placeholder="投稿の本文を入力してください"
      ></textarea>
    </div>

    <!-- 画像アップロード -->
    <div>
      <label class="block text-gray-700 font-medium mb-2">
        画像（最大10枚まで）
      </label>
      <div
        class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-pink-500 transition-colors cursor-pointer"
        @click="triggerFileInput"
        @dragover.prevent
        @drop.prevent="handleDrop"
      >
        <input
          type="file"
          ref="fileInput"
          multiple
          accept="image/*"
          class="hidden"
          @change="handleFileSelect"
        />
        <div class="space-y-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          <p class="text-gray-600">クリックまたはドラッグ＆ドロップで画像をアップロード</p>
        </div>
      </div>

      <!-- 画像スライダー -->
      <ImageSlider
        v-if="imageStore.hasImages"
        :images="imageStore.getAllImages().map(image => image.previewUrl)"
        v-model:currentIndex="currentImageIndex"
        :editable="true"
        @delete="removeImage"
      />
    </div>

    <!-- 送信ボタン -->
    <div class="flex justify-end mt-6 space-x-4">
      <button
        type="button"
        @click="$emit('cancel')"
        class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
      >
        キャンセル
      </button>
      <button
        type="submit"
        class="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50"
        :disabled="isSubmitting"
      >
        {{ isSubmitting ? '更新中...' : '更新する' }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRuntimeConfig } from 'nuxt/app';
import ImageSlider from './ImageSlider.vue';
import { useImageStore } from '~/stores/images';

// フォームデータの型
interface FormDataType {
  title: string;
  category: string;
  rating: number;
  content: string;
}

interface Props {
  post: Post;
}

interface Emits {
  (e: 'submit', data: FormData): void;
  (e: 'cancel'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const config = useRuntimeConfig();
const imageStore = useImageStore();

const currentImageIndex = ref(0);
const isSubmitting = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

// フォーム初期値
const formData = ref<FormDataType>({
  title: props.post?.title || '',
  category: props.post?.category || '',
  rating: props.post?.rating || 0,
  content: props.post?.content || '',
});

// カテゴリーオプション
const categoryOptions = [
  { value: 'cosmetics', label: '化粧品' },
  { value: 'surgery', label: '美容整形' },
  { value: 'equipment', label: '美容機器' },
  { value: 'etc', label: 'その他' },
];

// ファイル選択
const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileSelect = (event: Event) => {
  const files = Array.from((event.target as HTMLInputElement).files || []);
  handleFiles(files);
};

const handleDrop = (event: DragEvent) => {
  const files = Array.from(event.dataTransfer?.files || []);
  handleFiles(files);
};

const handleFiles = (files: File[]) => {
  const imageFiles = files.filter((file) => file.type.startsWith('image/'));
  const currentCount = imageStore.getImageIndices().length;
  if (currentCount + imageFiles.length > 10) {
    alert('画像は最大10枚までアップロードできます');
    return;
  }

  imageFiles.forEach((file, index) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result && typeof event.target.result === 'string') {
        const newIndex = currentCount + index;
        imageStore.setImage(newIndex, file, event.target.result);
      }
    };
    reader.readAsDataURL(file);
  });
};

// 画像削除
const removeImage = (index: number) => {
  imageStore.removeImage(index);
  const indices = imageStore.getImageIndices();
  if (indices.length > 0) {
    currentImageIndex.value = indices[0];
  }
};

// 投稿送信
const onSubmit = async () => {
  if (isSubmitting.value) return;
  isSubmitting.value = true;
  try {
    const submitData = new FormData();
    submitData.append('title', formData.value.title);
    submitData.append('category', formData.value.category);
    submitData.append('rating', formData.value.rating.toString());
    submitData.append('content', formData.value.content);

    const images = imageStore.getAllImages();
    images.forEach((imageData, index) => {
      submitData.append('images[]', imageData.file);
    });

    await emit('submit', submitData);
    imageStore.clearImages();
  } catch (error) {
    console.error('送信エラー:', error);
  } finally {
    isSubmitting.value = false;
  }
};
</script>
