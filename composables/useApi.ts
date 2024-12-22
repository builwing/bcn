// composables/useApi.ts
import type { NitroFetchRequest, NitroFetchOptions } from 'nitropack';

export const useApi = () => {
    const config = useRuntimeConfig();
    const baseURL = config.public.apiBase;

    // 共通のFetchオプション
    const defaultOptions: NitroFetchOptions<NitroFetchRequest> = {
        baseURL,
        credentials: 'include',
        headers: {
            Accept: 'application/json',
        },
    };

    return {
        baseURL,
        defaultOptions,
    };
};