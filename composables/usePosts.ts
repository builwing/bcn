// composables/usePosts.ts
// 投稿に関する機能をまとめたComposable

import { useRuntimeConfig, useCookie } from 'nuxt/app'

export interface PostImage {
    url: string; // 画像URL
    filename?: string; // ファイル名（オプション）
}

// 投稿データの型定義
export interface Post {
    id: number;           // 投稿ID
    title: string;        // 投稿タイトル
    category: string;     // カテゴリ（例: 美容整形、化粧品など）
    content: string;      // 投稿内容
    rating: number;       // 評価（1～5）
    // images: any[];        // 画像データ（複数対応）
    images: (string | PostImage)[]; // 修正: 文字列またはオブジェクトの配列
    user_id: number;      // 投稿者のユーザーID
    created_at: string;   // 作成日時
    updated_at: string;   // 更新日時
}

// APIからのレスポンス型の定義（単一データ用）
interface ApiResponse<T> {
    data: T;            // データ本体
    message?: string;   // オプションのメッセージ
}

// APIからのレスポンス型の定義（ページネーション対応）
interface PaginatedResponse<T> {
    data: T[];          // データの配列
    meta: {             // ページネーションに関するメタデータ
        current_page: number;  // 現在のページ番号
        last_page: number;     // 最終ページ番号
        per_page: number;      // 1ページあたりのデータ件数
        total: number;         // 全体のデータ件数
    };
}

// 投稿関連のComposable関数を定義
export const usePosts = () => {
    const config = useRuntimeConfig(); // Nuxtのランタイム設定を取得

    // 特定の投稿を取得
    const getPost = async (id: number) => {
        try {
            // 指定したIDの投稿をAPIから取得
            const response = await $fetch<{ data: Post }>(`${config.public.apiBase}/posts/${id}`);
            return { data: response, error: null }; // 成功時にデータを返却
        } catch (error) {
            return { data: null, error }; // エラー時にはエラー情報を返却
        }
    };

    // 投稿を更新
    const updatePost = async (id: number, formData: FormData) => {
        const token = useCookie('token'); // 認証トークンをクッキーから取得

        // FormDataを通常のオブジェクトに変換
        const data: Record<string, any> = {};
        formData.forEach((value, key) => {
            if (value instanceof File) {
                // ファイルデータはアップロード時に特別な処理が必要
                console.warn('ファイルのアップロードは別途処理が必要です:', key, value);
                return; // ファイルは変換から除外
            }

            // 数値として解釈できる場合は数値に変換
            if (!isNaN(Number(value)) && key === 'rating') {
                data[key] = Number(value); // 評価は数値型に変換
            } else {
                data[key] = value; // その他はそのまま代入
            }
        });

        console.log('[usePosts:updatePost]送信データ:', data);

        try {
            // 投稿更新のAPIリクエストを送信
            const response = await $fetch(`${config.public.apiBase}/posts/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data), // データをJSON形式に変換して送信
                headers: {
                    Authorization: `Bearer ${token.value}`, // 認証ヘッダー
                    'Content-Type': 'application/json', // JSONデータを指定
                    'Accept': 'application/json', // レスポンス形式を指定
                },
            });
            console.log('[usePosts:updatePost]レスポンス:', response);
            return { data: response, error: null }; // 成功時にデータを返却
        } catch (error: any) {
            console.error('[usePosts:updatePost]エラー詳細:', {
                status: error.response?.status, // HTTPステータスコード
                statusText: error.response?.statusText, // ステータステキスト
                data: error.response?.data, // エラーデータ
                error, // その他のエラー情報
            });
            return { data: null, error }; // エラー時にはエラー情報を返却
        }
    };

    // 自分の投稿を取得
    const getMyPosts = async (category?: string) => {
        const token = useCookie('token'); // 認証トークンをクッキーから取得

        try {
            // カテゴリが指定されていればクエリパラメータとして追加
            const query = category ? `?category=${encodeURIComponent(category)}` : '';
            const response = await $fetch<PaginatedResponse<Post>>(
                `${config.public.apiBase}/posts/my-posts${query}`,
                {
                    headers: {
                        Authorization: `Bearer ${token.value}`, // 認証ヘッダー
                    },
                }
            );
            return { data: response, error: null }; // 成功時にデータを返却
        } catch (error) {
            return { data: null, error }; // エラー時にはエラー情報を返却
        }
    };

    // 投稿を削除
    const deletePost = async (id: number) => {
        const token = useCookie('token'); // 認証トークンをクッキーから取得
        try {
            // 指定したIDの投稿を削除するAPIリクエストを送信
            const response = await $fetch(`${config.public.apiBase}/posts/${id}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json', // レスポンス形式を指定
                    'X-Requested-With': 'XMLHttpRequest', // Ajaxリクエストを示すヘッダー
                    Authorization: `Bearer ${token.value}`, // 認証ヘッダー
                },
            });
            return { data: response, error: null }; // 成功時にデータを返却
        } catch (error) {
            return { data: null, error }; // エラー時にはエラー情報を返却
        }
    };

    const deletePostImage = async (imageId: number) => {
        try {
            const response = await $fetch(`${config.public.apiBase}/images/${imageId}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                }
            })
            return { data: response, error: null }
        } catch (error) {
            return { data: null, error }
        }
    }

    // Composable関数を返却
    return {
        getPost,       // 特定の投稿を取得
        updatePost,    // 投稿を更新
        getMyPosts,    // 自分の投稿を取得
        deletePost,    // 投稿を削除
        deletePostImage,
    };
};
