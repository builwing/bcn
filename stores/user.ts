import { defineStore } from 'pinia';
import { useRuntimeConfig } from 'nuxt/app';

// **型定義**
// アプリケーション内で使用されるデータ構造を型で明確化

// ストアの状態
interface State {
    user: User | null; // 現在ログイン中のユーザー情報
    isLogin: boolean;  // ログイン状態を管理
    isLoading: boolean; // ローディング中かどうかのフラグ
}

// ユーザー情報の型
interface User {
    id: number;       // ユーザーID
    name: string;     // ユーザー名
    email: string;    // ユーザーメールアドレス
}

// ログインAPIレスポンスの型
interface LoginResponse {
    user: User;       // ユーザー情報
    token: string;    // 認証トークン
    success: boolean; // 成功フラグ
}

// ユーザー情報取得APIレスポンスの型
interface UserResponse {
    user: User;       // ユーザー情報
    roles: string[];  // ユーザーロール
    permissions: string[]; // ユーザー権限
}

// APIエラーの型
interface ApiError {
    message: string;             // エラーメッセージ
    errors?: Record<string, string[]>; // 詳細なエラー内容（フィールドごと）
}

// **リロード時にログイン状態を判定**
// クッキーに保存された`token`の有無を確認してログイン状態を初期化
const isDefaultLogin = () => {
    const token = useCookie('token', {
        secure: true,     // セキュリティを強化
        sameSite: 'strict', // クロスサイトリクエストを制限
    });
    return !!token.value; // トークンが存在する場合に`true`
}

// **ユーザー管理ストア**
// - ログイン、ログアウト、ユーザー情報取得、投稿作成などを管理
export const useUserStore = defineStore('user', {
    // **状態定義**
    state: (): State => ({
        user: null,              // ユーザー情報を初期化
        isLogin: isDefaultLogin(), // 初期ログイン状態を判定
        isLoading: false         // ローディングフラグ
    }),

    // **アクション定義**
    actions: {
        // **ログイン処理**
        async login(credentials: { email: string; password: string }) {
            const config = useRuntimeConfig(); // 環境設定を取得
            const token = useCookie('token'); // 認証トークンをクッキーに保存
            const router = useRouter();       // Nuxtのルーター

            this.isLoading = true; // ローディング状態を開始

            try {
                // **SanctumでCSRFトークンを取得**
                console.log('[useUserStore] CSRFトークンを取得開始...');
                await $fetch(config.public.sanctumEndpoint, {
                    credentials: 'include', // クッキーを含めてリクエスト
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                });

                // **ログインリクエストを送信**
                const response = await $fetch<LoginResponse>(`${config.public.apiBase}/login`, {
                    method: 'POST',
                    body: credentials,
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-XSRF-TOKEN': useCookie('XSRF-TOKEN').value || '',
                    },
                });

                // **トークンとユーザー情報を保存**
                if (response.token) {
                    token.value = response.token;
                    this.user = response.user;
                    this.isLogin = true;

                    console.log('[useUserStore] ログイン成功');
                    await router.push('/'); // トップページに遷移
                } else {
                    throw new Error('認証に失敗しました');
                }
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

        // **ログアウト処理**
        async logout() {
            const config = useRuntimeConfig();
            const token = useCookie('token');
            const router = useRouter();

            try {
                // サーバー側のログアウトリクエストを送信
                await $fetch(`${config.public.apiBase}/logout`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'Authorization': `Bearer ${token.value}`,
                    },
                });

                // クライアント側の状態をリセット
                this.user = null;
                this.isLogin = false;
                token.value = null;

                // クッキーを手動で削除
                document.cookie = 'XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
                document.cookie = 'beauty_compass_session=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';

                // トップページへ遷移
                await router.push('/');
            } catch (error) {
                console.error('[useUserStore] ログアウトエラー:', error);
                throw error;
            }
        },

        // **認証状態を確認**
        async checkAuth(): Promise<boolean> {
            const config = useRuntimeConfig();
            const token = useCookie('token');

            if (!token.value) {
                this.user = null;
                this.isLogin = false;
                return false;
            }

            try {
                // ユーザー情報を取得
                const response = await $fetch<UserResponse>(`${config.public.apiBase}/user`, {
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'Authorization': `Bearer ${token.value}`,
                    },
                });

                // 認証状態を更新
                this.user = response.user;
                this.isLogin = true;
                return true;
            } catch {
                this.user = null;
                this.isLogin = false;
                token.value = null;
                return false;
            }
        },

        // **投稿を作成**
        async createPost(postData: FormData) {
            const config = useRuntimeConfig();
            const token = useCookie('token');

            try {
                const response = await $fetch(`${config.public.apiBase}/posts`, {
                    method: 'POST',
                    body: postData,
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'Authorization': `Bearer ${token.value}`,
                    },
                });
                console.log('[createPost] 投稿成功:', response);
                return response;
            } catch (error) {
                console.error('[createPost] 投稿エラー:', error);
                throw error;
            }
        },
    },
});
