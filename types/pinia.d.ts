import 'pinia';

declare module 'pinia' {
    export interface PiniaCustomProperties {
        $persistOptions?: {
            persist: boolean;
            storage: Storage;
            key: string;
        };
    }
}