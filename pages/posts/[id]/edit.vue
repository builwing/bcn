<!-- pages/posts/[id]/edit.vue -->
<template>
  <div class="bg-gray-100 min-h-screen py-8">
    <div class="max-w-4xl mx-auto px-4">
      <!-- 1) 戻るボタン -->
      <BackButton @click="handleBack" />

      <!-- タイトル表示 -->
      <h1 class="text-3xl font-bold text-gray-800 mb-8">投稿の編集</h1>
      
      <!-- 2) ローディング中 -->
      <div v-if="isLoading" class="text-center py-8">
        <p class="text-gray-600">データを読み込み中...</p>
      </div>

      <!-- 3) エラー表示 -->
      <ErrorDisplay
        v-else-if="loadError"
        :message="loadError"
        @onRetry="fetchPostData"
      />

      <!-- 4) フォーム表示 -->
      <div v-else>
        <PostForm
          :initialData="postFormData"
          :existingImages="existingImages"
          @submit="handleSubmit"
          @cancel="handleBack"
        />
        
        <!-- 削除ボタン -->
        <div class="flex justify-end mt-4">
          <button
            type="button"
            @click="handleDelete"
            class="btn-danger"
            :disabled="isSubmitting"
          >
            削除
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

import BackButton from '~/components/posts/BackButton.vue'
import ErrorDisplay from '~/components/posts/ErrorDisplay.vue'
import PostForm from '~/components/posts/PostForm.vue'

import { useImageStore } from '~/stores/images'
import { usePosts } from '~/composables/usePosts'
import type { Post, PostImage } from '~/types/post'

// 親コンポーネントが持つフォームデータ用インターフェース
// (imagesはbase64想定)
interface FormDataType {
  title: string
  category: string
  rating: number
  content: string
  images: string[]
}

const router = useRouter()
const route = useRoute()
const { getPost, updatePost, deletePost } = usePosts()
const imageStore = useImageStore()

// state
const isLoading = ref(true)
const loadError = ref('')
const isSubmitting = ref(false)

// 取得した投稿データをフォーム用に変換
const postFormData = reactive<FormDataType>({
  title: '',
  category: '',
  rating: 0,
  content: '',
  images: []
})

// 既存画像（DBに保存済みの画像URLなど）
const existingImages = ref<PostImage[]>([])

// ルートパラメータ
const postId = Number(route.params.id)

/**
 * マウント時に投稿データを取得
 */
onMounted(() => {
  fetchPostData()
})

async function fetchPostData() {
  try {
    isLoading.value = true
    loadError.value = ''

    const response = await getPost(postId)
    if (!response.data || response.error) {
      throw response.error || new Error('投稿データの取得に失敗しました')
    }

    // 取得成功時
    const post = response.data.data as Post
    // 親のフォームデータと既存画像を反映
    postFormData.title = post.title
    postFormData.category = post.category
    postFormData.rating = post.rating
    postFormData.content = post.content
    postFormData.images = []

    existingImages.value = post.images || []
  } catch (error: any) {
    loadError.value = error?.message || '読み込みエラーが発生しました'
  } finally {
    isLoading.value = false
  }
}

/**
 * 前の画面に戻る
 */
function handleBack() {
  router.back()
}

/**
 * フォーム送信 (子 @submit時)
 */
async function handleSubmit(updatedForm: FormDataType) {
  try {
    isSubmitting.value = true

    // 1) FormData
    const formData = new FormData()
    formData.append('title', updatedForm.title)
    formData.append('category', updatedForm.category)
    formData.append('rating', String(updatedForm.rating))
    formData.append('content', updatedForm.content)

    // 2) 既存画像ID
    existingImages.value.forEach((img, idx) => {
      formData.append(`existing_images[${idx}]`, String(img.id))
    })

    // 3) 新規画像 (base64 → File化は実際の運用次第)
    updatedForm.images.forEach((base64, idx) => {
      formData.append(`new_images[${idx}]`, base64)
    })

    // 4) API 呼び出し
    const response = await updatePost(postId, formData)
    if (!response.data || response.error) {
      throw response.error || new Error('更新に失敗しました')
    }

    alert('投稿を更新しました')
    router.push(`/posts/${postId}`)
  } catch (error: any) {
    console.error(error)
    alert('投稿の更新に失敗しました')
  } finally {
    isSubmitting.value = false
  }
}

/**
 * 投稿削除処理
 */
async function handleDelete() {
  if (!confirm('この投稿を削除してもよろしいですか？')) return
  try {
    isSubmitting.value = true
    await deletePost(postId)
    alert('投稿を削除しました')
    router.push('/posts')
  } catch (error: any) {
    console.error(error)
    alert('削除に失敗しました')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.btn-danger {
  @apply px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors;
}
</style>