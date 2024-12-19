import { useUserStore } from '~/stores/user';

export default defineNuxtPlugin(async (nuxtApp) => {
    const userStore = useUserStore();

    // リロード時にトークンの存在チェックと認証状態の確認を行う
    if (!userStore.isLogin) {
        console.log('User is not logged in');
        return;
    }

    try {
        // トークンが存在する場合、ユーザー情報を取得
        const isAuthenticated = await userStore.checkAuth();
        if (!isAuthenticated) {
            console.log('Failed to authenticate user');
        }
    } catch (error) {
        console.error('Error checking authentication:', error);
    }
});