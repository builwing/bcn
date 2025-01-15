<script setup>
defineProps({
  meta: {
    type: Object,
    required: true,
    default: () => ({
      current_page: 1,
      last_page: 1,
      per_page: 12,
      total: 0
    })
  },
  links: {
    type: Object,
    required: true,
    default: () => ({
      first: null,
      last: null,
      prev: null,
      next: null
    })
  }
});

const emit = defineEmits(['pageChange']);

// ページ番号をクリックした時の処理
const handlePageClick = (pageNumber) => {
  emit('pageChange', pageNumber);
};
</script>

<template>
  <div class="flex items-center justify-center space-x-2 my-4">
    <!-- 前のページへのリンク -->
    <button
      @click="handlePageClick(meta.current_page - 1)"
      :disabled="!links.prev"
      class="px-4 py-2 border rounded-lg"
      :class="[
        links.prev
          ? 'bg-white hover:bg-gray-100 text-gray-800'
          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
      ]"
    >
      前へ
    </button>

    <!-- ページ番号の表示 -->
    <div class="flex space-x-1">
      <template v-for="page in meta.last_page" :key="page">
        <button
          @click="handlePageClick(page)"
          class="px-4 py-2 border rounded-lg"
          :class="[
            meta.current_page === page
              ? 'bg-blue-500 text-white'
              : 'bg-white hover:bg-gray-100 text-gray-800'
          ]"
        >
          {{ page }}
        </button>
      </template>
    </div>

    <!-- 次のページへのリンク -->
    <button
      @click="handlePageClick(meta.current_page + 1)"
      :disabled="!links.next"
      class="px-4 py-2 border rounded-lg"
      :class="[
        links.next
          ? 'bg-white hover:bg-gray-100 text-gray-800'
          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
      ]"
    >
      次へ
    </button>
  </div>
</template>