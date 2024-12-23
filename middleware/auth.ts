import { useUserStore } from '~/stores/user';

export default defineNuxtRouteMiddleware(async (to) => {
    const userStore = useUserStore();

    // パブリックページのリスト（認証不要のページ）
    const publicPages = ['/', '/login', '/register', '/about', '/contact'];
    const isPublicPage = publicPages.includes(to.path);

    // トークンの存在確認
    const token = useCookie('token');
    console.log('[Auth Middleware] トークンの確認:', !!token.value);

    try {
        // 認証状態をチェック
        if (token.value) {
            const isAuthenticated = await userStore.checkAuth();
            console.log('[Auth Middleware] 認証状態:', isAuthenticated);

            // 認証済みユーザーがログインページにアクセスした場合
            if (to.path === '/login' && isAuthenticated) {
                console.log('[Auth Middleware] ログインページへのアクセスを検知。ダッシュボードへリダイレクト');
                return navigateTo('/dashboard');
            }

            // パブリックページの場合は認証チェック不要
            if (isPublicPage) {
                return;
            }

            // 認証が必要なページで認証チェックに失敗した場合
            if (!isAuthenticated) {
                console.log('[Auth Middleware] 認証が必要なページで未認証を検知');
                return navigateTo('/login');
            }
        } else {
            // トークンがない場合で、保護されたページへのアクセス
            if (!isPublicPage) {
                console.log('[Auth Middleware] トークンなしで保護されたページへのアクセスを検知');
                return navigateTo('/login');
            }
        }
    } catch (error) {
        console.error('[Auth Middleware] 認証チェックエラー:', error);

        // エラーが発生した場合、トークンをクリア
        token.value = null;
        userStore.isLogin = false;
        userStore.user = null;

        // 保護されたページへのアクセスの場合はログインページへ
        if (!isPublicPage) {
            return navigateTo('/login');
        }
    }
});