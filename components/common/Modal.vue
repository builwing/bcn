<template>
  <div class="fixed inset-0 z-50 overflow-y-auto" @click.self="$emit('close')">
    <div class="flex min-h-full items-center justify-center p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-lg w-full">
        <div class="p-4 border-b">
          <slot name="header" />
        </div>
        <div class="p-4">
          <slot name="body" />
        </div>
        <div class="p-4 border-t">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits(['close'])
</script>