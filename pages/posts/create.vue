<template>
    <div class="bg-gray-100 min-h-screen py-8">
      <div class="max-w-4xl mx-auto px-4">
        <!-- ヘッダー部分 -->
        <div class="mb-8">
          <!-- ページ遷移は NuxtLink で -->
          <NuxtLink to="/posts" class="btn-primary inline-block mb-4">
            ← 投稿一覧へ戻る
          </NuxtLink>
          <h1 class="text-3xl font-bold text-gray-800">新規投稿作成</h1>
        </div>
  
        <!-- 投稿フォーム -->
        <form @submit.prevent="handleSubmit" class="bg-white rounded-lg shadow-md p-6 space-y-6">
          <!-- タイトル入力 -->
          <div>
            <label for="title" class="block text-gray-700 font-medium mb-2">
              タイトル*
            </label>
            <input
              type="text"
              id="title"
              v-model="form.title"
              required
              class="input-field"
              :class="{ 'border-red-500': errors.title }"
              placeholder="投稿のタイトルを入力してください"
            />
            <p v-if="errors.title" class="mt-1 text-sm text-red-500">
              {{ errors.title }}
            </p>
          </div>
  
          <!-- カテゴリー選択 -->
          <div>
            <label for="category" class="block text-gray-700 font-medium mb-2">
              カテゴリー*
            </label>
            <select
              id="category"
              v-model="form.category"
              required
              class="input-field"
              :class="{ 'border-red-500': errors.category }"
            >
              <option value="">カテゴリーを選択してください</option>
              <option
                v-for="category in categories"
                :key="category"
                :value="category"
              >
                {{ category }}
              </option>
            </select>
            <p v-if="errors.category" class="mt-1 text-sm text-red-500">
              {{ errors.category }}
            </p>
          </div>
  
          <!-- 評価 -->
          <div>
            <label class="block text-gray-700 font-medium mb-2">
              評価*
            </label>
            <div class="flex space-x-4">
              <template v-for="ratingValue in 5" :key="ratingValue">
                <button
                  type="button"
                  @click="form.rating = ratingValue"
                  class="focus:outline-none"
                >
                  <span
                    class="text-2xl"
                    :class="ratingValue <= form.rating ? 'text-yellow-400' : 'text-gray-300'"
                  >
                    ★
                  </span>
                </button>
              </template>
            </div>
            <p v-if="errors.rating" class="mt-1 text-sm text-red-500">
              {{ errors.rating }}
            </p>
          </div>
  
          <!-- 本文入力 -->
          <div>
            <label for="content" class="block text-gray-700 font-medium mb-2">
              本文*
            </label>
            <textarea
              id="content"
              v-model="form.content"
              required
              rows="6"
              class="input-field"
              :class="{ 'border-red-500': errors.content }"
              placeholder="投稿の本文を入力してください"
            ></textarea>
            <p v-if="errors.content" class="mt-1 text-sm text-red-500">
              {{ errors.content }}
            </p>
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
                <p class="text-gray-600">
                  クリックまたはドラッグ＆ドロップで画像をアップロード
                </p>
              </div>
            </div>
            <p v-if="errors.images" class="mt-1 text-sm text-red-500">
              {{ errors.images }}
            </p>
  
            <!-- 画像プレビュー -->
            <div
              v-if="Object.keys(imageStore.previewUrls).length > 0"
              class="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
            >
              <div
                v-for="(url, index) in imageStore.previewUrls"
                :key="index"
                class="relative group"
              >
                <img
                  :src="url"
                  alt="プレビュー"
                  class="w-full h-32 object-cover rounded-lg cursor-pointer"
                  @click="openCropPage(index)"
                />
                <button
                  type="button"
                  @click.stop="removeImage(index)"
                  class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4"
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
  
  <script setup lang="ts">
  import { ref, reactive } from 'vue';
  import { useRouter } from 'vue-router';
  import { useRuntimeConfig, navigateTo } from '#app';
  import { useImageStore } from '~/stores/images';
  import { useUserStore } from '~/stores/user';
  
  // ----- インターフェース定義 -----
  interface FormErrors {
    title?: string;
    category?: string;
    rating?: string;
    content?: string;
    images?: string;
  }
  
  interface FormState {
    title: string;
    category: string;
    rating: number;
    content: string;
    images: File[];
  }
  
  // ----- ルータ・ストア等の取得 -----
  const router = useRouter();
  const config = useRuntimeConfig();
  const imageStore = useImageStore();
  const userStore = useUserStore();
  
  // ----- フォームの状態管理 -----
  const form = reactive<FormState>({
    title: '',
    category: '',
    rating: 0,
    content: '',
    images: []
  });
  
  // ----- エラー状態管理（ref でラップ） -----
  const errors = ref<FormErrors>({});
  
  // ----- その他の状態管理 -----
  const isSubmitting = ref(false);
  const fileInput = ref<HTMLInputElement | null>(null);
  
  // カテゴリーリスト
  const categories: string[] = [
    '美容整形',
    '化粧品',
    '健康器具',
    'その他'
  ];
  
  // ----- 画像アップロード関連のメソッド -----
  const triggerFileInput = () => {
    fileInput.value?.click();
  };
  
  const handleFileSelect = (event: Event) => {
    const files = Array.from((event.target as HTMLInputElement).files || []);
    addImages(files);
  };
  
  const handleDrop = (event: DragEvent) => {
    const files = Array.from(event.dataTransfer?.files || []);
    addImages(files);
  };
  
  // ----- 画像追加処理 -----
  const addImages = async (files: File[]) => {
    const imageFiles = files.filter((file) => file.type.startsWith('image/'));
    const totalImages = form.images.length + imageFiles.length;
    if (totalImages > 10) {
      alert('画像は最大10枚までアップロードできます');
      return;
    }
  
    for (const file of imageFiles) {
      const currentIndex = form.images.length;
      form.images.push(file);
  
      try {
        await new Promise<void>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            console.log('画像の読み込み成功:', {
              インデックス: currentIndex,
              データ: e.target?.result?.toString().slice(0, 100) + '...'
            });
  
            if (e.target?.result && typeof e.target.result === 'string') {
              imageStore.setOriginalImage(currentIndex, file, e.target.result);
              console.log('ストアの更新完了:', {
                インデックス: currentIndex,
                プレビューURL: imageStore.getPreviewUrl(currentIndex)
                  ?.slice(0, 100) + '...'
              });
              resolve();
            } else {
              reject(new Error('FileReaderの結果がnull、または文字列ではありません'));
            }
          };
          reader.onerror = () =>
            reject(new Error('FileReaderでエラーが発生しました'));
          reader.readAsDataURL(file);
        });
      } catch (error) {
        console.error('画像処理中にエラーが発生:', error);
      }
    }
  };
  
  // ----- 画像クリック → クロップページへ遷移 -----
  const openCropPage = (index: number) => {
    console.log('クロップページを開きます:', index, {
      プレビューURL: imageStore.getPreviewUrl(index)?.slice(0, 100) + '...',
      ストアの状態: {
        プレビューURL一覧: Object.keys(imageStore.previewUrls),
        オリジナル画像一覧: Object.keys(imageStore.originalImages),
      }
    });
    // Nuxt Router (Vue Router ラッパ) を使用
    router.push(`/posts/crop-image?index=${index}`);
  };
  
  // ----- 画像の削除 -----
  const removeImage = (index: number) => {
    form.images.splice(index, 1);
    imageStore.removeImage(index);
  };
  
  // ----- フォーム送信処理 -----
  const handleSubmit = async () => {
    if (isSubmitting.value) return;
    isSubmitting.value = true;
  
    // まずはエラーをクリア
    errors.value = {};
  
    try {
      // FormDataに詰める
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('category', form.category);
      formData.append('rating', form.rating.toString());
      formData.append('content', form.content);

      // croppedImageがあればそちらを優先
      form.images.forEach((image, index) => {
        const croppedImage = imageStore.croppedImages[index];
        formData.append(`images[${index}]`, croppedImage || image);
      });
  
      // FormDataの内容を確認
        // for (const pair of formData.entries()) {
        //     console.log(`${pair[0]}: ${pair[1]}`);
        // }
            // デバッグ用ログ
        for (const [key, value] of formData.entries()) {
            console.log(`${key}: ${value instanceof File ? value.name : value}`);
        }
      console.log('[create.vue] 投稿用のデータを送信します:', formData);
      // APIリクエスト
// userストアのcreatePostメソッドを呼び出し
      await userStore.createPost(formData);
      // 成功したら投稿一覧へ
      router.push('/posts');
    } catch (error: any) {
      console.error('投稿エラー:', error);
      // バックエンドからのバリデーションエラー形式に応じてエラーをセット
      if (error?.response?.data?.errors) {
        errors.value = error.response.data.errors;
      } else {
        alert('投稿の作成に失敗しました。');
      }
    } finally {
      isSubmitting.value = false;
    }
  };
  
  // Nuxt3 でページメタ情報を定義
  definePageMeta({
    middleware: ['auth']
  });
  </script>