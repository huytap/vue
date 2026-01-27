<script setup lang="ts">
const stats = [
  { name: 'Lịch hẹn hôm nay', value: '12', icon: '📅' },
  { name: 'Khách hàng mới', value: '4', icon: '👤' },
  { name: 'Doanh thu ngày', value: '2.500.000đ', icon: '💰' },
  { name: 'Dịch vụ đang chạy', value: '3', icon: '✂️' },
];
</script>

<template>
  <div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div v-for="item in stats" :key="item.name" class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div class="text-2xl mb-2">{{ item.icon }}</div>
        <div class="text-sm text-gray-500 mb-1">{{ item.name }}</div>
        <div class="text-2xl font-bold text-gray-800">{{ item.value }}</div>
      </div>
    </div>
    
    <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h3 class="font-bold text-gray-800 mb-4">Chào mừng Admin quay trở lại!</h3>
      <p class="text-gray-600">Đây là khu vực quản lý salon của bạn.</p>
    </div>
  </div>
</template>