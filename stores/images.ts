import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// **ImageDataインターフェース**
// - 各画像データの構造を定義
interface ImageData {
    file: File;           // 画像ファイルそのもの
    previewUrl: string;   // プレビュー用の画像URL
}

// **useImageStore**
// - Piniaストアとして画像データを管理するComposable
export const useImageStore = defineStore('images', () => {
    // **画像データを一元管理**
    // - 各画像はインデックス番号（key）を基準に保存
    const images = ref<Record<number, ImageData>>({})

    // **画像が存在するかどうかの判定**
    // - 画像が1つでも登録されていれば`true`を返す
    const hasImages = computed(() => Object.keys(images.value).length > 0)

    // **画像を新規追加**
    // - 指定されたインデックス番号で新しい画像を追加
    function setImage(index: number, file: File, previewUrl: string) {
        console.log('画像を設定:', {
            インデックス: index,
            ファイル名: file.name,
            ファイルサイズ: file.size
        })

        // 画像データを保存
        images.value[index] = {
            file,
            previewUrl
        }
    }

    // **画像を更新（クロップ後など）**
    // - 指定されたインデックス番号の画像を新しいデータに置き換え
    function updateImage(index: number, file: File, previewUrl: string) {
        console.log('画像を更新:', {
            インデックス: index,
            ファイル名: file.name,
            ファイルサイズ: file.size
        })

        if (images.value[index]) {
            // 既存の画像データを更新
            images.value[index] = {
                file,
                previewUrl
            }
        }
    }

    // **プレビューURLを取得**
    // - 指定されたインデックス番号の画像プレビューURLを取得
    function getPreviewUrl(index: number): string | undefined {
        return images.value[index]?.previewUrl
    }

    // **画像を削除**
    // - 指定されたインデックス番号の画像データを削除
    function removeImage(index: number) {
        console.log('画像を削除:', { インデックス: index })
        delete images.value[index]
    }

    // **全ての画像をクリア**
    // - 画像データを完全にリセット
    function clearImages() {
        console.log('全画像をクリア')
        images.value = {}
    }

    // **指定された画像データを取得**
    // - インデックス番号で画像データを取得
    function getImage(index: number): ImageData | undefined {
        return images.value[index]
    }

    // **全ての画像データを取得**
    // - すべての画像データを配列として取得
    function getAllImages(): ImageData[] {
        return Object.values(images.value)
    }

    // **画像インデックスを取得**
    // - 登録された画像のインデックス番号を昇順で取得
    function getImageIndices(): number[] {
        return Object.keys(images.value).map(Number).sort((a, b) => a - b)
    }

    // **ストアとして公開する値**
    return {
        images,          // 画像データ本体
        hasImages,       // 画像が存在するか判定
        setImage,        // 画像を追加
        updateImage,     // 画像を更新
        getPreviewUrl,   // プレビューURLを取得
        removeImage,     // 画像を削除
        clearImages,     // 全画像をクリア
        getImage,        // 指定画像を取得
        getAllImages,    // 全画像を取得
        getImageIndices  // 登録画像のインデックス一覧を取得
    }
}, {
    persist: true // **永続化の設定**
    // - ストアの状態をブラウザに保存（ページリロード時も保持）
})
