import { defineStore } from 'pinia';

// 型定義の拡張
interface State {
    user: User | null;
    isLogin: boolean;
    isLoading: boolean;
}

interface User {
    id: number;
    name: string;
    email: string;
}

interface LoginResponse {
    user: User;
    token: string;
    success: boolean;
}

// API レスポンスの型定義を追加
interface UserResponse {
    user: User;
    roles: string[];
    permissions: string[];
}

// ユーザー情報取得用のエラー型定義
interface ApiError {
    message: string;
    errors?: Record<string, string[]>;
}

/**
 * リロード時のログイン状態判定
 */
const isDefaultLogin = () => {
    const token = useCookie('token', {
        secure: true,
        sameSite: 'strict',
    })
    return !!token.value
}

export const useUserStore = defineStore('user', {
    state: (): State => ({
        user: null,
        isLogin: isDefaultLogin(),
        isLoading: false
    }),

    actions: {
        // ... 他のアクション

        async checkAuth(): Promise<boolean> {
            console.log('checkAuthを開始します');
            const token = useCookie('token');

            if (!token.value) {
                console.log('[userstore:checkAuth] トークンがありません');
                this.user = null;
                this.isLogin = false;
                return false;
            }

            console.log('[checkAuth] トークンを確認:', token.value);
            const config = useRuntimeConfig();

            try {
                // ユーザー情報を取得（型アサーションを修正）
                const response = await $fetch<UserResponse>(`${config.public.apiBase}/user`, {
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'Authorization': `Bearer ${token.value}`
                    }
                });

                console.log('[checkAuth] ユーザー情報取得成功:', response);

                if (response?.user) {
                    this.user = response.user;
                    this.isLogin = true;
                    return true;
                }

                throw new Error('ユーザー情報の取得に失敗しました');

            } catch (error) {
                console.error('[checkAuth] エラー:', error);
                const apiError = error as ApiError;
                this.user = null;
                this.isLogin = false;
                token.value = null;
                throw new Error(apiError.message || 'ユーザー情報の取得に失敗しました');
            }
        },

        async createPost(postData: FormData) {
            // 戻り値の型定義を追加
            interface PostResponse {
                message: string;
                post: {
                    id: number;
                    title: string;
                    content: string;
                    // 他の必要なフィールドを追加
                };
            }

            const config = useRuntimeConfig();
            const token = useCookie('token');

            console.log('[createPost] トークン:', token.value);
            console.log('[createPost] FormDataの中身:');
            for (const [key, value] of postData.entries()) {
                console.log(`${key}:`, value);
            }

            if (!token.value) {
                throw new Error('認証トークンがありません');
            }

            try {
                const response = await $fetch<PostResponse>(`${config.public.apiBase}/posts`, {
                    method: 'POST',
                    body: postData,
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'Authorization': `Bearer ${token.value}`
                    }
                });

                console.log('[createPost] 投稿成功:', response);
                return response;
            } catch (error) {
                console.error('[createPost] 投稿エラー:', error);
                const apiError = error as ApiError;
                throw new Error(apiError.message || '投稿の作成に失敗しました');
            }
        }
    }
});