<template>
    <div class="bg-gradient-to-b from-blue-100 to-blue-300 min-h-screen flex items-center justify-center py-12 px-6">
      <div class="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <!-- ヘッダー -->
        <h1 class="text-3xl font-bold text-gray-800 text-center mb-8">新規登録</h1>
  
        <!-- 登録フォーム -->
        <form @submit.prevent="handleRegister" class="space-y-6">
          <!-- 氏名 -->
          <div>
            <label for="name" class="block text-gray-700 font-medium mb-2">氏名</label>
            <input
              type="text"
              id="name"
              v-model="form.name"
              required
              class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例: 山田 太郎"
            />
          </div>
  
          <!-- メールアドレス -->
          <div>
            <label for="email" class="block text-gray-700 font-medium mb-2">メールアドレス</label>
            <input
              type="email"
              id="email"
              v-model="form.email"
              required
              class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例: example@example.com"
            />
          </div>
  
          <!-- パスワード -->
          <div>
            <label for="password" class="block text-gray-700 font-medium mb-2">パスワード</label>
            <div class="relative">
              <input
                :type="passwordVisible ? 'text' : 'password'"
                id="password"
                v-model="form.password"
                required
                class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="8文字以上のパスワードを入力"
              />
              <button
                type="button"
                @click="togglePasswordVisibility"
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <span v-if="passwordVisible">
                  👁️
                </span>
                <span v-else>
                  👁️‍🗨️
                </span>
              </button>
            </div>
          </div>
  
          <!-- 送信ボタン -->
          <div>
            <button
              type="submit"
              class="btn-primary w-full inline-block text-center"
            >
              登録
            </button>
          </div>
        </form>
  
        <!-- フッター -->
        <div class="mt-6 text-center">
          <p class="text-sm text-gray-700">
            すでにアカウントをお持ちの方は
            <NuxtLink
              to="/login"
              class="text-blue-500 hover:text-blue-600 font-medium"
            >
              ログイン
            </NuxtLink>
          </p>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  
  const router = useRouter();
  const user = ref({ name: '', email: '' });
  const isAuthenticated = ref(false);
  
  onMounted(() => {
    try {
      const token = localStorage.getItem('token');
      const userDataStr = localStorage.setItem('userData');
  
      if (!token || !userDataStr) {
        throw new Error('認証情報が存在しません');
      }
  
      const userData = JSON.parse(userDataStr);
      user.value = {
        name: userData.name,
        email: userData.email
      };
      isAuthenticated.value = true;
  
    } catch (error) {
      console.error('認証エラー:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      router.push('/login');
    }
  });
  </script>
  
  <style scoped>
  body {
    font-family: 'Arial', sans-serif;
  }
  </style>