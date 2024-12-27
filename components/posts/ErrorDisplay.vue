<template>
  <div class="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg">
    <!-- エラーアイコンとメッセージ -->
    <div class="flex items-start">
      <div class="flex-shrink-0">
        <svg 
          class="h-6 w-6 text-red-400" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
          aria-hidden="true"
        >
          <path 
            stroke-linecap="round" 
            stroke-linejoin="round" 
            stroke-width="2" 
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
          />
        </svg>
      </div>
      
      <div class="ml-3">
        <h3 class="text-lg font-medium text-red-800">
          エラーが発生しました
        </h3>
        <div class="mt-2 text-red-700">
          <p>{{ message }}</p>
        </div>
        
        <!-- リトライボタン（オプション） -->
        <div v-if="onRetry" class="mt-4">
          <button
            type="button"
            @click="onRetry"
            class="inline-flex items-center px-4 py-2 border border-transparent 
                   rounded-md shadow-sm text-sm font-medium text-white 
                   bg-red-600 hover:bg-red-700 focus:outline-none 
                   focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            リトライ
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  message: string;
  onRetry?: () => void;
}

defineProps<Props>();
</script>