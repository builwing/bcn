// plugins/pinia-persisted-state.ts
import { createPinia, type Pinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

export default defineNuxtPlugin((nuxtApp) => {
    const pinia = nuxtApp.$pinia as Pinia
    if (!pinia) return
    pinia.use(piniaPluginPersistedstate)
})