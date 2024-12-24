import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface ImageState {
    originalImages: Record<number, File>;
    previewUrls: Record<number, string>;
    croppedImages: Record<number, File>;
}
/**
 * Composition API スタイルでの Pinia ストア定義
 */
export const useImageStore = defineStore('images', () => {
    // 画像の各状態を保持する Ref
    const croppedImages = ref<Record<number, File | null>>({})
    const originalImages = ref<Record<number, File>>({})
    const previewUrls = ref<Record<number, string>>({})

    // 画像が1枚以上アップロードされているかを判定
    const hasImages = computed(() => Object.keys(previewUrls.value).length > 0)

    /**
     * トリミング後の画像を更新
     * @param index - 画像のインデックス
     * @param file  - トリミング後の File または null
     */
    function updateCroppedImage(index: number, file: File | null) {
        croppedImages.value[index] = file
    }

    /**
     * オリジナル画像＆プレビューURLを登録
     * @param index       - 画像のインデックス
     * @param file        - オリジナルの File
     * @param previewUrl  - DataURL 等のプレビューURL
     */
    function setOriginalImage(index: number, file: File, previewUrl: string) {
        console.log('オリジナル画像を設定:', {
            インデックス: index,
            ファイルタイプ: file.type,
            ファイルサイズ: file.size,
            プレビューURLの長さ: previewUrl.length
        })
        originalImages.value[index] = file
        previewUrls.value[index] = previewUrl
    }

    /**
     * 指定インデックスの画像を削除
     * @param index - 画像のインデックス
     */
    function removeImage(index: number) {
        delete croppedImages.value[index]
        delete originalImages.value[index]
        delete previewUrls.value[index]
    }

    /**
     * すべての画像をクリア
     */
    function clearImages() {
        croppedImages.value = {}
        originalImages.value = {}
        previewUrls.value = {}
    }

    /**
     * プレビューURLを取得
     * @param index - 画像のインデックス
     * @returns プレビューURL（存在しない場合 undefined）
     */
    function getPreviewUrl(index: number): string | undefined {
        const url = previewUrls.value[index]
        console.log('プレビューURLを取得:', {
            インデックス: index,
            URLの有無: !!url,
            URLの長さ: url?.length
        })
        return url
    }

    /**
   * すでに存在するpreviewUrls[index]を新しいURLで上書きする
   */
    function updatePreviewUrl(index: number, newUrl: string) {
        previewUrls.value[index] = newUrl
        console.log('プレビューURLを置き換えました:', {
            インデックス: index,
            新しいURLの長さ: newUrl.length
        })
    }

    return {
        // state 相当
        croppedImages,
        originalImages,
        previewUrls,
        updatePreviewUrl,
        // computed 相当
        hasImages,

        // actions 相当
        updateCroppedImage,
        setOriginalImage,
        removeImage,
        clearImages,
        getPreviewUrl
    }
}, {
    // Pinia Persisted State を利用する場合のオプション
    persist: true
})
