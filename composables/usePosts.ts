// composables/usePosts.ts
import { useApi } from '~/composables/useApi';
import type { Post, ApiResponse, PaginatedResponse, PostCreateData, PostUpdateData } from '~/types/api';
import type { NitroFetchRequest, NitroFetchOptions } from 'nitropack';

export const usePosts = () => {
    const { baseURL, defaultOptions } = useApi();

    // 拡張オプションを作成するヘルパー関数
    const createFetchOptions = <T = unknown>(
        options?: Partial<NitroFetchOptions<NitroFetchRequest>>
    ): NitroFetchOptions<NitroFetchRequest> => {
        return {
            ...defaultOptions,
            ...options,
        };
    };

    // 投稿一覧の取得
    const getPosts = async (page: number = 1) => {
        try {
            const response = await $fetch<PaginatedResponse<Post>>(`${baseURL}/posts`,
                createFetchOptions({
                    params: { page }
                })
            );
            return { data: response, error: null };
        } catch (error) {
            return { data: null, error };
        }
    };

    // 投稿詳細の取得
    const getPost = async (id: number) => {
        try {
            const response = await $fetch<ApiResponse<Post>>(
                `${baseURL}/posts/${id}`,
                createFetchOptions()
            );
            return { data: response, error: null };
        } catch (error) {
            return { data: null, error };
        }
    };

    // 新規投稿の作成
    const createPost = async (postData: PostCreateData) => {
        const formData = new FormData();
        Object.entries(postData).forEach(([key, value]) => {
            if (key === 'images' && Array.isArray(value)) {
                value.forEach((image: File) => {
                    formData.append('images[]', image);
                });
            } else {
                formData.append(key, String(value));
            }
        });

        try {
            const response = await $fetch<ApiResponse<Post>>(
                `${baseURL}/posts`,
                createFetchOptions({
                    method: 'POST',
                    body: formData
                })
            );
            return { data: response, error: null };
        } catch (error) {
            return { data: null, error };
        }
    };

    // 投稿の更新
    const updatePost = async (postData: PostUpdateData) => {
        const formData = new FormData();
        formData.append('_method', 'PUT');

        Object.entries(postData).forEach(([key, value]) => {
            if (key === 'images' && Array.isArray(value)) {
                value.forEach((image: File) => {
                    formData.append('images[]', image);
                });
            } else {
                formData.append(key, String(value));
            }
        });

        try {
            const response = await $fetch<ApiResponse<Post>>(
                `${baseURL}/posts/${postData.id}`,
                createFetchOptions({
                    method: 'POST',
                    body: formData
                })
            );
            return { data: response, error: null };
        } catch (error) {
            return { data: null, error };
        }
    };

    // 投稿の削除
    const deletePost = async (id: number) => {
        try {
            const response = await $fetch<ApiResponse<null>>(
                `${baseURL}/posts/${id}`,
                createFetchOptions({
                    method: 'DELETE'
                })
            );
            return { data: response, error: null };
        } catch (error) {
            return { data: null, error };
        }
    };

    // 投稿の検索
    const searchPosts = async (query: string, page: number = 1) => {
        try {
            const response = await $fetch<PaginatedResponse<Post>>(
                `${baseURL}/posts/search`,
                createFetchOptions({
                    params: { q: query, page }
                })
            );
            return { data: response, error: null };
        } catch (error) {
            return { data: null, error };
        }
    };

    // getMyPostsメソッドを追加
    const getMyPosts = async (category?: string) => {
        const token = useCookie('token');

        try {
            const query = category ? `?category=${encodeURIComponent(category)}` : '';
            const response = await $fetch<PaginatedResponse<Post>>(
                `${baseURL}/posts/my-posts${query}`,
                createFetchOptions({
                    headers: {
                        'Authorization': `Bearer ${token.value}`
                    }
                })
            );
            return { data: response, error: null };
        } catch (error) {
            return { data: null, error };
        }
    };

    return {
        getPosts,
        getPost,
        createPost,
        updatePost,
        deletePost,
        searchPosts,
        getMyPosts  // 追加
    };


};