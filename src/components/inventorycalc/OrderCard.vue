<template>
  <div class="order-card">
    <!-- Header Section -->
    <div class="order-header">
      <div class="order-title">
        <span class="order-icon">📦</span>
        <span class="order-number">#{{ index + 1 }}</span>
        <span class="order-code">{{ order.orderCode }}</span>
      </div>
      <span class="order-badge" :class="badgeClass">
        {{ badgeText }}
      </span>
    </div>

    <!-- Basic Info Grid -->
    <div class="info-section">
      <div class="info-row">
        <span class="info-label">Khách hàng:</span>
        <span class="info-value">{{ order.customer }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Sản phẩm:</span>
        <span class="info-value">{{ order.product }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Loại giấy:</span>
        <span class="info-value">{{ order.paperType }}</span>
        <span class="info-label">GSM:</span>
        <span class="info-value font-bold">{{ order.gsm }}</span>
      </div>
      <div class="info-row">
          <span class="info-label">Cuồn (cm):</span>
          <span class="info-value">{{ order.rollWidth }}</span>
          <span class="info-label">Cắt tới (cm):</span>
          <span class="info-value highlight">{{ order.cutWidth }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Số lượng ĐH:</span>
          <span class="info-value">{{ formatNumber(order.quantity) }}</span>
          <span class="info-label">Số đơn vị:</span>
          <span class="info-value">{{ order.units }}</span>
        </div>
    </div>

    <!-- Calculation Section -->
    <div class="calculation-section"> 
      <div class="calc-header">
        <span class="calc-icon">📊</span>
        <span class="calc-title">Tính toán số giấy cần sử dụng</span>
      </div>
      <div class="weight-summary">
        <div class="weight-row">
          <span>Trọng lượng cần (kg):</span>
          <span class="weight-value">{{ formatWeight(order.weight) }}</span>
        </div>
        <div class="weight-row">
          <span>Tồn kho hiện tại (kg):</span>
          <span class="weight-value">{{ formatWeight(order.inventoryWeight) }}</span>
        </div>
        <div class="weight-row difference-row">
          <span><strong>Chênh lệch (kg):</strong></span>
          <span class="weight-value" :style="{ color: differenceColor }">
            <strong>{{ differenceText }}</strong>
          </span>
        </div>
      </div>
    </div>

    <!-- Inventory Table -->
    <div class="inventory-table">
      <div class="calc-header">
        <span class="calc-icon">📦</span>
        <span class="calc-title">Chi tiết tồn kho & Quyết định (GSM: {{ order.gsm }})</span>
      </div>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Mã VT</th>
            <th>Hiệu</th>
            <th>GSM</th>
            <th>Rộng Cuộn (cm)</th>
            <th>Rộng Cắt Thực Tế (cm)</th>
            <th>Lãng Phí (cm)</th>
            <th>Trọng lượng (kg)</th>
            <th>Kịch Bản</th>
            <th>Ưu Tiên</th>
            <th>#</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="(roll, idx) in order.checkTon" 
            :key="idx"
            :class="{ 'selected-row': idx === 0 }"
          >
            <td>{{ idx + 1 }}</td>
            <td class="font-bold">{{ roll.rollCode || 'N/A' }}</td>
            <td>{{ roll.brand || 'N/A' }}</td>
            <td>{{ order.gsm }}</td>
            <td>{{ roll.width }}</td>
            <td class="highlight">{{ order.cutWidth }}</td>
            <td class="waste-cell">{{ formatWaste(roll.waste) }}</td>
            <td>{{ formatWeight(roll.weight || 0) }}</td>
            <td>
              <span class="scenario-badge" :class="scenarioBadgeClass(roll.scenario)">
                {{ roll.scenario }}
              </span>
            </td>
            <td>
              <span class="priority-badge" :class="priorityClass(idx)">
                {{ idx === 0 ? 'CHỌN' : 'Dự phòng' }}
              </span>
            </td>
            <td>
              <input 
                type="checkbox" 
                :checked="isRollSelected(idx)"
                @change="toggleRollSelection(idx)"
                class="checkbox"
              />
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="order.checkTon && order.checkTon.length > 0" class="table-footer">
        <div class="total-label">Tổng Tồn Kho:</div>
        <div class="total-value">{{ formatWeight(totalInventory) }} kg</div>
      </div>
    </div>

    <!-- Decision Summary -->
    <div v-if="order.selectedRoll" class="decision-box">
      <span class="decision-icon">🎯</span>
      <span class="decision-text">
        <strong>Quyết định:</strong> Chọn cuộn 
        <strong>{{ order.selectedRoll.rollCode || 'N/A' }}</strong> 
        ({{ order.selectedRoll.width }}cm) với lãng phí {{ formatWaste(order.selectedRoll.waste) }}cm 
        ({{ order.selectedRoll.scenario }}).
      </span>
    </div>

    <!-- No Roll Found -->
    <div v-else class="no-roll-box">
      <span class="no-roll-icon">❌</span>
      <span class="no-roll-text">Không tìm thấy cuộn giấy phù hợp</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { CalculatedOrder } from '@/api/inventory/types';
import {formatWeight, formatNumber, formatWaste} from '@/utils/format'

interface Props {
  order: CalculatedOrder;
  index: number;
  selectedRolls?: number[];
}
interface Emits {
  (e: 'update:selectedRolls', orderIndex: number, rollIndexes: number[]): void;
}
const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Local state for selected rolls (default to first roll)
const localSelectedRolls = ref<number[]>(props.selectedRolls || [0]);

const badgeText = computed(() => {
  return props.order.type === 'approved' ? 'Đã Duyệt' : 'Forecast';
});

const badgeClass = computed(() => {
  return props.order.type === 'approved' ? 'badge-approved' : 'badge-forecast';
});

const difference = computed(() => {
  return props.order.inventoryWeight - props.order.weight;
});

const differenceText = computed(() => {
  const diff = difference.value;
  return `${diff >= 0 ? '+' : ''}${formatWeight(diff)} kg`;
});

const differenceColor = computed(() => {
  return difference.value >= 0 ? '#dc2626' : '#16a34a';
});

const totalInventory = computed(() => {
  if (!props.order.checkTon) return 0;
  return props.order.checkTon.reduce((sum, roll) => sum + (roll.weight || 0), 0);
});

const isRollSelected = (rollIndex: number): boolean => {
  return localSelectedRolls.value.includes(rollIndex);
};
const toggleRollSelection = (rollIndex: number) => {
  const currentIndex = localSelectedRolls.value.indexOf(rollIndex);
  
  if (currentIndex > -1) {
    // Uncheck - remove from selection
    localSelectedRolls.value = localSelectedRolls.value.filter(idx => idx !== rollIndex);
  } else {
    // Check - add to selection
    localSelectedRolls.value = [...localSelectedRolls.value, rollIndex];
  }
  
  // Emit change to parent
  emit('update:selectedRolls', props.index, localSelectedRolls.value);
};
const scenarioBadgeClass = (scenario: string) => {
  return scenario === 'Đảo chiều' ? 'scenario-reversed' : 'scenario-normal';
};

const priorityClass = (index: number) => {
  return index === 0 ? 'priority-selected' : 'priority-backup';
};


</script>

<style scoped>
.order-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Header */
.order-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.order-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.125rem;
  font-weight: 700;
}

.order-icon {
  font-size: 1.5rem;
}

.order-badge {
  padding: 0.375rem 1rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 700;
  text-transform: uppercase;
}

.badge-approved {
  background: #10b981;
  color: white;
}

.badge-forecast {
  background: #fbbf24;
  color: #78350f;
}

/* Info Section */
.info-section {
  padding: 1.25rem 1.5rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
}

.info-row {
  display: flex;
  gap: 0.5rem;
}

.info-label {
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
}

.info-value {
  color: #1f2937;
  font-size: 0.875rem;
  font-weight: 600;
}

/* Calculation Section */
.calculation-section {
  padding: 1.5rem;
  background: #fef3c7;
  border-bottom: 2px solid #fbbf24;
}

.calc-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-weight: 700;
  color: #78350f;
  font-size: 1rem;
}

.calc-icon {
  font-size: 1.25rem;
}

.calc-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 0.375rem;
}

