<template>
  <div class="bg-gray-100 min-h-screen py-8">
    <div class="max-w-4xl mx-auto px-4">
      <!-- ヘッダー部分 -->
      <div class="mb-8">
        <button @click="router.back()" class="btn-primary inline-block mb-4">
          ← 前のページへ戻る
        </button>
        <h1 class="text-3xl font-bold text-gray-800">投稿の編集</h1>
      </div>

      <!-- ローディング表示 -->
      <div v-if="isLoading" class="text-center py-8">
        <p class="text-gray-600">データを読み込み中...</p>
      </div>

      <!-- エラー表示 -->
      <div v-else-if="loadError" class="text-center py-8">
        <p class="text-red-500">{{ loadError }}</p>
      </div>

      <!-- 投稿フォーム -->
      <form v-else @submit.prevent="handleSubmit" class="bg-white rounded-lg shadow-md p-6 space-y-6">
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
          <!-- 既存の画像表示 -->
          <div v-if="existingImages.length > 0" class="mb-4">
            <p class="text-gray-700 font-medium mb-2">既存の画像</p>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              <div
                v-for="(image, index) in existingImages"
                :key="image.id"
                class="relative group"
              >
                <img
                  :src="image.url"
                  alt="既存の画像"
                  class="w-full h-32 object-cover rounded-lg"
                />
                <button
                  type="button"
                  @click="removeExistingImage(index)"
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

          <!-- 新規画像アップロード -->
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
                クリックまたはドラッグ＆ドロップで新しい画像をアップロード
              </p>
            </div>
          </div>
          <p v-if="errors.images" class="mt-1 text-sm text-red-500">
            {{ errors.images }}
          </p>

          <!-- 新規画像プレビュー -->
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
        <div class="flex justify-end space-x-4">
          <button
            type="button"
            @click="router.back()"
            class="btn-secondary"
          >
            キャンセル
          </button>
          <button
            type="submit"
            class="btn-primary"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? '更新中...' : '更新する' }}
          </button>
          <button
            type="button"
            @click="confirmDelete"
            class="btn-danger"
            :disabled="isSubmitting"
          >
            削除する
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useRuntimeConfig } from 'nuxt/app';
import { useImageStore } from '~/stores/images';
import { usePosts } from '~/composables/usePosts';

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

interface PostImage {
  id: number;
  url: string;
}

// ----- ルータ・ストア等の取得 -----
const router = useRouter();
const route = useRoute();
const config = useRuntimeConfig();
const imageStore = useImageStore();
const { getPost, updatePost, deletePost } = usePosts();

// ----- 削除処理 -----
const confirmDelete = async () => {
  const confirmResult = window.confirm('この投稿を削除しますか？この操作は取り消せません。');
  if (!confirmResult) {
    return;
  }
  try {
    isSubmitting.value = true;
    console.log('削除処理を開始します...');
    const response = await deletePost(Number(postId.value));
    if (response.error) {
      console.error('削除エラー:', response.error);
      alert('削除に失敗しました。');
      return;
    }
    console.log('削除が完了しました:', response);
    alert('投稿が削除されました。');
    router.push('/posts');
  } catch (error) {
    console.error('削除処理中にエラーが発生しました:', error);
    alert('削除に失敗しました。');
  } finally {
    isSubmitting.value = false;
  }
};

// ----- 状態管理 -----
const postId = ref(route.params.id);
const existingImages = ref<PostImage[]>([]);
const form = reactive<FormState>({
  title: '',
  category: '',
  rating: 0,
  content: '',
  images: []
});
const errors = ref<FormErrors>({});
const isLoading = ref(true);
const isSubmitting = ref(false);
const loadError = ref('');
const fileInput = ref<HTMLInputElement | null>(null);

// カテゴリーリスト
const categories: string[] = ['美容整形', '化粧品', '健康器具','その他'];

// ----- 投稿データの取得 -----
onMounted(async () => {
  try {
    console.log('投稿データの取得を開始します...');

    // APIリクエスト
    const { data, error } = await getPost(Number(postId.value));
    if (error) {
      console.error('APIリクエスト中にエラーが発生しました:', error);
      throw error;
    }

    const post: Post | undefined = data?.data; // 明確な型指定
    if (!post) {
      console.error('投稿データが見つかりません');
      throw new Error('投稿データが見つかりません');
    }

    console.log('投稿データの取得に成功しました:', post);

    // フォームに値をセット
    form.title = post.title;
    form.category = post.category;
    form.rating = post.rating;
    form.content = post.content;

    // 既存の画像をセット
    if (post.images?.length) {
      console.log('既存の画像データを設定中...');
      existingImages.value = post.images.map((image: PostImage) => ({
        id: image.id,
        url: image.url
      }));
      console.log('既存の画像データが設定されました:', existingImages.value);
    } else {
      console.log('投稿には画像がありません');
    }

    console.log('すべてのデータが正常にロードされました');
  } catch (error) {
    console.error('投稿データの取得エラー:', error);
    loadError.value = '投稿データの取得に失敗しました';
  } finally {
    console.log('投稿データの取得処理が完了しました');
    isLoading.value = false;
  }
});

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

const addImages = async (files: File[]) => {
  const imageFiles = files.filter((file) => file.type.startsWith('image/'));
  const totalImages = form.images.length + imageFiles.length + existingImages.value.length;
  
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
          if (e.target?.result && typeof e.target.result === 'string') {
            imageStore.setOriginalImage(currentIndex, file, e.target.result);
            resolve();
          } else {
            reject(new Error('FileReaderの結果が無効です'));
          }
        };
        reader.onerror = () => reject(new Error('FileReaderでエラーが発生しました'));
        reader.readAsDataURL(file);
      });
    } catch (error) {
      console.error('画像処理中にエラーが発生:', error);
    }
  }
};

// ----- 画像関連の処理 -----
const openCropPage = (index: number) => {
  router.push(`/posts/crop-image?index=${index}&returnTo=edit/${postId.value}`);
};

const removeImage = (index: number) => {
  form.images.splice(index, 1);
  imageStore.removeImage(index);
};

const removeExistingImage = (index: number) => {
  existingImages.value.splice(index, 1);
};

// ----- フォーム送信処理 -----
const handleSubmit = async () => {
  if (isSubmitting.value) return;
  isSubmitting.value = true;
  errors.value = {};

  try {
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('category', form.category);
    formData.append('rating', form.rating.toString());
    formData.append('content', form.content);
    
    // 残っている既存の画像のIDを送信
    existingImages.value.forEach((image, index) => {
      formData.append(`existing_images[${index}]`, image.id.toString());
    });

// 新規アップロード画像の処理
form.images.forEach((image, index) => {
   const croppedImage = imageStore.croppedImages[index];
   formData.append(`new_images[${index}]`, croppedImage || image);
 });

 // デバッグ用ログ
 for (const [key, value] of formData.entries()) {
   console.log(`${key}: ${value instanceof File ? value.name : value}`);
 }

 // APIリクエスト
 const response = await updatePost({
   id: Number(postId.value),
   ...Object.fromEntries(formData)
 });

 if (response.error) throw response.error;

 // 成功したら投稿詳細へ
 router.push(`/posts/${postId.value}`);

} catch (error: any) {
 console.error('更新エラー:', error);
 if (error?.response?.data?.errors) {
   errors.value = error.response.data.errors;
 } else {
   alert('投稿の更新に失敗しました。');
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

<style scoped>
.btn-secondary {
@apply px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors;
}

.input-field {
@apply w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400;
}
</style>