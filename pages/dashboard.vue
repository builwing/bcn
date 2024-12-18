<template>
    <div v-if="isAuthenticated" class="bg-gradient-to-b from-blue-50 to-blue-100 min-h-screen py-12 px-6">
      <div class="max-w-7xl mx-auto">
        <!-- ヘッダーセクション -->
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-800 mb-4">ダッシュボード</h1>
          <p class="text-lg text-gray-600">
            Beauty Compassへようこそ！以下からあなたの情報を管理したり、新しい投稿を作成できます。
          </p>
        </div>
  
        <!-- メインコンテンツ -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- プロファイル -->
          <div class="bg-white rounded-lg shadow-lg p-6">
            <h2 class="text-2xl font-semibold text-gray-800 mb-4">プロフィール</h2>
            <ul class="space-y-2 text-gray-600">
              <li><strong>名前:</strong> {{ user.name }}</li>
              <li><strong>メールアドレス:</strong> {{ user.email }}</li>
            </ul>
            <div class="mt-6">
              <NuxtLink
                to="/profile"
                class="block bg-blue-500 text-white text-center py-3 rounded-lg hover:bg-blue-600"
              >
                プロフィールを編集
              </NuxtLink>
            </div>
          </div>
  
          <!-- 新規投稿 -->
          <div class="bg-white rounded-lg shadow-lg p-6">
            <h2 class="text-2xl font-semibold text-gray-800 mb-4">新規投稿</h2>
            <p class="text-gray-600">
              美容体験を共有して、他のユーザーと情報を交換しましょう。
            </p>
            <div class="mt-6">
              <NuxtLink
                to="/posts/create"
                class="block bg-pink-500 text-white text-center py-3 rounded-lg hover:bg-pink-600"
              >
                投稿を作成
              </NuxtLink>
            </div>
          </div>
  
          <!-- 投稿一覧 -->
          <div class="bg-white rounded-lg shadow-lg p-6">
            <h2 class="text-2xl font-semibold text-gray-800 mb-4">投稿一覧</h2>
            <p class="text-gray-600">
              自分の投稿を確認したり、管理することができます。
            </p>
            <div class="mt-6">
              <NuxtLink
                to="/posts"
                class="block bg-green-500 text-white text-center py-3 rounded-lg hover:bg-green-600"
              >
                投稿を表示
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  
  const router = useRouter();
  const config = useRuntimeConfig();
  const user = ref({ name: '', email: '' });
  const isAuthenticated = ref(false);
  
  onMounted(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('トークンが存在しません');
      }
  
      // ユーザー情報を取得
      const response = await $fetch(`${config.public.apiBase}/user`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
  
      console.log('レスポンス:', response); // デバッグ用
  
      // レスポンスからユーザー情報を取得
      if (response && response.user.name) {
        user.value = {
          name: response.user.name,
          email: response.user.email
        };
        isAuthenticated.value = true;
      } else {
        throw new Error('ユーザー情報の取得に失敗しました');
      }
  
    } catch (error) {
      console.error('認証エラー:', error);
      // トークンを削除
      localStorage.removeItem('token');
      // ログインページへリダイレクト
      await router.push('/login');
    }
  });
  
  </script>
  
  <style scoped>
  body {
    font-family: 'Arial', sans-serif;
  }
  </style>  