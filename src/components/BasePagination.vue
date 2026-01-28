<!-- src/components/BasePagination.vue -->
<script setup lang="ts">
import type { PaginationMeta } from '@/api/types';

defineProps<{
  meta: PaginationMeta
}>();

const emit = defineEmits(['changePage']);
</script>

<template>
  <div class="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
    <div class="flex justify-between flex-1 sm:hidden">
      <button @click="emit('changePage', meta.current_page - 1)" :disabled="meta.current_page === 1" class="btn-mobile">Trước</button>
      <button @click="emit('changePage', meta.current_page + 1)" :disabled="meta.current_page === meta.last_page" class="btn-mobile">Sau</button>
    </div>
    <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
      <div>
        <p class="text-sm text-gray-700">
          Hiển thị từ <span class="font-medium">{{ meta.from }}</span> đến <span class="font-medium">{{ meta.to }}</span> trong tổng số <span class="font-medium">{{ meta.total }}</span> kết quả
        </p>
      </div>
      <div>
        <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
          <!-- Nút Previous -->
          <button 
            @click="emit('changePage', meta.current_page - 1)"
            :disabled="meta.current_page === 1"
            class="px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
          >
            &laquo;
          </button>

          <!-- Danh sách số trang -->
          <button 
            v-for="page in meta.last_page" :key="page"
            @click="emit('changePage', page)"
            :class="[
              page === meta.current_page 
              ? 'z-10 bg-amber-50 border-amber-500 text-amber-600' 
              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50',
              'relative inline-flex items-center px-4 py-2 border text-sm font-medium'
            ]"
          >
            {{ page }}
          </button>

          <!-- Nút Next -->
          <button 
            @click="emit('changePage', meta.current_page + 1)"
            :disabled="meta.current_page === meta.last_page"
            class="px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
          >
            &raquo;
          </button>
        </nav>
      </div>
    </div>
  </div>
</template>
