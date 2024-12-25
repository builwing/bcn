<template>
  <div class="bg-gray-100 min-h-screen py-8">
    <div class="max-w-4xl mx-auto px-4">
      <!-- ヘッダー部分 -->
      <div class="mb-8">
        <button @click="handleBack" class="btn-primary inline-block mb-4">
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
        <button @click="handleBack" class="mt-4 btn-secondary">
          戻る
        </button>
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
                @click="handleRatingSelect(ratingValue)"
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
        <!-- 画像アップロード部分 -->
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
          :alt="`既存の画像 ${index + 1}`"
          class="w-full h-32 object-cover rounded-lg"
        />
        <button
          type="button"
          @click="handleExistingImageRemove(index)"
          class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          title="画像を削除"
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

  <!-- 新規画像アップロードエリア -->
  <div
    class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-pink-500 transition-colors cursor-pointer"
    @click="handleUploadClick"
    @dragover.prevent
    @drop.prevent="handleFileDrop"
  >
    <input
      type="file"
      ref="fileInput"
      multiple
      accept="image/*"
      class="hidden"
      @change="handleFileChange"
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
  
  <!-- エラーメッセージ -->
  <p v-if="errors.images" class="mt-1 text-sm text-red-500">
    {{ errors.images }}
  </p>

  <!-- 新規画像プレビュー -->
  <div
    v-if="Object.keys(imageStore.images).length > 0"
    class="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
  >
    <div
      v-for="(imageData, index) in imageStore.getAllImages()"
      :key="index"
      class="relative group"
    >
      <img
        :src="imageData.previewUrl"
        :alt="`新規画像 ${index + 1}`"
        class="w-full h-32 object-cover rounded-lg cursor-pointer"
        @click="handleImageEdit(index)"
      />
      <button
        type="button"
        @click.stop="handleNewImageRemove(index)"
        class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
        title="画像を削除"
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

<!-- 送信ボタン部分 -->
<div class="flex justify-end space-x-4">
  <button
    type="button"
    @click="handleBack"
    class="btn-secondary"
    :disabled="isSubmitting"
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
    @click="handleDelete"
    class="btn-danger"
    :disabled="isSubmitting"
  >
    削除
  </button>
</div>
</form>
</div>
</div>
</template>





<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useImageStore } from '~/stores/images'
import { usePosts } from '~/composables/usePosts'

// APIレスポンスの型定義を追加
interface PostResponse {
  data: Post;
  error?: Error;
}

// GetPost関数の戻り値の型を明確に
interface APIResponse<T> {
  data: T;
  error?: Error;
}

// 型定義
interface Post {
  id: number
  title: string
  category: string
  rating: number
  content: string
  images?: PostImage[]
}

interface PostImage {
  id: number
  url: string
}

interface FormState {
  title: string
  category: string
  rating: number
  content: string
  images: File[]
}

interface FormErrors {
  title?: string
  category?: string
  rating?: string
  content?: string
  images?: string
}

// ストアとルーターの設定
const router = useRouter()
const route = useRoute()
const imageStore = useImageStore()
const { getPost, updatePost, deletePost } = usePosts()

// 状態管理
const postId = ref<number>(Number(route.params.id))
const existingImages = ref<PostImage[]>([])
const fileInput = ref<HTMLInputElement | null>(null)
const isLoading = ref(true)
const isSubmitting = ref(false)
const loadError = ref('')

// フォームの状態
const form = reactive<FormState>({
  title: '',
  category: '',
  rating: 0,
  content: '',
  images: []
})

// エラー状態
const errors = ref<FormErrors>({})

// カテゴリーリスト
const categories: string[] = [
  '美容整形',
  '化粧品',
  '健康器具',
  'その他'
]

// 投稿データの取得
onMounted(async () => {
  try {
    console.log('投稿データの取得開始:', postId.value)

    if (!postId.value || isNaN(postId.value)) {
      throw new Error('無効な投稿IDです')
    }

    const response = await getPost(postId.value)
    console.log('APIレスポンス:', response)
    if (!response.data) {
      throw new Error('投稿データの取得に失敗しました')
    }

    const post = response.data.data
    console.log('取得した投稿データ:', post)

    // フォームに値をセット
    form.title = post.title
    form.category = post.category
    form.rating = post.rating
    form.content = post.content

    // 既存の画像をセット
    if (post.images && Array.isArray(post.images)) {
      console.log('既存画像データ:', existingImages.value);
      existingImages.value = post.images.map(image => ({
        id: image.id,
        url: image.url
      }))
      console.log('既存の画像をセット:', existingImages.value)
    } else {
      console.log('画像データなし')
    }

  } catch (error) {
    console.error('投稿データの取得エラー:', error)
    loadError.value = error instanceof Error ? error.message : '投稿データの取得に失敗しました'
  } finally {
    isLoading.value = false
  }
})
// イベントハンドラー
const handleBack = () => router.back()

