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
            const config = useRuntimeConfig(); // 環境設定を取得
            const token = useCookie('token'); // トークンをクッキーに保存
            const router = useRouter(); // Nuxtのルーター
            this.isLoading = true;

            console.log('[useUserStore] ログイン処理開始...');

            console.log('[user.login]Sanctumエンドポイント', config.public.sanctumEndpoint);
            console.log('[user.login]ログイン前のトークン', token.value);

            try {
                // **2. クッキー設定の定義**
                const cookieOptions: any = {
                    maxAge: 60 * 60 * 24, // 1日
                    secure: process.env.NODE_ENV === 'production', // 本番環境ではSecureを有効
                    sameSite: 'lax', // CSRF対策
                    path: '/', // クッキーをルートパスで使用
                };

                if (process.env.NODE_ENV === 'production') {
                    cookieOptions.domain = '.winroad.biz'; // 本番環境ではドメインを設定
                } else {
                    cookieOptions.domain = 'localhost';
                }

                // **1. SanctumでCSRFトークンを取得**
                console.log('[useUserStore] CSRFトークンを取得開始...');
                await $fetch(config.public.sanctumEndpoint, {
                    credentials: 'include', // クッキーを含めてリクエスト
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest', // Laravelが要求するヘッダー
                    },
                });
                console.log('[user.login]取得したXSRF-TOKEN', useCookie('XSRF-TOKEN').value);// 取得したCSRFトークン

                // **3. ログインリクエスト**
                console.log('[useUserStore] ログインリクエストを送信...');
                const xsrfToken = useCookie('XSRF-TOKEN');
                console.log('[user.login]取得したXSRF-TOKEN', xsrfToken);
                if (!xsrfToken) {
                    throw new Error('XSRFトークンが取得できませんでした');
                }

                const response = await $fetch<LoginResponse>(`${config.public.apiBase}/login`, {
                    method: 'POST',
                    body: credentials, // メールアドレスとパスワード
                    credentials: 'include', // クッキーを含める
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-XSRF-TOKEN': xsrfToken.value || '', // .valueを使用して文字列を取得
                    },
                });

                console.log('[login:response] 取得したレスポンスのトークン:', response.token);

                // **4. トークンとユーザーデータを保存**
                if (response.token) {
                    console.log('保存前のトークン:', token.value);
                    token.value = response.token; // クッキーにトークンを保存
                    console.log('保存後のトークン:', token.value);

                    this.user = response.user; // ユーザー情報を保存
                    this.isLogin = true; // ログイン状態を更新

                    console.log('[useUserStore] ログイン成功');
                    await router.push('/'); // トップページにリダイレクト
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
                this.isLoading = false; // ローディング状態を解除
            }
        },

        async logout() {
            const config = useRuntimeConfig();
            const token = useCookie('token');
            const router = useRouter();

            try {
                // **1. サーバー側のログアウト処理**
                const headers: HeadersInit = {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Authorization': `Bearer ${token.value}`,
                };

                // XSRF-TOKENが存在する場合のみ追加
                const xsrfToken = useCookie('XSRF-TOKEN').value;
                if (xsrfToken) {
                    headers['X-XSRF-TOKEN'] = xsrfToken;
                }

                await $fetch(`${config.public.apiBase}/logout`, {
                    method: 'POST',
                    credentials: 'include',
                    headers,
                });

                // **2. クライアント側の状態をクリア**
                this.user = null;
                this.isLogin = false;
                token.value = null;

                // 手動で不要なクッキーを削除
                document.cookie = 'XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
                document.cookie = 'beauty_compass_session=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';

                // **4. トップページへ遷移**
                await router.push('/');
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