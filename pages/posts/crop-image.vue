<template>
  <div class="bg-gray-100 min-h-screen py-8">
    <div class="max-w-4xl mx-auto px-4">
      <!-- ヘッダー -->
      <div class="mb-8">
        <button @click="goBack" class="btn-primary inline-block mb-4">
          ← 戻る
        </button>
        <h1 class="text-3xl font-bold text-gray-800">画像のトリミング</h1>
      </div>

      <!-- クロッパーコンテナ -->
      <ClientOnly>
        <template #default>
          <div v-if="imageUrl" class="bg-white rounded-lg shadow-md p-6">
            <div class="relative" style="min-height: 600px;">
              <Cropper
                ref="cropperRef"
                :src="imageUrl"
                class="w-full h-[600px]"
                :stencil-props="{ aspectRatio: 1.25 }"
              />
            </div>

            <!-- コントロールボタン -->
            <div class="mt-6 flex justify-center space-x-4">
              <button
                @click="rotate(-90)"
                class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
              >
                左に回転
              </button>
              <button
                @click="rotate(90)"
                class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
              >
                右に回転
              </button>
              <button
                @click="handleCrop"
                class="px-6 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 transition"
              >
                トリミングを確定
              </button>
            </div>

            <!-- プレビュー -->
            <div v-if="croppedImage" class="mt-6">
              <h3 class="text-lg font-semibold mb-2">プレビュー</h3>
              <div class="relative w-full max-w-md mx-auto">
                <img
                  :src="croppedImage"
                  alt="クロップ後のプレビュー"
                  class="w-full h-auto rounded-lg shadow"
                />
              </div>
            </div>

            <!-- 本文入力エリア -->
            <div class="mt-8">
              <h3 class="text-lg font-semibold mb-2">本文</h3>
              <div class="space-y-4">
                <textarea
                  v-model="content"
                  rows="4"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="本文を入力してください..."
                ></textarea>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-500">
                    {{ content.length }}/1000文字
                  </span>
                  <div class="space-x-4">
                    <button
                      @click="handleSave"
                      class="px-6 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 transition"
                      :disabled="!content.trim()"
                    >
                      保存
                    </button>
                    <NuxtLink
                      to="/posts/create"
                      class="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition inline-block"
                    >
                      新規作成
                    </NuxtLink>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
        <template #fallback>
          <div class="text-center py-8">
            <p class="text-gray-600">画像を読み込んでいます...</p>
          </div>
        </template>
      </ClientOnly>

      <!-- エラー表示 -->
      <div v-if="!imageUrl && !isLoading" class="text-center text-red-500">
        画像の読み込みに失敗しました
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Cropper } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'
import { useImageStore } from '@/stores/images'
import { usePostContentStore } from '@/stores/postContent'

// ストアの設定を追加
const postContentStore = usePostContentStore()

// インターフェースの定義
interface CropperRef {
  rotate: (angle: number) => void;
  getResult: (options: {
    width?: number;
    height?: number;
    mimeType?: string;
    quality?: number;
  }) => {
    canvas: HTMLCanvasElement | null;
  };
}

// 戻るボタンの処理
const goBack = () => {
  router.push('/posts/create')
}

// 回転処理
const rotate = (deg: number) => {
  if (cropperRef.value) {
    cropperRef.value.rotate(deg)
  }
}

// ストアとルーターの設定
const router = useRouter()
const route = useRoute()
const imageStore = useImageStore()

// ref変数の定義
const cropperRef = ref<CropperRef | null>(null)
const imageUrl = ref<string>('')
const croppedImage = ref<string>('')
const currentIndex = ref<number | null>(null)
const isLoading = ref(true)
const content = ref('')

// クロップ処理
const handleCrop = async (): Promise<void> => {
  if (!cropperRef.value || currentIndex.value === null) {
    console.error('クロッパーまたはインデックスが未定義です')
    return
  }

  try {
    const result = cropperRef.value.getResult({
      width: 1000,
      height: 800,
      mimeType: 'image/jpeg',
      quality: 0.9,
    })

    if (!result || !result.canvas) {
      console.error('キャンバスの取得に失敗しました')
      return
    }

    const canvas = result.canvas
    croppedImage.value = canvas.toDataURL('image/jpeg', 0.9)

    try {
      await new Promise<void>((resolve, reject) => {
        canvas.toBlob((blob: Blob | null) => {
          if (!blob) {
            reject(new Error('Blobの生成に失敗しました'))
            return
          }

          if (currentIndex.value === null) {
            reject(new Error('インデックスが無効です'))
            return
          }

          try {
            const croppedFile = new File([blob], `image-${currentIndex.value}.jpg`, {
              type: 'image/jpeg',
              lastModified: Date.now()
            })

            // 既存の画像を上書き
            imageStore.updateImage(currentIndex.value, croppedFile, croppedImage.value)
            console.log('画像を更新しました:', {
              index: currentIndex.value,
              fileName: croppedFile.name,
              fileSize: croppedFile.size
            })

            resolve()
          } catch (error) {
            reject(new Error('ファイルの作成に失敗しました: ' + error))
          }
        }, 'image/jpeg', 0.9)
      })
    } catch (error) {
      console.error('Blob処理エラー:', error)
      throw error
    }
  } catch (error) {
    console.error('クロップ処理エラー:', error)
  }
}

// 保存処理
const handleSave = async () => {
  try {
    if (currentIndex.value === null) {
      throw new Error('画像インデックスが無効です');
    }
    
    // コンテンツを保存
    postContentStore.setContent(currentIndex.value, content.value);
    
    console.log('保存する内容:', {
      imageIndex: currentIndex.value,
      content: content.value,
      imageUrl: croppedImage.value
    });
    
    // 保存成功時の処理
    alert('保存しました');
    // create ページへ移動
    router.push('/posts/create');
  } catch (error) {
    console.error('保存エラー:', error);
    alert('保存に失敗しました');
  }
}

// コンポーネントのマウント時の処理
onMounted(async () => {
  try {
    console.log('クロップページがマウントされました')

    const indexStr = route.query.index
    if (!indexStr || typeof indexStr !== 'string') {
      throw new Error('インデックスが指定されていません')
    }

    const index = parseInt(indexStr)
    console.log('クエリパラメータのインデックス:', index)

    if (!Number.isInteger(index)) {
      throw new Error('インデックスが不正です')
    }

    currentIndex.value = index
    const previewUrl = imageStore.getPreviewUrl(index)

    if (!previewUrl) {
      throw new Error('画像データが見つかりません')
    }

    // 画像の読み込みを待機
    await new Promise<void>((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        console.log('画像の読み込みが完了しました')
        resolve()
      }
      img.onerror = () => {
        reject(new Error('画像の読み込みに失敗しました'))
      }
      img.src = previewUrl
    })

    imageUrl.value = previewUrl
    console.log('画像URLを設定しました')

  } catch (error) {
    console.error('エラーが発生しました:', error)
    await router.push('/posts/create')
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.btn-primary {
  @apply px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors;
}
</style>