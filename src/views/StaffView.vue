<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { User, PaginatedResponse } from '@/api/types';
import BasePagination from '@/components/BasePagination.vue';

const staffList = ref<User[]>([]);
const pagination = ref<any>(null);
const isLoading = ref(false);

// HÀM DUMMY DỮ LIỆU
const fetchStaff = async (page = 1) => {
  isLoading.value = true;
  
  // Giả lập độ trễ 500ms giống như gọi API thật
  await new Promise(resolve => setTimeout(resolve, 500));

  const itemsPerPage = 5;
  const totalItems = 23; // Giả sử có 23 nhân viên
  const lastPage = Math.ceil(totalItems / itemsPerPage);

  // Tạo mảng dữ liệu giả dựa trên trang hiện tại
  const dummyData: User[] = Array.from({ length: itemsPerPage }, (_, i) => {
    const id = (page - 1) * itemsPerPage + i + 1;
    if (id > totalItems) return null; // Tránh tạo quá số lượng tổng
    
    return {
      id: id,
      name: `Nhân viên Hoàng Gia ${id}`,
      email: `staff${id}@hoanggia.vn`,
      is_super_admin: false,
      roles: ['staff'],
      permissions: ['view_bookings'],
      created_at: '2025-10-10T14:11:44.000000Z'
    };
  }).filter(item => item !== null) as User[];

  // Giả lập cấu trúc Response từ Laravel
  const mockResponse: PaginatedResponse<User> = {
    data: dummyData,
    meta: {
      current_page: page,
      last_page: lastPage,
      per_page: itemsPerPage,
      total: totalItems,
      from: (page - 1) * itemsPerPage + 1,
      to: Math.min(page * itemsPerPage, totalItems)
    },
    links: { first: '', last: '', prev: null, next: null }
  };

  staffList.value = mockResponse.data;
  pagination.value = mockResponse.meta;
  isLoading.value = false;
};

onMounted(() => fetchStaff());
</script>

<template>
  <div class="bg-white shadow rounded-lg overflow-hidden relative">
    <!-- Hiệu ứng Loading che phủ bảng -->
    <div v-if="isLoading" class="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
    </div>

    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên nhân viên</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <tr v-for="user in staffList" :key="user.id">
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{{ user.id }}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ user.name }}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ user.email }}</td>
        </tr>
      </tbody>
    </table>

    <!-- Component phân trang -->
    <BasePagination 
      v-if="pagination" 
      :meta="pagination" 
      @change-page="fetchStaff" 
    />
  </div>
</template>
