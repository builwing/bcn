import { defineStore } from 'pinia';

interface User {
    id: number;
    name: string;
    email: string;
}

export const useUserStore = defineStore('user', {
    state: () => ({
        user: null as User | null,
        isAuthenticated: false,
        isLoading: false,
    }),

    actions: {
        async login(credentials: { email: string; password: string }) {
            const config = useRuntimeConfig();
            this.isLoading = true;
            console.log('[useUserStore] ログイン処理開始...');

            try {
                await $fetch(config.public.sanctumEndpoint, {
                    credentials: 'include'
                });

                const response = await $fetch(`${config.public.apiBase}/login`, {
                    method: 'POST',
                    body: credentials,
                    credentials: 'include'
                }) as { user: User, success: boolean };

                console.log('[useUserStore] ログイン成功:', response.user);

                this.user = response.user;
                this.isAuthenticated = true;

                return { success: true };
            } catch (error) {
                console.error('[useUserStore] ログインエラー:', error);
                this.user = null;
                this.isAuthenticated = false;
                throw error;
            } finally {
                this.isLoading = false;
            }
        }
    }
});