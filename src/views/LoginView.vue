<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { userApi } from '../api/user';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const auth = useAuthStore();

// Khai báo Form dữ liệu
const form = ref({
  email: '',
  password: '',
});

const error = ref('');
const loading = ref(false);

const handleLogin = async () => {
  error.value = '';
  loading.value = true;
  
  try {
    const response = await userApi.login(form.value);
    // Lưu thông tin vào Pinia Store
    const data = response.data;
    auth.setAuth(data.data.user, data.data.access_token);
    // Chuyển hướng về trang Dashboard
    router.push({ name: 'dashboard' });
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại.';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 px-4">
    <div class="max-w-md w-full bg-white rounded-lg shadow-md p-8">
      <h2 class="text-2xl font-bold text-center text-gray-800 mb-8">Đăng nhập hệ thống</h2>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <!-- Thông báo lỗi -->
        <div v-if="error" class="bg-red-50 text-red-500 p-3 rounded text-sm border border-red-200">
          {{ error }}
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Email</label>
          <input 
            v-model="form.email"
            type="email" 
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="admin@example.com"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Mật khẩu</label>
          <input 
            v-model="form.password"
            type="password" 
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <button 
          type="submit"
          :disabled="loading"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <span v-if="loading">Đang xử lý...</span>
          <span v-else>Đăng nhập</span>
        </button>
      </form>
      
      <p class="mt-4 text-center text-sm text-gray-600">
        Chưa có tài khoản? <a href="#" class="text-blue-600 hover:underline">Đăng ký ngay</a>
      </p>
    </div>
  </div>
</template>