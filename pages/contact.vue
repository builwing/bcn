<template>
    <div class="bg-gradient-to-b from-blue-50 to-blue-100 min-h-screen py-12 px-6">
      <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 class="text-3xl font-bold text-gray-800 text-center mb-8">
          お問い合わせ
        </h1>
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- 名前 -->
          <div>
            <label for="name" class="block text-gray-700 font-medium mb-2">お名前</label>
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
  
          <!-- 件名 -->
          <div>
            <label for="subject" class="block text-gray-700 font-medium mb-2">件名</label>
            <input
              type="text"
              id="subject"
              v-model="form.subject"
              required
              class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例: サービスについて"
            />
          </div>
  
          <!-- メッセージ -->
          <div>
            <label for="message" class="block text-gray-700 font-medium mb-2">メッセージ</label>
            <textarea
              id="message"
              v-model="form.message"
              required
              rows="6"
              class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="お問い合わせ内容をご記入ください"
            ></textarea>
          </div>
  
          <!-- 送信ボタン -->
          <div class="text-center">
            <button
              type="submit"
              class="btn-primary inline-block text-center"
              >
              送信
            </button>
          </div>
        </form>
        <!-- 成功メッセージ -->
        <p
          v-if="successMessage"
          class="mt-6 text-green-600 text-center font-medium"
        >
          {{ successMessage }}
        </p>
        <!-- エラーメッセージ -->
        <p
          v-if="errorMessage"
          class="mt-6 text-red-600 text-center font-medium"
        >
          {{ errorMessage }}
        </p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  const form = ref({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  
  const successMessage = ref('');
  const errorMessage = ref('');
  
  const handleSubmit = async () => {
    try {
      // Laravel API にPOST送信
      const response = await $fetch('/api/contact', {
        method: 'POST',
        body: form.value,
      });
      successMessage.value = 'お問い合わせが送信されました。ありがとうございました！';
      errorMessage.value = '';
      // フォームをリセット
      form.value = {
        name: '',
        email: '',
        subject: '',
        message: '',
      };
    } catch (error) {
      errorMessage.value = '送信中にエラーが発生しました。もう一度お試しください。';
      successMessage.value = '';
    }
  };
  </script>
  
  <style scoped>
  /* デザインを強化 */
  body {
    font-family: 'Arial', sans-serif;
  }
</style>
  