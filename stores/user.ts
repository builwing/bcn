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
                maxAge: 60 * 60 * 24 * 365,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                domain: process.env.NODE_ENV === 'production' ? '.winroad.biz' : 'localhost'
            });

            this.isLoading = true;
            console.log('[useUserStore] ログイン処理開始...');

            try {
                // 1. XSRF-TOKEN の取得
                const csrfToken = useCookie('XSRF-TOKEN', {
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    path: '/',
                    domain: process.env.NODE_ENV === 'production' ? '.winroad.biz' : 'localhost'
                });

                if (!csrfToken.value) {
                    await $fetch(config.public.sanctumEndpoint, {
                        method: 'GET',
                        credentials: 'include',
                        headers: {
                            'Accept': 'application/json',
                            'X-Requested-With': 'XMLHttpRequest',
                        }
                    });
                }

                // 2. ログインリクエスト
                const response = await $fetch<LoginResponse>(`${config.public.apiBase}/login`, {
                    method: 'POST',
                    body: credentials,
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        ...(token.value && { 'Authorization': `Bearer ${token.value}` })
                    }
                });

                // 3. レスポンスの処理
                if (response.token) {
                    token.value = response.token;
                    this.user = response.user;
                    this.isLogin = true;
                    return { success: true, user: response.user };
                }

                throw new Error('認証トークンが返されませんでした');

            } catch (error: any) {
                console.error('[useUserStore] ログインエラー:', error);
                this.user = null;
                this.isLogin = false;
                token.value = null;

                // エラーメッセージの詳細化
                const errorMessage = error.response?.data?.message || error.message || '認証に失敗しました';
                throw new Error(errorMessage);
            } finally {
                this.isLoading = false;
            }
        },

        async logout() {
            const config = useRuntimeConfig();
            const router = useRouter();

            const cookieOptions = {
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax' as const,
                path: '/',
                domain: process.env.NODE_ENV === 'production' ? '.winroad.biz' : 'localhost'
            };

            try {
                const token = useCookie('token', cookieOptions);

                // CSRFトークンを取得
                await $fetch(config.public.sanctumEndpoint, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });

                // ログアウトリクエスト
                await $fetch(`${config.public.apiBase}/logout`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        ...(token.value && { 'Authorization': `Bearer ${token.value}` })
                    }
                });

                // クライアント側の状態をクリア
                this.user = null;
                this.isLogin = false;

                // クッキーを削除
                const cookies = [token,
                    useCookie('XSRF-TOKEN', cookieOptions),
                    useCookie('laravel_session', cookieOptions)
                ];

                cookies.forEach(cookie => cookie.value = null);

                if (process.client) {
                    localStorage.clear();
                    sessionStorage.clear();
                }

                await router.push('/');
                return { success: true };

            } catch (error: any) {
                console.error('[useUserStore] ログアウトエラー:', error);
                throw new Error(error.response?.data?.message || error.message || 'ログアウトに失敗しました');
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