.calc-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.calc-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.calc-value {
  font-size: 0.875rem;
  font-weight: 700;
  color: #1f2937;
}

.calc-value.highlight {
  color: #7c3aed;
  font-size: 1rem;
}

.weight-summary {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  background: white;
  border-radius: 0.375rem;
}

.weight-row {
  display: flex;
  justify-content: space-between;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #f3f4f6;
  font-size: 0.875rem;
}

.weight-row:last-child {
  border-bottom: none;
}

.difference-row {
  margin-top: 0.5rem;
  padding-top: 0.75rem;
  border-top: 2px solid #fbbf24;
}

.weight-value {
  font-weight: 700;
}

/* Inventory Table */
.inventory-table {
  padding: 1.5rem;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

thead {
  background: #6366f1;
  color: white;
}

th {
  padding: 0.75rem 0.5rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.8rem;
  white-space: nowrap;
}

td {
  padding: 0.75rem 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}

tbody tr:hover {
  background: #f9fafb;
}

.selected-row {
  background: #fef3c7 !important;
  border-left: 4px solid #fbbf24;
}

.selected-row:hover {
  background: #fef3c7 !important;
}

.font-bold {
  font-weight: 700;
}

.highlight {
  color: #7c3aed;
  font-weight: 700;
}

.waste-cell {
  color: #dc2626;
  font-weight: 600;
}

.scenario-badge {
  display: inline-block;
  padding: 0.25rem 0.625rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 700;
  white-space: nowrap;
}

.scenario-normal {
  background: #dbeafe;
  color: #1e40af;
}

.scenario-reversed {
  background: #fce7f3;
  color: #9f1239;
}

.priority-badge {
  display: inline-block;
  padding: 0.25rem 0.625rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 700;
  white-space: nowrap;
}

.priority-selected {
  background: #10b981;
  color: white;
}

.priority-backup {
  background: #e5e7eb;
  color: #6b7280;
}

.checkbox {
  width: 1.125rem;
  height: 1.125rem;
  cursor: pointer;
}

.table-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
  padding: 1rem;
  background: #6366f1;
  color: white;
  border-radius: 0.375rem;
  font-weight: 700;
}

.total-label {
  font-size: 1rem;
}

.total-value {
  font-size: 1.125rem;
}

/* Decision Box */
.decision-box {
  margin: 1.5rem;
  padding: 1rem 1.25rem;
  background: #10b981;
  color: white;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.95rem;
}

.decision-icon {
  font-size: 1.5rem;
}

.no-roll-box {
  margin: 1.5rem;
  padding: 1rem 1.25rem;
  background: #fee2e2;
  border: 2px solid #ef4444;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #991b1b;
  font-weight: 700;
}

.no-roll-icon {
  font-size: 1.5rem;
}

/* Responsive */
@media (max-width: 768px) {
  .order-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .info-section {
    grid-template-columns: 1fr;
  }
  
  .calc-summary {
    grid-template-columns: 1fr;
  }
  
  table {
    font-size: 0.75rem;
  }
  
  th, td {
    padding: 0.5rem 0.25rem;
  }
}
</style>