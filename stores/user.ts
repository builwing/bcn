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
            const router = useRouter();

            try {
                // クライアント側の状態をクリア
                this.user = null;
                this.isLogin = false;
                token.value = null;

                // 全てのクッキーを削除
                const cookies = document.cookie.split(';');
                for (let cookie of cookies) {
                    const eqPos = cookie.indexOf('=');
                    const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
                    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
                }

                // トップページへ遷移
                await router.push('/');

                // バックグラウンドでサーバー側のログアウト処理を実行
                await $fetch(`${config.public.apiBase}/logout`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'Authorization': `Bearer ${token.value}`  // トークンを Authorization ヘッダーに追加
                    }
                }).catch(error => {
                    console.error('バックグラウンドログアウトエラー:', error);
                });

            } catch (error) {
                console.error('[useUserStore] ログアウトエラー:', error);
                throw error;
            }
        },

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