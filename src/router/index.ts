import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import MainLayout from '@/layouts/MainLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: {requiresGuest: true}
    },
    {
      path: '/sso/backdoor-login',
      name: 'backdoor-login',
      component: () => import('@/views/BackdoorLogin.vue'),
      meta:{requiresGuest: true}
    },
    {
      path: '/',
      component: MainLayout,
      redirect: '/dashboard',
      meta:{requiresAuth: true},
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('@/views/DashboardView.vue')
        },
        {
          path: '/staff/list',
          name: 'staff.list',
          component: () => import('@/views/StaffView.vue'),
        },
      ]
    }
  ],
})
// BỘ CHẶN TRUY CẬP (Global Guard)
router.beforeEach((to, from, next) => {
  const auth = useAuthStore()
  const token = localStorage.getItem('auth_token') // Lấy token trực tiếp từ kho

  // 1. Nếu trang yêu cầu đăng nhập mà không có token -> Đá về Login
  if (to.meta.requiresAuth && !token) {
    next({ name: 'login' })
  } 
  // 2. Nếu đã đăng nhập mà vẫn cố vào trang Login -> Đá về Dashboard
  else if (to.meta.requiresGuest && token) {
    next({ name: 'dashboard' })
  }
  // 3. Các trường hợp còn lại cho đi tiếp
  else {
    next()
  }
})
export default router
