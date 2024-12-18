<template>
    <div class="bg-gradient-to-b from-pink-100 to-pink-300 min-h-screen flex items-center justify-center py-12 px-6">
      <div class="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <!-- ヘッダー -->
        <h1 class="text-3xl font-bold text-gray-800 text-center mb-8">ログイン</h1>
  
        <!-- ログインフォーム -->
        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- メールアドレス -->
          <div>
            <label for="email" class="block text-gray-700 font-medium mb-2">メールアドレス</label>
            <input
              type="email"
              id="email"
              v-model="form.email"
              required
              class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="例: example@example.com"
            />
          </div>
  
          <!-- パスワード -->
          <div>
            <label for="password" class="block text-gray-700 font-medium mb-2">パスワード</label>
            <input
              type="password"
              id="password"
              v-model="form.password"
              required
              class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="パスワードを入力"
            />
          </div>
  
          <!-- 送信ボタン -->
          <div>
            <button
              type="submit"
              class="w-full bg-pink-500 text-white font-bold py-3 rounded-lg hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-400"
            >
              ログイン
            </button>
          </div>
        </form>
  
        <!-- フッター -->
        <div class="mt-6 text-center">
          <p class="text-sm text-gray-700">
            アカウントをお持ちでない方は
            <NuxtLink
              to="/register"
              class="text-pink-500 hover:text-pink-600 font-medium"
            >
              新規登録
            </NuxtLink>
          </p>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  
  const router = useRouter();
  const config = useRuntimeConfig();
  
  const form = ref({
    email: '',
    password: '',
  });
  
  const handleLogin = async () => {
  try {
    // Laravel Sanctumのcsrf-cookieエンドポイントへリクエスト
    await $fetch(config.public.sanctumEndpoint, {
      credentials: 'include',
    });

    // Laravel API にログインリクエストを送信
    const response = await $fetch(`${config.public.apiBase}/login`, {
      method: 'POST',
      body: form.value,
      credentials: 'include',
    });

    console.log('レスポンス全体:', response);
    console.log('データ部分:', response.user);
    console.log('トークン取得前の確認:', response.token);
    const token = response.token;
    console.log('取得したトークン:', token);
    
    if (!token) {
      throw new Error('トークンが取得できませんでした。');
    }

    localStorage.setItem('token', token);

    // ダッシュボードへリダイレクト
    router.push('/dashboard');
  } catch (error) {
    console.error('ログインエラー:', error);
    alert('ログインに失敗しました。メールアドレスとパスワードを再確認してください。');
  }
};  
  </script>
  
  <style scoped>
  body {
    font-family: 'Arial', sans-serif;
  }
  </style>
  