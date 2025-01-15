// composables/useApi.ts
// APIリクエストの共通処理を提供するComposable
import { useRuntimeConfig } from 'nuxt/app';
import type { Post, PaginatedResponse } from '~/types/api';
import type { NitroFetchRequest, NitroFetchOptions } from 'nitropack';

// **FetchOptionsインターフェース**
// - APIリクエスト時に使用するオプションを定義
interface FetchOptions {
    method?: string; // リクエストのHTTPメソッド（例: GET, POST, PUT, DELETE）
    headers?: Record<string, string>; // リクエストヘッダー
    body?: any; // リクエストボディ（データ）
}

interface GetPostsParams {
    page?: number;
}

// **Fetchオプション作成関数**
// - 渡されたオプションに共通の設定を追加して返す
export const createFetchOptions = (options: FetchOptions = {}) => ({
    // `credentials: 'include'`で、クッキーをリクエストに含める
    credentials: 'include',
    headers: {
        'Accept': 'application/json', // レスポンス形式としてJSONを指定
        'Content-Type': 'application/json', // リクエストデータ形式としてJSONを指定
        'X-Requested-With': 'XMLHttpRequest', // Ajaxリクエストであることを示す
        ...options.headers, // 渡されたヘッダーをマージ
    },
    ...options, // 渡されたオプション全体をマージ
});

// **useApi関数**
// - APIリクエストの共通処理を提供するComposable
export const useApi = () => {
    const config = useRuntimeConfig(); // Nuxtのランタイム設定を取得
    const baseURL = config.public.apiBase; // APIのベースURL
    const token = useCookie('token'); // 認証トークンをクッキーから取得

    // **デフォルトのFetchオプション**
    // - APIリクエストに使用する基本設定を定義
    const defaultOptions: NitroFetchOptions<NitroFetchRequest> = {
        baseURL, // APIのベースURLを設定
        credentials: 'include', // クッキーをリクエストに含める
        headers: {
            'Accept': 'application/json', // レスポンス形式としてJSONを指定
            'X-Requested-With': 'XMLHttpRequest', // Ajaxリクエストであることを示す
            ...(token.value ? { 'Authorization': `Bearer ${token.value}` } : {}), // トークンが存在する場合、認証ヘッダーを追加
        },
    };

    // **Composableが返す値**
    return {
        baseURL, // APIのベースURL
        defaultOptions, // デフォルトのFetchオプション
    };
};


export const getPosts = async (params?: GetPostsParams) => {
    const { baseURL, defaultOptions } = useApi();

    try {
        const response = await $fetch<PaginatedResponse<Post>>('/posts', {
            ...defaultOptions,
            params
        });

        return {
            data: response,
            error: null
        };
    } catch (error) {
        return {
            data: null,
            error
        };
    }
};