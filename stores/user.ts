import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
    state: () => ({
        token: null as string | null,
        user: null as { name: string; email: string } | null,
    }),
    actions: {
        setUser(data: { token: string; user: { name: string; email: string } }) {
            this.token = data.token;
            this.user = data.user;
        },
        clearUser() {
            this.token = null;
            this.user = null;
        },
    },
    getters: {
        isAuthenticated: (state) => !!state.token,
    },
});