<template>
  <div class="calculator-view">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">
        <span class="title-icon">🏭</span>
        Tính Toán Tồn Kho Giấy
      </h1>
      <p class="page-subtitle">
        Quản lý và tính toán số lượng giấy cần dùng cho đơn hàng
      </p>
    </div>

    <!-- File Upload Section -->
    <div class="section-card">
      <h2 class="section-title">📁 Tải lên file Excel</h2>
      <div class="upload-grid">
        <FileUploader
          title="File Tồn Kho"
          icon="📦"
          :is-loading="isLoadingInventory"
          :error="inventoryError"
          @file-selected="handleInventoryFile"
        />
        <FileUploader
          title="File Đơn Hàng"
          icon="📋"
          :is-loading="isLoadingOrders"
          :error="ordersError"
          @file-selected="handleOrderFile"
        />
      </div>
    </div>

    <!-- Filter Section -->
    <div v-if="store.canCalculate" class="section-card">
      <FilterPanel
        :customers="store.customers"
        :can-calculate="store.canCalculate"
        :filters="store.filters"
        @calculate="handleCalculate"
        @update:filters="handleFiltersUpdate"
      />
    </div>

    <!-- Loading State -->
    <div v-if="store.isCalculating" class="loading-container">
      <div class="spinner-large"></div>
      <p class="loading-text">Đang tính toán tối ưu...</p>
      <p class="loading-subtext">Vui lòng chờ trong giây lát</p>
    </div>

    <!-- Results Section -->
    <div v-else-if="hasResults" class="results-section">
      <!-- Stats Cards -->
      <StatsCards 
        :total-orders="store.calculatedOrders.length"
        :approved-count="store.approvedOrders.length"
        :forecast-count="store.forecastOrders.length"
        :total-weight="store.totalWeight"
      />

      <!-- Approved Orders -->
      <div v-if="store.approvedOrders.length > 0" class="orders-section">
        <h2 class="orders-title">
          <span class="orders-icon">📋</span>
          <span>Đơn Hàng Đã Duyệt</span>
          <span class="orders-count approved-count">
            {{ store.approvedOrders.length }}
          </span>
        </h2>
        <div class="orders-list">
          <OrderCard
            v-for="(order, index) in store.approvedOrders"
            :key="`approved-${index}`"
            :order="order"
            :index="index"
            :selected-rolls="selectedRolls.get(index) || [0]"
            @update:selected-rolls="handleRollSelectionChange"
          />
        </div>
      </div>

      <!-- Forecast Orders -->
      <div v-if="store.forecastOrders.length > 0" class="orders-section">
        <h2 class="orders-title">
          <span class="orders-icon">🔮</span>
          <span>Đơn Hàng Forecast</span>
          <span class="orders-count forecast-count">
            {{ store.forecastOrders.length }}
          </span>
        </h2>
        <div class="orders-list">
          <OrderCard
            v-for="(order, index) in store.forecastOrders"
            :key="`forecast-${index}`"
            :order="order"
            :index="index + store.approvedOrders.length"
            :selected-rolls="selectedRolls.get(index) || [0]"
            @update:selected-rolls="handleRollSelectionChange"
          />
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <button
          @click="handleSaveToHistory"
          class="action-button save-button"
          :disabled="isSaving"
        >
          <span class="button-icon">💾</span>
          <span>{{ isSaving ? 'Đang lưu...' : 'Lưu lịch sử' }}</span>
        </button>
        
        <button
          @click="handleExport"
          class="action-button export-button"
          :disabled="isExporting"
        >
          <span class="button-icon">📥</span>
          <span>{{ isExporting ? 'Đang export...' : 'Export Excel' }}</span>
        </button>
      </div>
    </div>

    <!-- Empty State (when no files uploaded yet) -->
    <div v-else-if="!store.isInventoryLoaded && !store.isOrdersLoaded" class="empty-state">
      <div class="empty-icon">📂</div>
      <h3 class="empty-title">Bắt đầu tính toán</h3>
      <p class="empty-description">
        Vui lòng tải lên file Excel tồn kho và file đơn hàng để bắt đầu
      </p>
    </div>

    <!-- Toast Notifications -->
    <transition name="toast">
      <div v-if="toast.show" class="toast" :class="`toast-${toast.type}`">
        <span class="toast-icon">{{ toast.icon }}</span>
        <span class="toast-message">{{ toast.message }}</span>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import { useInventoryStore } from '@/stores/inventoryCalcStore';
