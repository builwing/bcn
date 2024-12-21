import { defineNuxtPlugin } from '#app';
import type { PiniaPluginContext } from 'pinia';
import { type Pinia } from 'pinia';

export default defineNuxtPlugin((nuxtApp) => {
    // クライアントサイドでのみ実行
    if (!import.meta.client) return;

    const pinia = nuxtApp.$pinia as Pinia;

    if (!pinia) {
        console.warn('Pinia instance not found');
        return;
    }

    pinia.use(({ store }: PiniaPluginContext) => {
        if (!store.$id) return;

        const persistOptions = {
            persist: true,
            storage: window.localStorage,
            key: store.$id
        };

        store.$persistOptions = persistOptions;
    });
});