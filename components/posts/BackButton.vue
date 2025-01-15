<template>
  <div class="mb-4">
    <button
      @click="$emit('click')"
      class="btn-primary inline-flex items-center gap-2"
    >
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
          d="M10 19l-7-7m0 0l7-7m-7 7h18" 
        />
      </svg>
      <span>前のページに戻る</span>
    </button>
  </div>
</template>

<script setup lang="ts">
defineEmits<{
  (e: 'click'): void
}>();
</script>