import { readInventoryFile, readOrderFile, validateExcelFile } from '@/utils/inventorycalc/excelReader';
import { 
  calculateOrders, 
  filterOrders, 
  calculateWeight,
  validateCalculationData, 
  selectOptimalRoll
} from '@/utils/inventorycalc/inventoryCalculator';
import { exportSelectedToExcel } from '@/utils/inventorycalc/excelExporter';
import FileUploader from '@/components/inventorycalc/FileUploader.vue';
import FilterPanel from '@/components/inventorycalc/FilterPanel.vue';
import StatsCards from '@/components/inventorycalc/StatsCards.vue';
import OrderCard from '@/components/inventorycalc/OrderCard.vue';
import type { CalculationFilters } from '@/api/inventory/types';

const store = useInventoryStore();

// UI States
const isLoadingInventory = ref(false);
const isLoadingOrders = ref(false);
const inventoryError = ref<string | null>(null);
const ordersError = ref<string | null>(null);
const isSaving = ref(false);
const isExporting = ref(false);

// Toast notification
const toast = reactive({
  show: false,
  type: 'success' as 'success' | 'error' | 'info',
  icon: '',
  message: '',
});

const hasResults = computed(() => store.calculatedOrders.length > 0);

// Show toast notification
const showToast = (type: 'success' | 'error' | 'info', message: string) => {
  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
  };
  
  toast.type = type;
  toast.icon = icons[type];
  toast.message = message;
  toast.show = true;

  setTimeout(() => {
    toast.show = false;
  }, 3000);
};

// Handle inventory file upload
const handleInventoryFile = async (file: File) => {
  // Validate file
  const validation = validateExcelFile(file);
  if (!validation.valid) {
    inventoryError.value = validation.error || 'File không hợp lệ';
    return;
  }

  isLoadingInventory.value = true;
  inventoryError.value = null;

  try {
    const items = await readInventoryFile(file);
    store.setInventoryItems(items);
    showToast('success', `✅ Đọc được ${items.length} dòng tồn kho`);
  } catch (error) {
    inventoryError.value = (error as Error).message;
    showToast('error', 'Lỗi đọc file tồn kho');
    console.error('Error reading inventory file:', error);
  } finally {
    isLoadingInventory.value = false;
  }
};

// Handle order file upload
const handleOrderFile = async (file: File) => {
  // Validate file
  const validation = validateExcelFile(file);
  if (!validation.valid) {
    ordersError.value = validation.error || 'File không hợp lệ';
    return;
  }

  isLoadingOrders.value = true;
  ordersError.value = null;

  try {
    const orders = await readOrderFile(file);
    
    // Calculate weight for each order
    const ordersWithWeight = orders.map(order => ({
      ...order,
      weight: calculateWeight(order),
    }));
    
    store.setOrders(ordersWithWeight);
    showToast('success', `✅ Đọc được ${orders.length} đơn hàng`);
  } catch (error) {
    ordersError.value = (error as Error).message;
    showToast('error', 'Lỗi đọc file đơn hàng');
    console.error('Error reading order file:', error);
  } finally {
    isLoadingOrders.value = false;
  }
};

// Handle filters update
const handleFiltersUpdate = (filters: CalculationFilters) => {
  store.setFilters(filters);
};

