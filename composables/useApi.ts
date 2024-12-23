// composables/useApi.ts
import type { NitroFetchRequest, NitroFetchOptions } from 'nitropack';

export const useApi = () => {
    const config = useRuntimeConfig();
    const baseURL = config.public.apiBase;
    const token = useCookie('token');

    // 共通のFetchオプション
    const defaultOptions: NitroFetchOptions<NitroFetchRequest> = {
        baseURL,
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            ...(token.value ? { 'Authorization': `Bearer ${token.value}` } : {})
        },
    };

    return {
        baseURL,
        defaultOptions,
    };
};