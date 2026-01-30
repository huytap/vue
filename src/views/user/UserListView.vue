<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '@/api/axios';
import type { PaginatedResponse } from '@/api/types';
import type { User } from '@/api/user/types';
import BasePagination from '@/components/BasePagination.vue';

const staffList = ref<User[]>([]);
const pagination = ref<any>(null); // Lưu meta phân trang

const fetchUser = async (page = 1) => {
  try {
    const response = await api.get<PaginatedResponse<User>>('/users', {
      params: { page }
    });
    
    staffList.value = response.data.data; // Dữ liệu mảng nhân viên
    pagination.value = response.data.meta; // Thông tin phân trang
  } catch (error) {
    console.error(error);
  }
};

onMounted(() => fetchUser());
</script>

<template>
  <div class="bg-white shadow rounded-lg">
    <!-- Table hiển thị nhân viên -->
    <table class="min-w-full">
        <!-- ... code render staffList ... -->
    </table>

    <!-- Component phân trang dùng chung -->
    <BasePagination 
      v-if="pagination" 
      :meta="pagination" 
      @change-page="fetchStaff" 
    />
  </div>
</template>
