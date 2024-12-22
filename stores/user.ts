import { defineStore } from 'pinia';

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
        async login(credentials: { email: string; password: string }) {
            const config = useRuntimeConfig();
            const token = useCookie('token', {
                maxAge: 60 * 60 * 24,
                secure: false, // localhost用に設定変更
                sameSite: 'lax',
                path: '/',
                domain: 'localhost'
            });

            this.isLoading = true;
            console.log('[useUserStore] ログイン処理開始...');

            try {
                // CSRFトークンの取得
                await $fetch(config.public.sanctumEndpoint, {
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });

                // ログインリクエスト
                const response = await $fetch<LoginResponse>(`${config.public.apiBase}/login`, {
                    method: 'POST',
                    body: credentials,
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'Authorization': `Bearer ${token.value}`  // トークンを Authorization ヘッダーに追加
                    }
                });

                console.log('[useUserStore] ログイン成功:', response);

                if (response.token) {
                    token.value = response.token;
                    this.user = response.user;
                    this.isLogin = true;
                    return { success: true };
                }

                throw new Error('認証に失敗しました');
            } catch (error) {
                console.error('[useUserStore] ログインエラー:', error);
                this.user = null;
                this.isLogin = false;
                token.value = null;
                throw error;
            } finally {
                this.isLoading = false;
            }
        },

        async logout() {
            const config = useRuntimeConfig();
            const token = useCookie('token');

            try {
                await $fetch(`${config.public.apiBase}/logout`, {
                    method: 'POST',
                    credentials: 'include'
                });
            } finally {
                this.user = null;
                this.isLogin = false;
                token.value = null;
            }
        },

        async checkAuth() {
            console.log('checkAuthを開始します');
            const token = useCookie('token');

            if (!token.value) {
                console.log('[checkAuth] トークンがありません');
                this.user = null;
                this.isLogin = false;
                return false;
            }

            console.log('[checkAuth] トークンを確認:', token.value);
            const config = useRuntimeConfig();

            try {
                // ユーザー情報を取得
                const response = await $fetch(`${config.public.apiBase}/user`, {
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'Authorization': `Bearer ${token.value}`  // トークンを Authorization ヘッダーに追加
                    }
                }) as { user: User };

                console.log('[checkAuth] ユーザー情報取得成功:', response);

                if (response.user) {
                    this.user = response.user;
                    this.isLogin = true;
                    return true;
                }

                // ユーザー情報が取得できない場合は認証失敗とみなす
                throw new Error('ユーザー情報の取得に失敗しました');

            } catch (error) {
                console.error('[checkAuth] エラー:', error);
                this.user = null;
                this.isLogin = false;
                token.value = null;  // トークンが無効な場合は削除
                return false;
            }
        },

        /**
         * 投稿作成メソッド
         */
        async createPost(postData: FormData) {
            const config = useRuntimeConfig();
            const token = useCookie('token'); // トークン取得

            console.log('[createPost] トークン:', token.value);
            console.log('[createPost] FormDataの中身:');
            for (const [key, value] of postData.entries()) {
                console.log(`${key}:`, value);
            }

            if (!token.value) {
                throw new Error('認証トークンがありません');
            }

            try {
                const response = await $fetch(`${config.public.apiBase}/posts`, {
                    method: 'POST',
                    body: postData,
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        // 'Content-Type': 'multipart/form-data',
                        'X-Requested-With': 'XMLHttpRequest',
                        'Authorization': `Bearer ${token.value}`  // トークンを Authorization ヘッダーに追加
                    },
                });

                console.log('[createPost] 投稿成功:', response);
                return response; // 必要に応じてレスポンスを返す
            } catch (error) {
                console.error('[createPost] 投稿エラー:', error);
                throw error; // 呼び出し元でエラー処理
            }
        }
    }
});