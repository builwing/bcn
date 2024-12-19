<template>
  <header class="bg-gradient-to-r from-pink-500 to-pink-400 text-white shadow-lg">
    <div class="container mx-auto flex justify-between items-center p-4">
      <!-- ロゴ -->
      <div class="text-2xl font-bold">
        <NuxtLink to="/" class="hover:text-pink-200 transition-colors">
          Beauty Compass
        </NuxtLink>
      </div>

      <!-- ナビゲーションメニュー -->
      <nav class="hidden md:flex space-x-6 items-center">
        <template v-if="isLogin && user">
          <!-- 認証済みユーザーのメニュー -->
          <div class="relative group">
            <button class="flex items-center space-x-2 focus:outline-none">
              <span>{{ user.name }}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <!-- ドロップダウンメニュー -->
            <div
              class="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-md shadow-lg hidden group-hover:block"
            >
              <NuxtLink
                to="/profile"
                class="block px-4 py-2 hover:bg-gray-100 transition-colors"
              >
                プロフィール
              </NuxtLink>
              <button
                @click="handleLogout"
                class="block w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
              >
                ログアウト
              </button>
            </div>
          </div>
        </template>
        <template v-else>
          <!-- 未認証ユーザーのメニュー -->
          <NuxtLink to="/login" class="hover:text-pink-200 transition-colors">
            ログイン
          </NuxtLink>
          <NuxtLink to="/about" class="hover:text-pink-200 transition-colors">
            サイトについて
          </NuxtLink>
        </template>
        <NuxtLink
          to="/posts"
          class="hover:text-pink-200 transition-colors"
        >
          投稿一覧
        </NuxtLink>
      </nav>

      <!-- ハンバーガーメニュー（モバイル用） -->
      <div class="md:hidden">
        <button @click="toggleMenu" class="focus:outline-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16m-7 6h7"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- モバイルメニュー -->
    <div
      v-if="menuOpen"
      class="md:hidden bg-pink-500 text-white shadow-lg"
    >
      <nav class="flex flex-col space-y-4 p-4">
        <template v-if="isLogin && user">
          <NuxtLink
            to="/profile"
            class="hover:text-pink-200 transition-colors"
            @click="closeMenu"
          >
            プロフィール
          </NuxtLink>
          <button
            @click="handleLogout"
            class="hover:text-pink-200 transition-colors text-left"
          >
            ログアウト
          </button>
        </template>
        <template v-else>
          <NuxtLink
            to="/login"
            class="hover:text-pink-200 transition-colors"
            @click="closeMenu"
          >
            ログイン
          </NuxtLink>
        </template>
        <NuxtLink
          to="/posts"
          class="hover:text-pink-200 transition-colors"
          @click="closeMenu"
        >
          投稿一覧
        </NuxtLink>
        <NuxtLink
          to="/about"
          class="hover:text-pink-200 transition-colors"
          @click="closeMenu"
        >
          サイトについて
        </NuxtLink>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useUserStore } from '~/stores/user';
import { useRouter } from 'vue-router';

const router = useRouter();
const menuOpen = ref(false);
const toggleMenu = () => {
  menuOpen.value = !menuOpen.value;
};
const closeMenu = () => {
  menuOpen.value = false;
};

// Piniaストアから認証情報を取得
const userStore = useUserStore();

// リアクティブに監視
const isLogin = computed(() => userStore.isLogin);
const user = computed(() => userStore.user);

// ログアウト処理
const handleLogout = async () => {
  try {
    await userStore.logout();
    closeMenu();
    router.push('/login');
  } catch (error) {
    console.error('ログアウトエラー:', error);
    alert('ログアウトに失敗しました。');
  }
};
</script>