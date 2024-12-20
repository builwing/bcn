// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  modules: [
    "@nuxtjs/tailwindcss",
    '@pinia/nuxt',
  ],
  css: ["~/assets/css/tailwind.css"],
  postcss: {
    plugins: {
      'postcss-preset-env': {},
      'prettier': {}
    }
  },
  runtimeConfig: {
    public: {
      apiBase: 'https://bcl.winroad.biz/api', // Laravel API のベース URL
      sanctumEndpoint: 'https://bcl.winroad.biz/sanctum/csrf-cookie', // Laravel Sanctumのベース URL
    },
  },
});
