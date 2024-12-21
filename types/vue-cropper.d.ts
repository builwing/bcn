// types/vue-cropper.d.ts
declare module 'vue-cropper' {
    import { DefineComponent } from 'vue'

    export const VueCropper: DefineComponent<{
        src: string;
        options?: Record<string, any>;
        ref?: string;
    }>;

    export default VueCropper;
}