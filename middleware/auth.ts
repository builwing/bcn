import { useUserStore } from '~/stores/user';

export default defineNuxtRouteMiddleware((to, from) => {
    const userStore = useUserStore();
    if (!userStore.isAuthenticated && to.meta.requiresAuth) {
        return navigateTo('/login');
    }
});