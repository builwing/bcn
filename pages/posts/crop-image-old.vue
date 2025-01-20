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
  import { useImageStore } from '~/stores/images'
  
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
  
  interface CropperResult {
    canvas: HTMLCanvasElement | null;
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
  
  // 画像回転処理
  const rotate = (deg: number): void => {
    if (cropperRef.value) {
      cropperRef.value.rotate(deg)
    }
  }
  
  // 戻るボタンの処理
  const goBack = async (): Promise<void> => {
    await router.push('/posts/create')
  }
  
  // クロップ処理
  const handleCrop = async (): Promise<void> => {
    if (!cropperRef.value || currentIndex.value === null) {
      console.error('クロッパーまたはインデックスが未定義です')
      return
    }
  
    try {
      const result: CropperResult = cropperRef.value.getResult({
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
          canvas.toBlob((blob) => {
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
  
        await router.push('/posts/create')
      } catch (error) {
        console.error('Blob処理エラー:', error)
        throw error
      }
    } catch (error) {
      console.error('クロップ処理エラー:', error)
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