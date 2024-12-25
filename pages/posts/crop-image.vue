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
            <!-- 画像URLがあればクロッパー表示 -->
            <div v-if="imageUrl" class="bg-white rounded-lg shadow-md p-6">
              <div class="relative" style="min-height: 600px;">
                <!-- vue-advanced-cropper の <Cropper> を使用 -->
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
  
        <!-- エラー表示（画像URLがなく、読み込みも終わっている場合） -->
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
  import 'vue-advanced-cropper/dist/style.css' // ← vue-advanced-cropperの標準CSS
  import { useImageStore } from '~/stores/images'
  
  // ルータ & ストア
  const router = useRouter()
  const route = useRoute()
  const imageStore = useImageStore()
  
  // Refs
  const cropperRef = ref<any>(null)
  const imageUrl = ref<string>('')
  const croppedImage = ref<string>('')
  const currentIndex = ref<number | null>(null)
  const isLoading = ref(true)
  
  // onMountedでクエリパラメータから画像URLを取得
  onMounted(async () => {
    try {
      console.log('クロップページがマウントされました')
  
      const index = parseInt(route.query.index as string)
      console.log('クエリパラメータのインデックス:', index)
  
      if (!Number.isInteger(index)) {
        console.error('クエリのインデックスが不正です')
        await navigateTo('/posts/create')
        return
      }
  
      currentIndex.value = index
      const previewUrl = imageStore.getPreviewUrl(index)
  
      if (!previewUrl) {
        console.error('画像データが見つかりません')
        await navigateTo('/posts/create')
        return
      }
  
      // 画像の読み込みを確実に待つ
      await new Promise<void>((resolve) => {
        const img = new Image()
        img.onload = () => {
          console.log('画像の読み込みが完了')
          resolve()
        }
        img.src = previewUrl
      })
  
      // 画像URLを設定
      imageUrl.value = previewUrl
      console.log('画像URLを設定:', previewUrl.substring(0, 50) + '...')
  
    } catch (error) {
      console.error('エラーが発生しました:', error)
      await navigateTo('/posts/create')
    } finally {
      isLoading.value = false
    }
  })
  
  // 戻る処理
  const goBack = () => {
    router.back()
  }
  
  // 画像の回転
  const rotate = (deg: number) => {
    // vue-advanced-cropper では ref したCropperインスタンスに直接アクセスして rotate()
    const cropper = cropperRef.value
    if (cropper) {
      cropper.rotate(deg)
    }
  }
  
  // クロップ処理
  const handleCrop = async () => {
    const cropper = cropperRef.value
    if (!cropper || currentIndex.value === null) return  
    try {
      // getResult() で編集後のcanvasを取得
      const result = cropper.getResult({
        width: 1000,
        height: 800,
        mimeType: 'image/jpeg',
        quality: 0.9,
      })
  
      // dataURLをプレビュー用に保持
      if (!result?.canvas || currentIndex.value === null) return
      const newDataURL = result.canvas.toDataURL('image/jpeg', 0.9)
      croppedImage.value = newDataURL
  
      // Blob化してstores/images.tsに保存
      result.canvas.toBlob((blob: Blob | null) => {
        if (!blob || currentIndex.value === null) return
  
        const croppedFile = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' })

        imageStore.updatePreviewUrl(currentIndex.value, newDataURL)
        imageStore.updateCroppedImage(currentIndex.value, croppedFile)
  
        // 少し待ってから元の画面へ戻る
        setTimeout(() => {
            router.push('/posts/create')
        }, 1000)
      }, 'image/jpeg', 0.9)
    } catch (error) {
      console.error('クロップ処理に失敗:', error)
    }
  }
  </script>
  