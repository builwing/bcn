<template>
  <div class="flex flex-col items-center justify-center p-8">
    <!-- ローディングスピナー -->
    <div class="relative w-16 h-16 mb-4">
      <div class="absolute top-0 left-0 w-full h-full">
        <div class="animate-spin w-16 h-16 border-4 border-pink-200 rounded-full"></div>
        <div class="animate-spin w-16 h-16 border-4 border-pink-500 rounded-full border-t-transparent"></div>
      </div>
    </div>
    
    <!-- ローディングメッセージ -->
    <div class="text-center">
      <h3 class="text-lg font-medium text-gray-900">
        読み込み中
      </h3>
      <p class="mt-1 text-sm text-gray-500">
        しばらくお待ちください...
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
// プロパティやイベントが必要ない場合は空で問題ありません
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>