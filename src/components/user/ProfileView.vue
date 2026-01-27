<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { userApi } from '@/api/user';
import type { User } from '@/api/user/types';

const userInfo = ref<User | null>(null);
const loading = ref(true);

onMounted(async () => {
  try {
    const response = await userApi.getProfile();
    // TypeScript sẽ hiểu response.data có cấu trúc của Interface User
    userInfo.value = response.data;
  } catch (error) {
    console.error("Lỗi lấy thông tin:", error);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div v-if="loading">Đang tải...</div>
  <div v-else-if="userInfo">
    <h1>Xin chào, {{ userInfo.name }}</h1>
    <p>Email: {{ userInfo.email }}</p>
    <span class="badge">{{ userInfo.role }}</span>
  </div>
</template>