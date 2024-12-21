export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: false },
  modules: [
    "@nuxtjs/tailwindcss",
    ['@pinia/nuxt', {
      autoImports: ['defineStore', 'storeToRefs']
    }],
    '@pinia-plugin-persistedstate/nuxt',
  ],
  css: [
    'vue-advanced-cropper/dist/style.css',
    "~/assets/css/tailwind.css"
  ],
  postcss: {
    plugins: {
      'postcss-preset-env': {}
    }
  },
  runtimeConfig: {
    public: {
      apiBase: 'https://bcl.winroad.biz/api',
      sanctumEndpoint: 'https://bcl.winroad.biz/sanctum/csrf-cookie',
    },
  },
  build: {
    transpile: ['vue-cropper']
  },
  vite: {
    optimizeDeps: {
      include: ['vue-cropper']
    },
    server: {
      hmr: {
        overlay: false
      }
    }
  },
  app: {
    head: {
      script: [
        {
          innerHTML: `
            document.addEventListener('touchstart', function() {}, { passive: true });
            document.addEventListener('touchmove', function() {}, { passive: true });
            document.addEventListener('wheel', function() {}, { passive: true });
          `
        }
      ]
    }
  },
  typescript: {
    strict: true,
    typeCheck: false  // typeCheckをfalseに設定
  }
});