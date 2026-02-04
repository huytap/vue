<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { bookingApi } from '@/api/categories';
import type { PaginatedResponse } from '@/api/types';
import type { Booking, BookingFilters } from '@/api/categories/types';
import BasePagination from '@/components/BasePagination.vue';
import { FILTER_OPTIONS, STATUS_CONFIG } from '@/api/categories/filters';
import { formatDateTime } from '@/utils/format';

const bookingsData = ref<PaginatedResponse<Booking> | null>(null);
const isLoading = ref(false);

const filters = ref<BookingFilters>({
    page: 1,
    time_range: 'today',
    status: 'all',
    staff_id: 'all',
    search: ''
});

const fetchBookings = async () => {
  isLoading.value = true;
  try {
    const response = await bookingApi.getList(filters.value); 
    bookingsData.value = response.data;
  } catch (error) {
    console.error("Lỗi khi tải lịch hẹn:", error);
  } finally {
    isLoading.value = false;
  }
};

const handlePageChange = (page: number) => {
    filters.value.page = page;
    fetchBookings();
};
const timeSelected = ref<BookingFilters['time_range']>('today');
const handleTimeChange = () => {
  filters.value.time_range = timeSelected.value;
  fetchBookings();
}
const getStatusLabel = (status: keyof typeof STATUS_CONFIG) => STATUS_CONFIG[status]?.label || 'Không xác định';
const getStatusClass = (status: keyof typeof STATUS_CONFIG) => STATUS_CONFIG[status]?.class || 'bg-gray-100';

onMounted(() => fetchBookings());
</script>

<template>
  <div class="space-y-6">
    <!-- Header: My Task (Đã thiết kế trước) -->
    <div class="bg-white p-6 rounded-lg shadow-sm">
        <!-- ... giao diện header và stats ... -->
        <h1 class="text-xl font-bold">My Task</h1>
    </div>
    <!-- Khu vực lọc dữ liệu & Bảng -->
    <div class="bg-white p-6 rounded-lg shadow-sm">
        <!-- Thanh Filter (Đã thiết kế trước) -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
             <div><label class="block text-xs">Thời gian</label>
             <select v-model="timeSelected" @change="handleTimeChange" class="mt-1 block w-full rounded-md border-gray-300">
               <option v-for="time in FILTER_OPTIONS.times" :key="time.key" :value="time.key">{{ time.value }}</option>
             </select></div>
             <!-- ... các select khác ... -->
        </div>

        <!-- Bảng dữ liệu chính -->
        <div class="overflow-x-auto relative">
          <div v-if="isLoading" class="absolute inset-0 bg-white/75 flex items-center justify-center z-10">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
          </div>

          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">THỜI GIAN</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">KHÁCH HÀNG</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DỊCH VỤ</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NHÂN VIÊN</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TRẠNG THÁI</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GIÁ CỌC</th>
                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">THAO TÁC</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="booking in bookingsData?.data" :key="booking.id">
                <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatDateTime(booking.start_time) }} - {{ formatDateTime(booking.end_time, false) }}
                </td>
                <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ booking.client_name }} ({{ booking.client_phone }})
                </td>
                <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ booking.service.name }}
                </td>
                <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                   <!-- Bạn sẽ cần gọi API User để lấy tên nhân viên từ staff_id -->
                  Staff ID: {{ booking.staff_id }}
                </td>
                <td class="px-4 py-4 whitespace-nowrap text-sm">
                  <span :class="getStatusClass(booking.status)" class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize">
                    {{ getStatusLabel(booking.status) }}
                  </span>
                </td>
                 <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ booking.deposit_amount.toLocaleString('vi-VN') }}đ
                </td>
                <td class="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button class="text-amber-600 hover:text-amber-900 mx-2">Sửa</button>
                  <button class="text-red-600 hover:text-red-900 mx-2">Hủy</button>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-if="bookingsData?.data.length === 0 && !isLoading" class="text-center py-12 text-gray-500">
            Hiện chưa có lịch hẹn nào thỏa mãn bộ lọc.
          </div>
        </div>

        <!-- Phân trang -->
        <BasePagination 
        :pagination-data="bookingsData" 
        :max-visible-pages="7"
        @change-page="handlePageChange" 
      />
    </div>
  </div>
</template>
