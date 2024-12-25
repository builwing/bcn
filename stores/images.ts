import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface ImageData {
    file: File;
    previewUrl: string;
}

export const useImageStore = defineStore('images', () => {
    // 画像データを一元管理
    const images = ref<Record<number, ImageData>>({})

    // 画像が存在するかどうかの判定
    const hasImages = computed(() => Object.keys(images.value).length > 0)

    // 画像の追加（新規追加時）
    function setImage(index: number, file: File, previewUrl: string) {
        console.log('画像を設定:', {
            インデックス: index,
            ファイル名: file.name,
            ファイルサイズ: file.size
        })

        images.value[index] = {
            file,
            previewUrl
        }
    }

    // 画像の更新（クロップ時）
    function updateImage(index: number, file: File, previewUrl: string) {
        console.log('画像を更新:', {
            インデックス: index,
            ファイル名: file.name,
            ファイルサイズ: file.size
        })

        if (images.value[index]) {
            images.value[index] = {
                file,
                previewUrl
            }
        }
    }

    // プレビューURLの取得
    function getPreviewUrl(index: number): string | undefined {
        return images.value[index]?.previewUrl
    }

    // 画像の削除
    function removeImage(index: number) {
        console.log('画像を削除:', { インデックス: index })
        delete images.value[index]
    }

    // 全画像のクリア
    function clearImages() {
        console.log('全画像をクリア')
        images.value = {}
    }

    // 画像の取得
    function getImage(index: number): ImageData | undefined {
        return images.value[index]
    }

    // 全画像の取得
    function getAllImages(): ImageData[] {
        return Object.values(images.value)
    }

    // インデックスの取得
    function getImageIndices(): number[] {
        return Object.keys(images.value).map(Number).sort((a, b) => a - b)
    }

    return {
        images,
        hasImages,
        setImage,
        updateImage,
        getPreviewUrl,
        removeImage,
        clearImages,
        getImage,
        getAllImages,
        getImageIndices
    }
}, {
    persist: true
})