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

      <!-- フォーム表示 -->
      <div v-else-if="post">
        <PostForm
          :post="post"
          @submit="handleSubmit"
          @cancel="handleBack"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { usePosts, type Post } from '~/composables/usePosts'

// コンポーネントのインポート
import BackButton from '~/components/posts/BackButton.vue';
import PostForm from '@/components/posts/PostForm.vue';


const router = useRouter()
const route = useRoute()
const { getPost, updatePost } = usePosts()
const isDev = process.env.NODE_ENV === 'development';


const post = ref<Post | null>(null)
const isLoading = ref(true)
const loadError = ref<string | null>(null)

// 投稿データの取得
const fetchPostData = async () => {
  isLoading.value = true
  loadError.value = null

  try {
    const { data, error } = await getPost(Number(route.params.id))
    if (error) throw error
    if (!data) throw new Error('投稿データが見つかりません')
    
    post.value = data.data
  } catch (error) {
    console.error('投稿データの取得に失敗:', error)
    loadError.value = '投稿データの取得に失敗しました'
  } finally {
    isLoading.value = false
  }
}

// フォーム送信ハンドラ
const handleSubmit = async (formData: FormData) => {
  if (!post.value?.id) return

  try {
    const { error } = await updatePost(post.value.id, formData)
    if (error) throw error
    
    await router.push(`/posts/${post.value.id}`)
  } catch (error) {
    console.error('投稿の更新に失敗しました:', error)
    // エラー処理をここに追加
  }
}

// 戻るボタンハンドラ
const handleBack = () => {
  // post.valueが存在する場合は投稿詳細ページへ、存在しない場合は投稿一覧へ
  if (post.value?.id) {
    router.push(`/posts/${post.value.id}`)
  } else {
    router.push('/posts')
  }
}

// コンポーネントマウント時にデータを取得
onMounted(fetchPostData)
</script>