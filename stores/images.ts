import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useImageStore = defineStore('images', () => {
    const croppedImages = ref<Record<number, File>>({})
    const originalImages = ref<Record<number, File>>({})
    const previewUrls = ref<Record<number, string>>({})

    const hasImages = computed(() => Object.keys(previewUrls.value).length > 0)

    function updateCroppedImage(index: number, file: File) {
        console.log('クロップ画像を更新:', { index, file })
        croppedImages.value = {
            ...croppedImages.value,
            [index]: file
        }
    }

    function setOriginalImage(index: number, file: File, previewUrl: string) {
        console.log('オリジナル画像を設定:', { index, file })
        originalImages.value = {
            ...originalImages.value,
            [index]: file
        }
        previewUrls.value = {
            ...previewUrls.value,
            [index]: previewUrl
        }
    }

    function updatePreviewUrl(index: number, newUrl: string) {
        console.log('プレビューURLを更新:', { index })
        previewUrls.value = {
            ...previewUrls.value,
            [index]: newUrl
        }
    }

    function getPreviewUrl(index: number) {
        return previewUrls.value[index]
    }

    function removeImage(index: number) {
        const { [index]: _, ...restCroppedImages } = croppedImages.value
        const { [index]: __, ...restOriginalImages } = originalImages.value
        const { [index]: ___, ...restPreviewUrls } = previewUrls.value

        croppedImages.value = restCroppedImages
        originalImages.value = restOriginalImages
        previewUrls.value = restPreviewUrls
    }

    // clearImagesは投稿成功時のみ使用
    function clearImages() {
        croppedImages.value = {}
        originalImages.value = {}
        previewUrls.value = {}
    }

    return {
        croppedImages,
        originalImages,
        previewUrls,
        hasImages,
        updateCroppedImage,
        setOriginalImage,
        removeImage,
        clearImages,
        getPreviewUrl,
        updatePreviewUrl
    }
}, {
    persist: true
})