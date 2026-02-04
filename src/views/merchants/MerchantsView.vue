<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { merchantApi } from '@/api/merchants';
import type { PaginatedResponse } from '@/api/types';
import type { Merchant, MerchantFilters } from '@/api/merchants/types';
import BasePagination from '@/components/BasePagination.vue';
import { formatDateTime } from '@/utils/format';

// State
const merchantsData = ref<PaginatedResponse<Merchant> | null>(null);
const isLoading = ref(false);

const filters = ref<MerchantFilters>({
  search: '',
  is_active: undefined,
  status: 'all' as any
});

// Logic lấy dữ liệu
const fetchMerchants = async () => {
  isLoading.value = true;
  try {
    const response = await merchantApi.getList(filters.value);
    merchantsData.value = response.data.data; 
    console.log("Dữ liệu đã gán:", response.data.data);
  } catch (error) {
    console.error("Lỗi khi tải danh sách merchant:", error);
    merchantsData.value = null;
  } finally {
    isLoading.value = false;
  }
};

// Handlers
const handlePageChange = (page: number) => {
  fetchMerchants();
};

const handleSearch = () => {
  fetchMerchants();
};

const toggleStatus = async (merchant: Merchant) => {
  try {
    if (merchant?.is_active) {
      await merchantApi.suspend(merchant?.id);
    } else {
      await merchantApi.activate(merchant?.id);
    }
    await fetchMerchants();
  } catch (error) {
    console.error("Lỗi khi thay đổi trạng thái:", error);
  }
};

// Helpers cho UI
const getPlanBadgeClass = (plan: string | undefined | null) => {
  // 1. Chuyển về lowercase, nếu null/undefined thì dùng 'default'
  const planKey = (plan || 'default').toLowerCase();
  
  const configs: Record<string, string> = {
    'trial': 'bg-blue-100 text-blue-800',
    'basic': 'bg-green-100 text-green-800',
    'pro': 'bg-purple-100 text-purple-800',
    'enterprise': 'bg-indigo-100 text-indigo-800',
    'default': 'bg-gray-100 text-gray-800'
  };
  
  return configs[planKey] || configs['default'];
};

onMounted(() => fetchMerchants());
</script>

<template>
  <div class="space-y-6 p-6">
    <div class="bg-white p-6 rounded-lg shadow-sm flex justify-between items-center">
      <h1 class="text-xl font-bold text-gray-800">Quản lý Merchant</h1>
      <button class="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 transition">
        + Thêm Merchant mới
      </button>
    </div>

    <div class="bg-white p-6 rounded-lg shadow-sm">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label class="block text-xs font-medium text-gray-500 uppercase mb-1">Tìm kiếm</label>
          <input 
            v-model="filters.search" 
            @keyup.enter="handleSearch"
            type="text" 
            placeholder="Tên, Email, Mã số thuế..." 
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
          />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-500 uppercase mb-1">Gói dịch vụ</label>
          <select v-model="filters.status" @change="handleSearch" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm">
            <option value="all">Tất cả gói</option>
            <option value="trial">Dùng thử</option>
            <option value="subscribed">Đã đăng ký</option>
            <option value="expired">Hết hạn</option>
          </select>
        </div>
      </div>

      <div class="overflow-x-auto relative min-h-[400px]">
        <div v-if="isLoading" class="absolute inset-0 bg-white/75 flex items-center justify-center z-10">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
        </div>

        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doanh nghiệp</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gói / Slug</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hết hạn</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody v-if="merchantsData?.data?.length" class="bg-white divide-y divide-gray-200">
            <tr v-for="merchant in merchantsData?.data" :key="merchant.id">
                <td class="px-4 py-4 whitespace-nowrap">
                <div class="flex flex-col" v-if="merchant">
                    <span class="text-sm font-semibold text-gray-900">{{ merchant.name }}</span>
                    <span class="text-xs text-gray-500">{{ merchant.email }}</span>
                </div>
                </td>

                <td class="px-4 py-4 whitespace-nowrap">
                <span v-if="merchant" 
                    :class="getPlanBadgeClass(merchant.plan_type)" 
                    class="px-2 py-0.5 rounded text-[10px] font-bold uppercase mr-2"
                >
                    {{ merchant.plan_type || 'TRIAL' }}
                </span>
                </td>

                <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                <template v-if="merchant">
                    <span v-if="merchant.is_trial">
                    {{ merchant.trial_ends_at ? formatDateTime(merchant.trial_ends_at) : '---' }}
                    </span>
                    <span v-else>
                    {{ merchant.subscription_ends_at ? formatDateTime(merchant.subscription_ends_at) : '---' }}
                    </span>
                </template>
                </td>

                <td class="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button v-if="merchant" @click="toggleStatus(merchant)" class="text-amber-600 hover:text-amber-900 mx-2">
                    {{ merchant.is_active ? 'Hoạt động' : 'Ngưng hoạt động' }}
                </button>
                </td>
            </tr>
            </tbody>
        </table>

        <div v-if="merchantsData?.data.length === 0 && !isLoading" class="text-center py-12 text-gray-500">
          Không tìm thấy merchant nào.
        </div>
      </div>

      <div class="mt-6 border-t pt-6">
        <BasePagination 
          :pagination-data="merchantsData" 
          :max-visible-pages="7"
          @change-page="handlePageChange" 
        />
      </div>
    </div>
  </div>
</template>