// Handle calculate
const handleCalculate = (filters: CalculationFilters) => {
  store.setCalculating(true);

  try {
    // Validate data
    const validation = validateCalculationData(store.orders, store.inventoryItems);
    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
    }

    // Filter orders based on filters
    const filtered = filterOrders(store.orders, filters);

    if (filtered.length === 0) {
      throw new Error('Không có đơn hàng nào phù hợp với bộ lọc');
    }

    // Calculate optimal rolls for each order
    const calculated = calculateOrders(
      filtered,
      store.inventoryItems,
      filters.location
    );

    store.setCalculatedOrders(calculated);
    
    showToast('success', `✅ Tính toán xong ${calculated.length} đơn hàng`);
    
    // Scroll to results
    setTimeout(() => {
      const resultsSection = document.querySelector('.results-section');
      if (resultsSection) {
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  } catch (error) {
    console.error('Error calculating orders:', error);
    showToast('error', (error as Error).message);
  } finally {
    store.setCalculating(false);
  }
};

// Track selected rolls for each order
// Map structure: orderIndex -> array of selected roll indexes
const selectedRolls = ref<Map<number, number[]>>(new Map());

// Initialize default selections (first roll selected for each order)
store.calculatedOrders.forEach((_, index) => {
  selectedRolls.value.set(index, [0]);
});

/**
 * Handle when user changes roll selection in an order card
 */
const handleRollSelectionChange = (orderIndex: number, rollIndexes: number[]) => {
  selectedRolls.value.set(orderIndex, rollIndexes);
  console.log(selectedRolls.value);
};
// Handle export to Excel
const handleExport = async () => {
  //if (store.calculatedOrders.length === 0) {
  // if(selectedRolls.value){
  //   showToast('error', 'Không có dữ liệu để export');
  //   return;
  // }

  isExporting.value = true;

  try {
    //await exportToExcel(store.calculatedOrders);
    await exportSelectedToExcel(store.calculatedOrders, selectedRolls.value);
    showToast('success', '✅ Export Excel thành công');
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    showToast('error', 'Lỗi khi export Excel');
  } finally {
    isExporting.value = false;
  }
};

// Handle save to history
const handleSaveToHistory = async () => {
  isSaving.value = true;

  try {
    const response = await store.saveCalculation();
    showToast('success', `✅ Đã lưu vào lịch sử (ID: ${response.id})`);
  } catch (error) {
    console.error('Error saving to history:', error);
    showToast('error', 'Lỗi khi lưu lịch sử');
  } finally {
    isSaving.value = false;
  }
};
</script>

<style scoped>
.calculator-view {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem;
}

/* Page Header */
.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 0.75rem;
  padding: 2rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.title-icon {
  font-size: 2.5rem;
}

.page-subtitle {
  font-size: 1.125rem;
  opacity: 0.95;
  margin: 0;
}

/* Section Card */
.section-card {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 1.5rem 0;
}

.upload-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

/* Loading Container */
.loading-container {
  background: white;
  border-radius: 0.75rem;
  padding: 4rem 2rem;
  text-align: center;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.spinner-large {
  width: 4rem;
  height: 4rem;
  border: 4px solid #e5e7eb;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1.5rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.loading-subtext {
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
}

/* Results Section */
.results-section {
  margin-top: 1.5rem;
}

.orders-section {
  margin-bottom: 2rem;
}

.orders-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 1.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.orders-icon {
  font-size: 1.75rem;
}

.orders-count {
  padding: 0.25rem 0.875rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 700;
}

.approved-count {
  background: #10b981;
  color: white;
}

.forecast-count {
  background: #fbbf24;
  color: #78350f;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  flex-wrap: wrap;
}

.action-button {
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
}

.action-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
}

.action-button:active:not(:disabled) {
  transform: translateY(0);
}

.action-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.save-button {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.export-button {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.button-icon {
  font-size: 1.25rem;
}

/* Empty State */
.empty-state {
  background: white;
  border-radius: 0.75rem;
  padding: 4rem 2rem;
  text-align: center;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.empty-icon {
  font-size: 5rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.75rem 0;
}

.empty-description {
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
}

/* Toast Notifications */
.toast {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  padding: 1rem 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
  z-index: 1000;
  max-width: 400px;
}

.toast-success {
  background: #10b981;
  color: white;
}

.toast-error {
  background: #ef4444;
  color: white;
}

.toast-info {
  background: #3b82f6;
  color: white;
}

.toast-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.toast-message {
  flex: 1;
}

/* Toast Animation */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  transform: translateY(2rem);
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .calculator-view {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 1.5rem;
    flex-direction: column;
  }
  
  .upload-grid {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
    width: 100%;
  }
  
  .action-button {
    width: 100%;
    justify-content: center;
  }
  
  .toast {
    left: 1rem;
    right: 1rem;
    bottom: 1rem;
  }
}
</style>
