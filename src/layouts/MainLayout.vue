<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();

const handleLogout = () => {
  auth.logout();
  router.push({ name: 'login' });
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex">
    <!-- SIDEBAR CỐ ĐỊNH -->
    <aside class="w-64 bg-slate-900 text-white flex-shrink-0 hidden md:flex flex-col">
      <div class="p-6">
        <h1 class="text-xl font-bold tracking-wider text-amber-400">HOÀNG GIA SALON</h1>
      </div>
      
      <nav class="flex-1 px-4 space-y-2">
        <RouterLink :to="{ name: 'dashboard' }" class="block px-4 py-2.5 rounded hover:bg-slate-800 transition" active-class="bg-slate-800 text-white">
          Dashboard
        </RouterLink>
        <a href="#" class="block px-4 py-2.5 rounded text-slate-400 hover:bg-slate-800 hover:text-white transition">Lịch hẹn</a>
        <a href="#" class="block px-4 py-2.5 rounded text-slate-400 hover:bg-slate-800 hover:text-white transition">Dịch vụ</a>
      </nav>

      <div class="p-4 border-t border-slate-800">
        <button @click="handleLogout" class="w-full text-left px-4 py-2 text-red-400 hover:bg-red-500/10 rounded transition">
          Đăng xuất
        </button>
      </div>
    </aside>

    <!-- PHẦN BÊN PHẢI -->
    <div class="flex-1 flex flex-col">
      <!-- HEADER CHUNG -->
      <header class="h-16 bg-white shadow-sm flex items-center justify-between px-8">
        <h2 class="text-lg font-semibold text-gray-700">Salon Tóc Hoàng Gia</h2>
        <div class="flex items-center gap-4">
          <div class="text-right">
            <p class="text-sm font-medium text-gray-800">{{ auth.user?.fullName }}</p>
            <p class="text-xs text-gray-500 capitalize">{{ auth.user?.role }}</p>
          </div>
          <div class="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold">
            {{ auth.user?.userName.charAt(0) }}
          </div>
        </div>
      </header>

      <!-- NỘI DUNG THAY ĐỔI (Giống @yield('content') trong Laravel) -->
      <main class="p-8">
        <RouterView />
      </main>
    </div>
  </div>
</template>