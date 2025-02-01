<template>
  <div class="bg-gray-100 min-h-screen py-8">
    <div class="max-w-4xl mx-auto px-4">
      <!-- 戻るボタン -->
      <BackButton @click="handleBack" />

      <div v-if="isDev" class="mb-4 p-4 bg-yellow-100 rounded">
        <pre class="text-sm">{{ post }}</pre>
      </div>

      <h1 class="text-3xl font-bold text-gray-800 mb-8">投稿の編集</h1>
      
      <!-- ローディング中 -->
      <div v-if="isLoading" class="text-center py-8">
        <p class="text-gray-600">データを読み込み中...</p>
      </div>

      <!-- エラー表示 -->
      <div v-else-if="loadError" class="text-center py-8">
        <p class="text-red-500">{{ loadError }}</p>
        <button
          @click="fetchPostData"
          class="mt-4 px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700"
        >
          再試行
        </button>
      </div>

      <!-- 編集フォーム -->
      <div v-else-if="post">
        <PostEdit
          :post="post"
          :current-image-index="currentImageIndex"
          @update:current-image-index="updateImageIndex"
          @save="handleSave"
          @cancel="handleBack"
          @delete-image="handleDeleteImage"
        />
      </div>
      <!-- 削除確認モーダル -->
    <Modal v-if="showDeleteModal" @close="showDeleteModal = false">
      <template #header>
        <h3 class="text-lg font-medium text-gray-900">画像の削除確認</h3>
      </template>
      <template #body>
        <p>この画像を削除してもよろしいですか？</p>
        <p class="text-sm text-gray-500 mt-2">この操作は取り消せません。</p>
      </template>
      <template #footer>
        <div class="flex justify-end gap-3">
          <button
            class="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            @click="showDeleteModal = false"
          >
            キャンセル
          </button>
          <button
            class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            :disabled="isDeletingImage"
            @click="confirmDeleteImage"
          >
            {{ isDeletingImage ? '削除中...' : '削除する' }}
          </button>
        </div>
      </template>
    </Modal>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePosts } from '~/composables/usePosts'
import type { Post, PostImage } from '~/types/api'
import BackButton from '~/components/posts/BackButton.vue'
import PostEdit from '~/components/posts/PostEdit.vue'
import Modal from '@/components/common/Modal.vue'

const router = useRouter()
const route = useRoute()
const { getPost, updatePost, deletePostImage } = usePosts()
const showDeleteModal = ref(false)
const isDeletingImage = ref(false)
const imageToDelete = ref<{ id: number, index: number } | null>(null)
const isDev = process.env.NODE_ENV === 'development'


const post = ref<Post | null>(null)
const isLoading = ref(true)
const loadError = ref<string | null>(null)
const currentImageIndex = ref(0)

// 画像削除の確認
const confirmDeleteImage = async () => {
  if (!imageToDelete.value || !post.value) return

  isDeletingImage.value = true
  try {
    const { error } = await deletePostImage(imageToDelete.value.id)
    if (error) throw error

    // 成功したら画像リストから削除
    const newImages = [...post.value.images]
    newImages.splice(imageToDelete.value.index, 1)
    post.value = {
      ...post.value,
      images: newImages
    }

    // インデックスの調整
    if (currentImageIndex.value >= newImages.length) {
      currentImageIndex.value = Math.max(0, newImages.length - 1)
    }

    showDeleteModal.value = false
  } catch (error) {
    console.error('画像の削除に失敗しました:', error)
    // エラー処理を追加
  } finally {
    isDeletingImage.value = false
    imageToDelete.value = null
  }
}

// 投稿データの取得
// 投稿データの取得
const fetchPostData = async () => {
  isLoading.value = true
  loadError.value = null

  try {
    const { data, error } = await getPost(Number(route.params.id))
    if (error) throw error
    if (!data) throw new Error('投稿データが見つかりません')
    
    // 画像データを正規化
    const normalizedImages = data.data.images.map((image: any) => ({
      id: typeof image === 'string' ? null : image.id || null,
      url: typeof image === 'string' ? image : image.url,
      content: typeof image === 'string' ? '' : image.content || '',
      filename: typeof image === 'string' ? '' : image.filename || ''
    }))
    
    post.value = {
      ...data.data,
      images: normalizedImages
    }
  } catch (error) {
    console.error('投稿データの取得に失敗:', error)
    loadError.value = '投稿データの取得に失敗しました'
  } finally {
    isLoading.value = false
  }
}

// 画像インデックスの更新
const updateImageIndex = (index: number) => {
  currentImageIndex.value = index
}

// 保存処理
const handleSave = async (editedPost: Post) => {
  if (!post.value?.id) return

  try {
    const formData = new FormData()
    
    // 編集されたデータをFormDataに設定
    formData.append('title', editedPost.title)
    formData.append('content', editedPost.content)
    
    // 画像の説明文を更新
    editedPost.images.forEach((image: PostImage, index: number) => {
      if (image.content) {
        formData.append(`images[${index}][content]`, image.content)
      }
      if (image.filename) {
        formData.append(`images[${index}][filename]`, image.filename)
      }
      formData.append(`images[${index}][url]`, image.url)
    })

    const { error } = await updatePost(post.value.id, formData)
    if (error) throw error
    
    await router.push(`/posts/${post.value.id}`)
  } catch (error) {
    console.error('投稿の更新に失敗しました:', error)
  }
}
// 戻るボタンハンドラ
const handleBack = () => {
  if (post.value?.id) {
    router.push(`/posts/${post.value.id}`)
  } else {
    router.push('/posts')
  }
}

// 画像削除ハンドラ
const handleDeleteImage = (index: number) => {
  if (!post.value?.images[index]) return
  imageToDelete.value = {
    id: post.value.images[index].id,
    index
  }
  showDeleteModal.value = true
}

// コンポーネントマウント時にデータを取得
onMounted(fetchPostData)
</script>