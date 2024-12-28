export interface Post {
    id: number;                           // 投稿ID
    title: string;                        // タイトル
    category: string;                     // カテゴリ
    content: string;                      // 投稿内容
    rating: number;                       // 評価
    images: (string | { url: string; filename?: string })[]; // 画像データ（柔軟な形式を許容）
    user_id: number;                      // 投稿者ID
    created_at: string;                   // 作成日時
    updated_at: string;                   // 更新日時
}

export interface PostImage {
    id: number
    url: string
    filename: string
    post_id: number
}

export interface FormState {
    title: string
    category: string
    rating: number
    content: string
    images: File[]
}

export interface FormErrors {
    title?: string
    category?: string
    rating?: string
    content?: string
    images?: string
}

export interface APIResponse<T = any> {
    data?: T
    error?: Error
}