<template>
  <div class="bg-gray-100 min-h-screen py-8">
    <div class="max-w-4xl mx-auto px-4">
      <!-- ヘッダー部分 -->
      <div class="mb-8">
      <!-- 戻るボタン -->
      <BackButton @click="handleBack" />

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
          <div v-if="imageStore.hasImages" class="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            <div
              v-for="(imageData, index) in imageStore.getAllImages()"
              :key="index"
              class="relative group"
            >
              <img
                :src="imageData.previewUrl"
                :alt="`プレビュー ${index + 1}`"
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
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useImageStore } from '~/stores/images'
import { useUserStore } from '~/stores/user'
import { useFormStore } from '~/stores/form'
// コンポーネントのインポート
import BackButton from '~/components/posts/BackButton.vue';
import PostForm from '@/components/posts/PostForm.vue';


// インターフェース定義
interface FormErrors {
  title?: string
  category?: string
  rating?: string
  content?: string
  images?: string
}

interface FormState {
  title: string
  category: string
  rating: number
  content: string
}

// ストアとルーターの設定
const router = useRouter()
const route = useRoute()
const imageStore = useImageStore()
const userStore = useUserStore()
const formStore = useFormStore()

// フォームの状態管理
const form = reactive<FormState>({
  title: formStore.formData.title,
  category: formStore.formData.category,
  rating: formStore.formData.rating,
  content: formStore.formData.content
})

// エラー状態と送信状態の管理
const errors = ref<FormErrors>({})
const isSubmitting = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

// 戻るボタンハンドラ
const handleBack = () => {
  router.push('/');  // 単純に投稿一覧へ戻る
};


// カテゴリーリスト
const categories = [
  '美容整形',
  '化粧品',
  '健康器具',
  'その他'
]

// フォーム値の監視
watch(
  () => ({
    title: form.title,
    category: form.category,
    rating: form.rating,
    content: form.content
  }),
  (newVal) => {
    formStore.setFormData(newVal)
  },
  { deep: true }
)

// ファイル選択のトリガー
const triggerFileInput = () => {
  fileInput.value?.click()
}

// ファイル選択ハンドラー
const handleFileSelect = (event: Event) => {
  const files = Array.from((event.target as HTMLInputElement).files || [])
  addImages(files)
}

// ドロップハンドラー
const handleDrop = (event: DragEvent) => {
  const files = Array.from(event.dataTransfer?.files || [])
  addImages(files)
}

// 画像追加処理
const addImages = async (files: File[]) => {
  const imageFiles = files.filter(file => file.type.startsWith('image/'))
  const currentImageCount = imageStore.getImageIndices().length
  const totalImages = currentImageCount + imageFiles.length

  if (totalImages > 10) {
    alert('画像は最大10枚までアップロードできます')
    return
  }

  let nextIndex = currentImageCount

  for (const file of imageFiles) {
    try {
      const reader = new FileReader()
      await new Promise<void>((resolve, reject) => {
        reader.onload = (e) => {
          if (e.target?.result && typeof e.target.result === 'string') {
            imageStore.setImage(nextIndex, file, e.target.result)
            console.log(`画像を追加: ${nextIndex}`)
            nextIndex++
            resolve()
          } else {
            reject(new Error('FileReader error'))
          }
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
    } catch (error) {
      console.error('画像処理エラー:', error)
    }
  }
}

// クロップページを開く
const openCropPage = (index: number) => {
  router.push(`/posts/crop-image?index=${index}`)
}

// 画像を削除
const removeImage = (index: number) => {
  imageStore.removeImage(index)
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

    // 画像の追加
    const images = imageStore.getAllImages()
    images.forEach((imageData, index) => {
      formData.append('images[]', imageData.file)
    })

    const response = await userStore.createPost(formData)
    console.log('投稿成功:', response)

    formStore.clearForm()
    imageStore.clearImages()
    await router.push('/posts')
  } catch (error: any) {
    console.error('投稿エラー:', error)
    if (error?.response?.data?.errors) {
      errors.value = error.response.data.errors
    } else {
      alert('投稿の作成に失敗しました。')
    }
  } finally {
    isSubmitting.value = false
  }
}

// ページマウント時の処理
onMounted(() => {
  // フォーム値の復元
  form.title = formStore.formData.title
  form.category = formStore.formData.category
  form.rating = formStore.formData.rating
  form.content = formStore.formData.content
})

// クリーンアップ
onUnmounted(() => {
  if (route.path !== '/posts/create') {
    imageStore.clearImages()
  }
})

// ページメタ情報
definePageMeta({
  middleware: ['auth']
})
</script>