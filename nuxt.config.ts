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
  imports: {
    autoImport: true,
    dirs: ['stores', 'composables']
  },
  typescript: {
    strict: true,
    typeCheck: true,
    shim: false,
    tsConfig: {
      compilerOptions: {
        moduleResolution: "bundler",
        allowImportingTsExtensions: true,
        paths: {
          "~/*": ["./*"],
          "@/*": ["./*"]
        },
        types: ["@pinia/nuxt", "@types/node"]
      }
    }
  },
  css: [
    "~/assets/css/tailwind.css",
    'vue-advanced-cropper/dist/style.css',

  ],
  postcss: {
    plugins: {
      'postcss-import': {},
      'tailwindcss/nesting': {},
      tailwindcss: {},
      autoprefixer: {},
      'postcss-preset-env': {
        features: {
          'nesting-rules': false
        }
      }
    }
  },

  runtimeConfig: {
    public: {
      apiBase: 'https://bcl.winroad.biz/api',
      sanctumEndpoint: 'https://bcl.winroad.biz/sanctum/csrf-cookie',
      appVersion: '0.0.2'
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
});