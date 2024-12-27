<!-- components/posts/PostForm.vue -->
<template>
  <form @submit.prevent="onSubmit" class="space-y-6">
    <!-- タイトル -->
    <div>
      <label for="title" class="block text-sm font-medium text-gray-700">タイトル*</label>
      <input
        id="title"
        v-model="formData.title"
        type="text"
        required
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
      />
    </div>

    <!-- カテゴリー -->
    <div>
      <label for="category" class="block text-sm font-medium text-gray-700">カテゴリー*</label>
      <select
        id="category"
        v-model="formData.category"
        required
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
      >
        <option value="">カテゴリーを選択</option>
        <option value="cosmetics">化粧品</option>
        <option value="surgery">美容整形</option>
        <option value="equipment">美容機器</option>
        <option value="etc">その他</option>
      </select>
    </div>

    <!-- 評価 -->
    <div>
      <label class="block text-sm font-medium text-gray-700">評価*</label>
      <div class="mt-1 flex items-center space-x-2">
        <button
          v-for="ratingValue in 5"
          :key="ratingValue"
          type="button"
          @click="formData.rating = ratingValue"
          class="focus:outline-none"
        >
          <span :class="ratingValue <= formData.rating ? 'text-yellow-400' : 'text-gray-300'">
            ★
          </span>
        </button>
      </div>
    </div>

    <!-- 本文 -->
    <div>
      <label for="content" class="block text-sm font-medium text-gray-700">本文*</label>
      <textarea
        id="content"
        v-model="formData.content"
        rows="6"
        required
        class="block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
      />
    </div>

    <!-- 新規画像アップロード -->
    <div>
      <label class="block text-sm font-medium text-gray-700">新規画像（最大10枚）</label>
      <div class="mt-1 flex items-center space-x-4">
        <label 
          class="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md 
                 shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 
                 cursor-pointer"
        >
          <span>画像を追加</span>
          <input
            type="file"
            class="hidden"
            accept="image/*"
            multiple
            @change="handleImageChange"
          />
        </label>
      </div>

      <!-- プレビュー表示 -->
      <div
        v-if="formData.images.length"
        class="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <div
          v-for="(image, index) in formData.images"
          :key="index"
          class="relative"
        >
          <img
            :src="image"
            alt="プレビュー"
            class="h-24 w-24 object-cover rounded-md"
          />
          <button
            type="button"
            @click="removeImage(index)"
            class="absolute -top-2 -right-2 bg-red-500 text-white 
                   rounded-full p-1 hover:bg-red-600"
          >
            ×
          </button>
        </div>
      </div>
    </div>

    <!-- ボタン群 -->
    <div class="flex justify-end space-x-4">
      <button
        type="button"
        @click="$emit('cancel')"
        class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium 
               text-gray-700 bg-white hover:bg-gray-50"
      >
        キャンセル
      </button>
      <button
        type="submit"
        :disabled="isSubmitting"
        class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium 
               text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 
               focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50"
      >
        {{ isSubmitting ? '更新中...' : '更新する' }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { PostImage } from '~/types/post'

// 親からもらうデータ構造の型
interface FormDataType {
  title: string
  category: string
  rating: number
  content: string
  images: string[] // base64文字列（Fileではなくstring[]想定）
}

interface Props {
  // 親コンポーネントから渡される初期値
  initialData?: Partial<FormDataType>
  // 既存画像（DB上にあるURL）をプレビュー表示したければ受け取る
  existingImages?: PostImage[]
}

interface Emits {
  (e: 'submit', data: FormDataType): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  initialData: () => ({})
})
const emit = defineEmits<Emits>()

const formData = ref<FormDataType>({
  title: props.initialData?.title || '',
  category: props.initialData?.category || '',
  rating: props.initialData?.rating || 0,
  content: props.initialData?.content || '',
  images: props.initialData?.images || []
})

const isSubmitting = ref(false)

/**
 * 画像をbase64としてフォームに追加する
 */
function handleImageChange(e: Event) {
  const input = e.target as HTMLInputElement
  if (!input.files) return

  const files = Array.from(input.files)
  // 10枚以上はNG
  if (formData.value.images.length + files.length > 10) {
    alert('画像は最大10枚までアップロードできます')
    return
  }

  files.forEach(file => {
    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        // base64を配列にpush
        formData.value.images.push(event.target.result as string)
      }
    }
    reader.readAsDataURL(file)
  })
}

/**
 * 画像削除
 */
function removeImage(index: number) {
  formData.value.images.splice(index, 1)
}

/**
 * フォーム送信
 */
async function onSubmit() {
  isSubmitting.value = true
  try {
    // 親へフォーム結果を渡す
    emit('submit', formData.value)
  } finally {
    isSubmitting.value = false
  }
}
</script>
