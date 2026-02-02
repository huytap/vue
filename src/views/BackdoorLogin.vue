<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { userApi } from '@/api/user';
import type { BackdoorParams } from '@/api/user/types';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

onMounted(async () => {
    const { t, u } = route.query;
    if (!t || !u) return;
    const params: BackdoorParams = {
        t: t as string,          // Giữ nguyên là string
        u: Number(u)             // UserId thì chuyển sang số
    };
    try {
        const response = await userApi.backdoor(params);
        var data = response.data;
        console.log(data)
        if (data && data.data.accessToken) {
            auth.setAuth(data.data.user, data.data.accessToken);
            localStorage.setItem('token', data.data.accessToken);
            console.log('USER SET:', auth.user);
            console.log('TOKEN SET:', auth.token);
            router.push({ name: 'dashboard' });
        }
    } catch (error) {
        // Nếu lỗi (token đã bị null ở DB), đẩy về MVC Login
        window.location.href = `${import.meta.env.VITE_MVC_BASE_URL}/login`;
    }
});
</script>
<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 px-4">
    <div class="max-w-md w-full bg-white rounded-lg shadow-md p-8">
      <div class="login-loading">
        <p>Đang xác thực quyền truy cập...</p>
        </div>
    </div>
  </div>
</template>