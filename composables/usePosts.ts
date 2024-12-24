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

    const updatePost = async (postData: any) => {
        try {
            const response = await $fetch(`${config.public.apiBase}/posts/${postData.id}`, {
                method: 'POST',
                body: postData
            })
            return { data: response, error: null }
        } catch (error) {
            return { data: null, error }
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