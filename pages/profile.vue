<template>
  <div class="bg-gradient-to-b from-blue-50 to-blue-100 min-h-screen py-12 px-6">
    <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
      <!-- ヘッダー -->
      <h1 class="text-3xl font-bold text-gray-800 text-center mb-8">プロフィール</h1>

      <!-- プロフィールフォーム -->
      <form v-if="userStore.user" @submit.prevent="handleUpdateProfile" class="space-y-6">
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

        <!-- パスワード（変更する場合のみ入力） -->
        <div>
          <label for="password" class="block text-gray-700 font-medium mb-2">パスワード</label>
          <input
            type="password"
            id="password"
            v-model="form.password"
            class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="新しいパスワードを入力（変更する場合のみ）"
          />
        </div>

        <!-- 更新ボタン -->
        <div>
          <button
            type="submit"
            class="btn-primary w-full inline-block text-center"
            :disabled="isLoading"
          >
            {{ isLoading ? '更新中...' : 'プロフィールを更新' }}
          </button>
        </div>
      </form>

      <!-- 成功・エラーメッセージ -->
      <div v-if="message" class="mt-6 text-center">
        <p :class="`text-sm font-medium ${messageType === 'success' ? 'text-green-600' : 'text-red-600'}`">
          {{ message }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '~/stores/user';

definePageMeta({
middleware: ['auth']
});

const router = useRouter();
const config = useRuntimeConfig();
const userStore = useUserStore();
const isLoading = ref(false);

const form = ref({
name: '',
email: '',
password: '',
});

const message = ref('');
const messageType = ref('');

// プロフィール情報の初期化
onMounted(() => {
if (userStore.user) {
  form.value.name = userStore.user.name;
  form.value.email = userStore.user.email;
}
});

// プロフィール情報の更新
const handleUpdateProfile = async () => {
if (!userStore.isLogin) {
  router.push('/login');
  return;
}

isLoading.value = true;
try {
  const updateData = { ...form.value };
  if (!updateData.password) {
    delete updateData.password; // パスワードが空の場合は削除
  }

  const response = await $fetch(`${config.public.apiBase}/user/profile`, {
    method: 'PUT',
    body: updateData,
    credentials: 'include',
  });

  // ストアのユーザー情報を更新
  if (response.user) {
    userStore.user = response.user;
  }

  messageType.value = 'success';
  message.value = 'プロフィールが正常に更新されました。';

  // パスワードフィールドをクリア
  form.value.password = '';
} catch (error) {
  console.error('プロフィール更新エラー:', error);
  messageType.value = 'error';
  message.value = 'プロフィールの更新に失敗しました。';
} finally {
  isLoading.value = false;
}
};
</script>