import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { User } from '@/api/user/types';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(localStorage.getItem('auth_token'));

  function setAuth(newUser: User, newToken: string) {
    user.value = newUser;
    token.value = newToken;
    localStorage.setItem('auth_token', newToken); // Lưu lại để dùng cho axios interceptor
  }

  function logout() {
    user.value = null;
    token.value = null;
    localStorage.removeItem('auth_token');
  }

  return { user, token, setAuth, logout };
});