<template>
  <div class="filter-panel">
    <h3 class="panel-title">🔍 Bộ lọc tính toán</h3>
    
    <div class="filter-grid">
      <!-- Customer Filter -->
      <div class="filter-group">
        <label class="filter-label">Khách hàng</label>
        <select 
          v-model="localFilters.customer"
          class="filter-input"
        >
          <option value="">-- Tất cả --</option>
          <option v-for="customer in customers" :key="customer" :value="customer">
            {{ customer }}
          </option>
        </select>
      </div>

      <!-- GSM Filter -->
      <div class="filter-group">
        <label class="filter-label">Định lượng (GSM)</label>
        <input
          v-model="localFilters.gsm"
          type="text"
          placeholder="VD: 160, 180, 200"
          class="filter-input"
        />
      </div>

      <!-- Order Type Filter -->
      <!-- <div class="filter-group">
        <label class="filter-label">Loại đơn hàng</label>
        <select 
          v-model="localFilters.orderType"
          class="filter-input"
        >
          <option value="all">Tất cả</option>
          <option value="approved">Đã duyệt</option>
          <option value="forecast">Forecast</option>
        </select>
      </div> -->

      <!-- Location Filter -->
      <div class="filter-group">
        <label class="filter-label">Đảo chiều</label>
        <select 
          v-model="localFilters.location"
          class="filter-input"
        >
          <option value="NM1">Có (NM1)</option>
          <option value="NM2">Không (NM2)</option>
        </select>
      </div>
    </div>

    <button
      @click="handleCalculate"
      :disabled="!canCalculate"
      class="calculate-button"
      :class="{ disabled: !canCalculate }"
    >
      <span class="button-icon">📊</span>
      <span>Tính Toán</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { CalculationFilters } from '@/api/inventory/types';

interface Props {
  customers: string[];
  canCalculate: boolean;
  filters: CalculationFilters;
}

interface Emits {
  (e: 'calculate', filters: CalculationFilters): void;
  (e: 'update:filters', filters: CalculationFilters): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const localFilters = ref<CalculationFilters>({ ...props.filters });

// Sync local filters with props
watch(() => props.filters, (newFilters) => {
  localFilters.value = { ...newFilters };
}, { deep: true });

// Emit changes to parent
watch(localFilters, (newFilters) => {
  //emit('update:filters', newFilters);
  // Only emit if actually different from props
  if (JSON.stringify(newFilters) !== JSON.stringify(props.filters)) {
    emit('update:filters', newFilters);
  }
}, { deep: true });

const handleCalculate = () => {
  emit('calculate', localFilters.value);
};
</script>

<style scoped>
.filter-panel {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}

.panel-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 1.5rem 0;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.filter-input {
  padding: 0.625rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 1rem;
  color: #1f2937;
  transition: all 0.2s ease;
}

.filter-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.filter-input::placeholder {
  color: #9ca3af;
}

.calculate-button {
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.875rem 1.5rem;
  font-size: 1.125rem;
  font-weight: 700;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.calculate-button:hover:not(.disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.calculate-button:active:not(.disabled) {
  transform: translateY(0);
}

.calculate-button.disabled {
  background: #9ca3af;
  cursor: not-allowed;
  opacity: 0.6;
}

.button-icon {
  font-size: 1.25rem;
}

/* Responsive */
@media (max-width: 768px) {
  .filter-grid {
    grid-template-columns: 1fr;
  }
}
</style>
