export interface InventoryItem {
  rollCode: string;
  brand: string;
  gsm: number;
  width: number;
  weight: number;
  paperType: string;
  sheet?: string;
}

export interface Order {
  type: 'approved' | 'forecast';
  orderCode: string;
  customer: string;
  product: string;
  gsm: number;
  rollWidth: number;
  cutWidth: number;
  quantity: number;
  units: number;
  weight: number;
  paperType: string;
}

export interface OptimalRoll extends InventoryItem {
  usedWidth: number;
  cutsPerRoll: number;
  waste: number;
  score: number;
  scenario: 'Gốc' | 'Đảo chiều';
}

export interface CalculatedOrder extends Order {
  inventoryWeight: number;
  inventoryDetails: InventoryItem[];
  checkTon: OptimalRoll[];
  selectedRoll: OptimalRoll | null;
}

export interface CalculationFilters {
  customer: string;
  gsm: string;
  orderType: 'all' | 'approved' | 'forecast';
  location: 'NM1' | 'NM2';
}

// ==================== API REQUEST/RESPONSE TYPES ====================

export interface CalculationHistoryItem {
  id: number;
  userId: number;
  userName?: string;
  createdAt: string;
  filters: CalculationFilters;
  resultsSummary: {
    totalOrders: number;
    totalWeight: number;
    approvedCount: number;
    forecastCount: number;
  };
}

export interface SaveCalculationRequest {
  filters: CalculationFilters;
  resultsSummary: {
    totalOrders: number;
    totalWeight: number;
    approvedCount: number;
    forecastCount: number;
  };
  orders: Array<{
    orderCode: string;
    customer: string;
    product: string;
    gsm: number;
    weight: number;
    selectedRollCode: string | null;
    selectedBrand: string | null;
    waste: number | null;
  }>;
}

export interface SaveCalculationResponse {
  id: number;
  message: string;
}