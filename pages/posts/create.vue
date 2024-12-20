# pages/posts/create.vue
<template>
  <div class="bg-gray-100 min-h-screen py-8">
    <div class="max-w-4xl mx-auto px-4">
      <!-- ヘッダー部分 -->
      <div class="mb-8">
        <NuxtLink to="/posts" class="btn-primary inline-block mb-4">
          ← 投稿一覧へ戻る
        </NuxtLink>
        <h1 class="text-3xl font-bold text-gray-800">新規投稿作成</h1>
      </div>

      <!-- 投稿フォーム -->
      <form @submit.prevent="handleSubmit" class="bg-white rounded-lg shadow-md p-6 space-y-6">
        <!-- タイトル入力 -->
        <div>
          <label for="title" class="block text-gray-700 font-medium mb-2">タイトル*</label>
          <input
            type="text"
            id="title"
            v-model="form.title"
            required
            class="input-field"
            :class="{ 'border-red-500': errors.title }"
            placeholder="投稿のタイトルを入力してください"
          />
          <p v-if="errors.title" class="mt-1 text-sm text-red-500">{{ errors.title }}</p>
        </div>

        <!-- カテゴリー選択 -->
        <div>
          <label for="category" class="block text-gray-700 font-medium mb-2">カテゴリー*</label>
          <select
            id="category"
            v-model="form.category"
            required
            class="input-field"
            :class="{ 'border-red-500': errors.category }"
          >
            <option value="">カテゴリーを選択してください</option>
            <option v-for="category in categories" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
          <p v-if="errors.category" class="mt-1 text-sm text-red-500">{{ errors.category }}</p>
        </div>

        <!-- 評価 -->
        <div>
          <label class="block text-gray-700 font-medium mb-2">評価*</label>
          <div class="flex space-x-4">
            <template v-for="rating in 5" :key="rating">
              <button
                type="button"
                @click="form.rating = rating"
                class="focus:outline-none"
              >
                <span
                  class="text-2xl"
                  :class="rating <= form.rating ? 'text-yellow-400' : 'text-gray-300'"
                >
                  ★
                </span>
              </button>
            </template>
          </div>
          <p v-if="errors.rating" class="mt-1 text-sm text-red-500">{{ errors.rating }}</p>
        </div>

        <!-- 本文入力 -->
        <div>
          <label for="content" class="block text-gray-700 font-medium mb-2">本文*</label>
          <textarea
            id="content"
            v-model="form.content"
            required
            rows="6"
            class="input-field"
            :class="{ 'border-red-500': errors.content }"
            placeholder="投稿の本文を入力してください"
          ></textarea>
          <p v-if="errors.content" class="mt-1 text-sm text-red-500">{{ errors.content }}</p>
        </div>

        <!-- 画像アップロード -->
        <div>
          <label class="block text-gray-700 font-medium mb-2">画像（最大10枚まで）</label>
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
              <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <p class="text-gray-600">クリックまたはドラッグ＆ドロップで画像をアップロード</p>
            </div>
          </div>
          <p v-if="errors.images" class="mt-1 text-sm text-red-500">{{ errors.images }}</p>

          <!-- 画像プレビュー -->
          <div v-if="imagePreviewUrls.length > 0" class="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            <div
              v-for="(url, index) in imagePreviewUrls"
              :key="index"
              class="relative group"
            >
              <img
                :src="url"
                alt="プレビュー"
                class="w-full h-32 object-cover rounded-lg"
              />
              <button
                type="button"
                @click="removeImage(index)"
                class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- 送信ボタン -->
        <div class="flex justify-end">
          <button
            type="submit"
            class="btn-primary"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? '投稿中...' : '投稿する' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const config = useRuntimeConfig();

// フォームの状態
const form = reactive({
  title: '',
  category: '',
  rating: 0,
  content: '',
  images: []
});

// 入力エラー
const errors = reactive({});

// 状態管理
const isSubmitting = ref(false);
const fileInput = ref(null);
const imagePreviewUrls = ref([]);

// カテゴリーリスト（APIから取得することも可能）
const categories = [
  'メイク',
  'スキンケア',
  'ヘアケア',
  'ネイル',
  'その他'
];

// ファイル入力のトリガー
const triggerFileInput = () => {
  fileInput.value.click();
};

// ファイル選択時の処理
const handleFileSelect = (event) => {
  const files = Array.from(event.target.files);
  addImages(files);
};

// ドラッグ&ドロップ時の処理
const handleDrop = (event) => {
  const files = Array.from(event.dataTransfer.files);
  addImages(files);
};

// 画像の追加処理
const addImages = (files) => {
  // 画像ファイルのみをフィルタリング
  const imageFiles = files.filter(file => file.type.startsWith('image/'));
  
  // 最大10枚までの制限
  const totalImages = form.images.length + imageFiles.length;
  if (totalImages > 10) {
    alert('画像は最大10枚までアップロードできます');
    return;
  }

  // 画像の追加とプレビューの生成
  imageFiles.forEach(file => {
    form.images.push(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreviewUrls.value.push(e.target.result);
    };
    reader.readAsDataURL(file);
  });
};

// 画像の削除
const removeImage = (index) => {
  form.images.splice(index, 1);
  imagePreviewUrls.value.splice(index, 1);
};

// フォームの送信処理
const handleSubmit = async () => {
  if (isSubmitting.value) return;
  isSubmitting.value = true;
  errors.value = {};

  try {
    // FormDataの作成
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('category', form.category);
    formData.append('rating', form.rating);
    formData.append('content', form.content);
    
    // 画像の追加
    form.images.forEach((image, index) => {
      formData.append(`images[${index}]`, image);
    });

    // APIリクエスト
    const response = await $fetch(`${config.public.apiBase}/posts`, {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });

    // 成功時は投稿一覧ページへリダイレクト
    router.push('/posts');
  } catch (error) {
    console.error('投稿エラー:', error);
    
    // エラーメッセージの設定
    if (error.response?.data?.errors) {
      errors.value = error.response.data.errors;
    } else {
      alert('投稿の作成に失敗しました。');
    }
  } finally {
    isSubmitting.value = false;
  }
};

// ページメタデータの定義
definePageMeta({
  middleware: ['auth']
});
</script>