const handleRatingSelect = (value: number) => {
  form.rating = value
}

const handleUploadClick = () => {
  fileInput.value?.click()
}

const handleFileChange = async (event: Event) => {
  const files = Array.from((event.target as HTMLInputElement).files || [])
  await handleImageUpload(files)
}

const handleFileDrop = async (event: DragEvent) => {
  const files = Array.from(event.dataTransfer?.files || [])
  await handleImageUpload(files)
}

// 画像アップロード処理
const handleImageUpload = async (files: File[]) => {
  const imageFiles = files.filter(file => file.type.startsWith('image/'))
  const totalImages = imageStore.getImageIndices().length + existingImages.value.length
  
  if (totalImages + imageFiles.length > 10) {
    alert('画像は最大10枚までアップロードできます')
    return
  }

  for (const file of imageFiles) {
    try {
      const reader = new FileReader()
      await new Promise<void>((resolve, reject) => {
        reader.onload = (e) => {
          if (e.target?.result && typeof e.target.result === 'string') {
            const nextIndex = imageStore.getImageIndices().length
            imageStore.setImage(nextIndex, file, e.target.result)
            resolve()
          } else {
            reject(new Error('画像の読み込みに失敗しました'))
          }
        }
        reader.onerror = () => reject(new Error('画像の読み込みに失敗しました'))
        reader.readAsDataURL(file)
      })
    } catch (error) {
      console.error('画像処理エラー:', error)
    }
  }
}

// 画像編集・削除処理
const handleImageEdit = (index: number) => {
  router.push(`/posts/crop-image?index=${index}&returnTo=edit/${postId.value}`)
}

const handleNewImageRemove = (index: number) => {
  imageStore.removeImage(index)
}

const handleExistingImageRemove = (index: number) => {
  existingImages.value.splice(index, 1)
}

// 投稿削除処理
const handleDelete = async () => {
  if (!confirm('この投稿を削除してもよろしいですか？この操作は取り消せません。')) {
    return
  }

  try {
    isSubmitting.value = true
    await deletePost(postId.value)
    alert('投稿を削除しました')
    router.push('/posts')
  } catch (error) {
    console.error('削除エラー:', error)
    alert('削除に失敗しました')
  } finally {
    isSubmitting.value = false
  }
}

// フォーム送信処理
const handleSubmit = async () => {
  if (isSubmitting.value) return
  isSubmitting.value = true
  errors.value = {}

  try {
    const formData = new FormData()
    formData.append('title', form.title)
    formData.append('category', form.category)
    formData.append('rating', form.rating.toString())
    formData.append('content', form.content)

    // 既存の画像のIDを追加
    existingImages.value.forEach((image, index) => {
      formData.append(`existing_images[${index}]`, image.id.toString())
    })

    // 新規画像の追加
    const images = imageStore.getAllImages()
    images.forEach((imageData, index) => {
      formData.append(`new_images[${index}]`, imageData.file)
    })

    // API呼び出し
    const response = await updatePost({
      id: postId.value,
      formData
    })
    if (!response.data || response.error) {
      throw response.error || new Error('更新に失敗しました')
    }
    // 成功時は投稿詳細ページへ
    router.push(`/posts/${postId.value}`)

  } catch (error: any) {
    console.error('更新エラー:', error)
    if (error?.response?.data?.errors) {
      errors.value = error.response.data.errors
    } else {
      alert('投稿の更新に失敗しました')
    }
  } finally {
    isSubmitting.value = false
  }
}

const handleImageLoadError = (index: number) => {
  console.error(`画像の読み込みに失敗: index=${index}`)
  // 必要に応じてエラー処理を追加
}
// 状態変更を監視
watch(existingImages, (newImages) => {
  console.log('既存画像の状態が変更されました:', newImages)
}, { deep: true })

// ページメタ情報
definePageMeta({
  middleware: ['auth']
})
</script>

<style scoped>
.btn-secondary {
  @apply px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors;
}

.btn-danger {
  @apply px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors;
}

.input-field {
  @apply w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400;
}
</style>