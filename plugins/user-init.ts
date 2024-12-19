import { useUserStore } from '~/stores/user';

export default defineNuxtPlugin(async (nuxtApp) => {
    const userStore = useUserStore();

    // ログイン済みかどうかの確認はストアの状態で判断
    if (!userStore.isAuthenticated) {
        console.log('User is not authenticated');
    }
});