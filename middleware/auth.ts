// middleware/auth.ts
import { useUserStore } from '~/stores/user';

export default defineNuxtRouteMiddleware(async (to, from) => {
    const userStore = useUserStore();

    // すでに認証済みの場合はそのまま進む
    if (userStore.isAuthenticated) {
        return;
    }

    // ログインページは認証不要
    if (to.path === '/login') {
        return;
    }

    // 未認証の場合はログインページへリダイレクト
    return navigateTo('/login');
});