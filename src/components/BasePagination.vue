<script setup lang="ts">
import { computed } from 'vue';
import type { PaginatedResponse } from '@/api/types';

interface Props {
  paginationData: PaginatedResponse<any> | null; // Cho phép null
  maxVisiblePages?: number;
}

const props = withDefaults(defineProps<Props>(), {
  maxVisiblePages: 7,
  paginationData: null // Default value
});

const emit = defineEmits<{
  changePage: [page: number];
}>();

// Check if data is valid
const hasValidData = computed(() => {
  return props.paginationData?.meta !== null && props.paginationData?.meta !== undefined;
});

// Tính toán danh sách các trang hiển thị
const visiblePages = computed(() => {
  if (!hasValidData.value) return [];
  const meta = props.paginationData?.meta;
  const current = meta!.current_page;
  const last = meta!.last_page;
  const maxPages = props.maxVisiblePages;
  
  // Nếu tổng số trang nhỏ hơn maxPages, hiển thị tất cả
  if (last <= maxPages) {
    return Array.from({ length: last }, (_, i) => i + 1);
  }
  
  const pages: (number | string)[] = [];
  const halfVisible = Math.floor((maxPages - 2) / 2);
  
  // Trang đầu luôn hiển thị
  pages.push(1);
  
  let start = Math.max(2, current - halfVisible);
  let end = Math.min(last - 1, current + halfVisible);
  
  // Điều chỉnh nếu ở gần đầu
  if (current <= halfVisible + 1) {
    end = Math.min(maxPages - 1, last - 1);
  }
  
  // Điều chỉnh nếu ở gần cuối
  if (current >= last - halfVisible) {
    start = Math.max(2, last - maxPages + 2);
  }
  
  // Thêm dấu ... nếu cần
  if (start > 2) {
    pages.push('...');
  }
  
  // Thêm các trang ở giữa
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  
  // Thêm dấu ... nếu cần
  if (end < last - 1) {
    pages.push('...');
  }
  
  // Trang cuối luôn hiển thị
  if (last > 1) {
    pages.push(last);
  }
  
  return pages;
});

const goToPage = (page: number | string) => {
  if (!hasValidData.value) return;
  if (typeof page === 'number' && page !== props.paginationData?.meta!.current_page) {
    emit('changePage', page);
  }
};

const goToPrevPage = () => {
  if (!hasValidData.value) return;
  if (props.paginationData?.links.prev) {
    emit('changePage', props.paginationData.meta!.current_page - 1);
  }
};

const goToNextPage = () => {
  if (!hasValidData.value) return;
  if (props.paginationData?.links.next) {
    emit('changePage', props.paginationData?.meta!.current_page + 1);
  }
};

const goToFirstPage = () => {
  if (!hasValidData.value) return;
  if (props.paginationData?.meta!.current_page !== 1) {
    emit('changePage', 1);
  }
};

const goToLastPage = () => {
  if (!hasValidData.value) return;
  if (props.paginationData?.meta!.current_page !== props.paginationData?.meta!.last_page) {
    emit('changePage', props.paginationData!.meta.last_page);
  }
};

const shouldShowPagination = computed(() => {
  if (!hasValidData.value) return false;
  return props.paginationData!.meta!.total > 0 && props.paginationData!.meta!.last_page > 1;
});

const hasPrevPage = computed(() => {
  if (!hasValidData.value) return false;
  return props.paginationData?.meta!.prev_page_url !== null;
});

const hasNextPage = computed(() => {
  if (!hasValidData.value) return false;
  return props.paginationData?.meta!.next_page_url !== null;
});
</script>

<template>
  <div 
    v-if="shouldShowPagination" 
    class="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6"
  >
    <!-- Mobile view -->
    <div class="flex justify-between items-center flex-1 sm:hidden">
      <button 
        @click="goToPrevPage" 
        :disabled="!hasPrevPage" 
        class="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Trước
      </button>
      
      <span class="text-sm text-gray-700">
        Trang <span class="font-medium">{{ paginationData?.meta?.current_page }}</span> / <span class="font-medium">{{ paginationData?.meta?.last_page }}</span>
      </span>
      
      <button 
        @click="goToNextPage" 
        :disabled="!hasNextPage" 
        class="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Sau
      </button>
    </div>

    <!-- Desktop view -->
    <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
      <!-- Thông tin hiển thị -->
      <div>
        <p class="text-sm text-gray-700">
          Hiển thị 
          <span class="font-medium">{{ paginationData?.meta?.from || 0 }}</span> 
          đến 
          <span class="font-medium">{{ paginationData?.meta?.to || 0 }}</span> 
          trong tổng số 
          <span class="font-medium">{{ paginationData?.meta?.total || 0 }}</span> 
          kết quả
        </p>
      </div>

      <!-- Navigation -->
      <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
        <!-- First Page Button -->
        <button 
          @click="goToFirstPage"
          :disabled="paginationData?.meta?.current_page === 1"
          class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
          title="Trang đầu"
          aria-label="Đến trang đầu"
        >
          <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
          </svg>
        </button>

        <!-- Previous Page Button -->
        <button 
          @click="goToPrevPage"
          :disabled="!hasPrevPage"
          class="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
          title="Trang trước"
          aria-label="Đến trang trước"
        >
          <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
        </button>

        <!-- Page Numbers -->
        <template v-for="(page, index) in visiblePages" :key="`page-${index}`">
          <!-- Ellipsis -->
          <span 
            v-if="page === '...'"
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 cursor-default"
            aria-hidden="true"
          >
            ...
          </span>
          
          <!-- Page Button -->
          <button 
            v-else
            @click="goToPage(page)"
            :class="[
              page === paginationData?.meta.current_page 
                ? 'z-10 bg-amber-50 border-amber-500 text-amber-600 font-semibold' 
                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50 font-medium',
              'relative inline-flex items-center px-4 py-2 border text-sm transition-colors duration-150'
            ]"
            :aria-current="page === paginationData?.meta.current_page ? 'page' : undefined"
            :aria-label="`Đến trang ${page}`"
          >
            {{ page }}
          </button>
        </template>

        <!-- Next Page Button -->
        <button 
          @click="goToNextPage"
          :disabled="!hasNextPage"
          class="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
          title="Trang sau"
          aria-label="Đến trang sau"
        >
          <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
          </svg>
        </button>

        <!-- Last Page Button -->
        <button 
          @click="goToLastPage"
          :disabled="paginationData?.meta?.current_page === paginationData?.meta?.last_page"
          class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
          title="Trang cuối"
          aria-label="Đến trang cuối"
        >
          <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            <path fill-rule="evenodd" d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clip-rule="evenodd" />
          </svg>
        </button>
      </nav>
    </div>
  </div>
</template>