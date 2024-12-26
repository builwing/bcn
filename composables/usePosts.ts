// composables/usePosts.ts
import { useRuntimeConfig } from 'nuxt/app'

export interface Post {
    id: number;
    title: string;
    category: string;
    content: string;
    rating: number;
    images: any[];
    user_id: number;
    created_at: string;
    updated_at: string;
}

interface ApiResponse<T> {
    data: T;
    message?: string;
}


interface PaginatedResponse<T> {
    data: T[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export const usePosts = () => {
    const config = useRuntimeConfig()

    const getPost = async (id: number) => {
        try {
            const response = await $fetch<{ data: Post }>(`${config.public.apiBase}/posts/${id}`);
            return { data: response, error: null };
        } catch (error) {
            return { data: null, error };
        }
    }

    // usePosts.tsの修正
    const updatePost = async (id: number, formData: FormData) => {
        const token = useCookie('token');

        // FormDataから通常のオブジェクトに変換
        const data: Record<string, any> = {};
        formData.forEach((value, key) => {
            // Fileオブジェクトの場合は特別な処理が必要
            if (value instanceof File) {
                // ファイル送信の場合は別途処理が必要
                console.warn('ファイルのアップロードは別途処理が必要です:', key, value);
                return;
            }
            // 数値として解釈できる場合は数値に変換
            if (!isNaN(Number(value)) && key === 'rating') {
                data[key] = Number(value);
            } else {
                data[key] = value;
            }
        });

        console.log('[usePosts:updatePost]送信データ:', data);

        try {
            const response = await $fetch(`${config.public.apiBase}/posts/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data), // オブジェクトをJSON文字列に変換
                headers: {
                    Authorization: `Bearer ${token.value}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            console.log('[usePosts:updatePost]レスポンス:', response);
            return { data: response, error: null };
        } catch (error: any) {
            console.error('[usePost:updatePost]エラー詳細:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                error
            });
            return { data: null, error };
        }
    }
    // 自分の投稿の取得
    const getMyPosts = async (category?: string) => {
        const token = useCookie('token');

        try {
            const query = category ? `?category=${encodeURIComponent(category)}` : '';
            const response = await $fetch<PaginatedResponse<Post>>(
                `${config.public.apiBase}/posts/my-posts${query}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token.value}`
                    }
                }
            );
            return { data: response, error: null };
        } catch (error) {
            return { data: null, error };
        }
    };


    // 投稿の削除
    const deletePost = async (id: number) => {
        const token = useCookie('token');
        try {
            const response = await $fetch(`${config.public.apiBase}/posts/${id}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Authorization': `Bearer ${token.value}`
                },
            });
            return { data: response, error: null };
        } catch (error) {
            return { data: null, error };
        }
    };

    return {
        getPost,
        updatePost,
        getMyPosts,
        deletePost
    };
};