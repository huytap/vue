<template>
  <div class="stats-grid">
    <!-- Total Orders -->
    <div class="stat-card stat-card-primary">
      <div class="stat-icon">📦</div>
      <div class="stat-content">
        <div class="stat-label">Tổng số đơn hàng</div>
        <div class="stat-value">{{ totalOrders }}</div>
      </div>
    </div>

    <!-- Approved Orders -->
    <div class="stat-card stat-card-success">
      <div class="stat-icon">✅</div>
      <div class="stat-content">
        <div class="stat-label">Đơn hàng đã duyệt</div>
        <div class="stat-value">{{ approvedCount }}</div>
      </div>
    </div>

    <!-- Forecast Orders -->
    <div class="stat-card stat-card-warning">
      <div class="stat-icon">🔮</div>
      <div class="stat-content">
        <div class="stat-label">Đơn hàng forecast</div>
        <div class="stat-value">{{ forecastCount }}</div>
      </div>
    </div>

    <!-- Total Weight -->
    <div class="stat-card stat-card-info">
      <div class="stat-icon">⚖️</div>
      <div class="stat-content">
        <div class="stat-label">Trọng lượng tổng</div>
        <div class="stat-value">{{ formatWeight(totalWeight) }} kg</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {formatWeight} from '@/utils/format'
interface Props {
  totalOrders: number;
  approvedCount: number;
  forecastCount: number;
  totalWeight: number;
}

defineProps<Props>();
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.stat-card-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.stat-card-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.stat-card-warning {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: white;
}

.stat-card-info {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.stat-icon {
  font-size: 3rem;
  opacity: 0.9;
}

.stat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-label {
  font-size: 0.875rem;
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
}

/* Responsive */
@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .stat-icon {
    font-size: 2.5rem;
  }
  
  .stat-value {
    font-size: 1.75rem;
  }
}
</style>
