import { defineStore } from 'pinia';
import type { InventoryItem, Order, CalculatedOrder, CalculationFilters,CalculationHistoryItem,SaveCalculationRequest} from '@/api/inventory/types';
import {inventoryApi} from '@/api/inventory/index'
interface InventoryState {
  // File data
  inventoryItems: InventoryItem[];
  orders: Order[];
  
  // Calculation results
  calculatedOrders: CalculatedOrder[];
  filters: CalculationFilters;
  
  // UI state
  isInventoryLoaded: boolean;
  isOrdersLoaded: boolean;
  isCalculating: boolean;
  
  // History (from API)
  calculationHistory: CalculationHistoryItem[];
  isLoadingHistory: boolean;
}

export const useInventoryStore = defineStore('inventory', {
  state: (): InventoryState => ({
    inventoryItems: [],
    orders: [],
    calculatedOrders: [],
    filters: {
      customer: '',
      gsm: '',
      orderType: 'all',
      location: 'NM2',
    },
    isInventoryLoaded: false,
    isOrdersLoaded: false,
    isCalculating: false,
    calculationHistory: [],
    isLoadingHistory: false,
  }),

  getters: {
    /**
     * Can calculate if both files are loaded
     */
    canCalculate: (state): boolean => {
      return state.isInventoryLoaded && state.isOrdersLoaded;
    },

    /**
     * Get approved orders from calculated results
     */
    approvedOrders: (state): CalculatedOrder[] => {
      return state.calculatedOrders.filter(o => o.type === 'approved');
    },

    /**
     * Get forecast orders from calculated results
     */
    forecastOrders: (state): CalculatedOrder[] => {
      return state.calculatedOrders.filter(o => o.type === 'forecast');
    },

    /**
     * Calculate total weight of all calculated orders
     */
    totalWeight: (state): number => {
      return state.calculatedOrders.reduce((sum, o) => sum + o.weight, 0);
    },

    /**
     * Get inventory items by GSM and paper type
     */
    getInventoryByGsm: (state) => {
      return (gsm: number, paperType: string): InventoryItem[] => {
        return state.inventoryItems.filter(
          item => item.gsm === gsm && item.paperType === paperType
        );
      };
    },

    /**
     * Get total inventory weight by GSM and paper type
     */
    getTotalInventoryWeight: (state) => {
      return (gsm: number, paperType: string): number => {
        return state.inventoryItems
          .filter(item => item.gsm === gsm && item.paperType === paperType)
          .reduce((sum, item) => sum + item.weight, 0);
      };
    },

    /**
     * Get unique list of customers from orders
     */
    customers: (state): string[] => {
      const uniqueCustomers = [...new Set(state.orders.map(o => o.customer))];
      return uniqueCustomers.filter(c => c && c !== 'N/A').sort();
    },

    /**
     * Get results summary for saving to API
     */
    resultsSummary: (state) => {
      return {
        totalOrders: state.calculatedOrders.length,
        totalWeight: state.calculatedOrders.reduce((sum, o) => sum + o.weight, 0),
        approvedCount: state.calculatedOrders.filter(o => o.type === 'approved').length,
        forecastCount: state.calculatedOrders.filter(o => o.type === 'forecast').length,
      };
    },
  },

  actions: {
    /**
     * Set inventory items from uploaded file
     */
    setInventoryItems(items: InventoryItem[]) {
      this.inventoryItems = items;
      this.isInventoryLoaded = true;
    },

    /**
     * Set orders from uploaded file
     */
    setOrders(orders: Order[]) {
      this.orders = orders;
      this.isOrdersLoaded = true;
    },

    /**
     * Set calculated orders after calculation
     */
    setCalculatedOrders(orders: CalculatedOrder[]) {
      this.calculatedOrders = orders;
    },

    /**
     * Update calculation filters
     */
    setFilters(filters: Partial<CalculationFilters>) {
      this.filters = { ...this.filters, ...filters };
    },

    /**
     * Set calculating state
     */
    setCalculating(value: boolean) {
      this.isCalculating = value;
    },

    /**
     * Clear inventory data
     */
    clearInventory() {
      this.inventoryItems = [];
      this.isInventoryLoaded = false;
    },

    /**
     * Clear orders data
     */
    clearOrders() {
      this.orders = [];
      this.isOrdersLoaded = false;
    },

    /**
     * Clear calculation results
     */
    clearResults() {
      this.calculatedOrders = [];
    },

    /**
     * Reset entire store
     */
    reset() {
      this.$reset();
    },

    // ==================== API ACTIONS ====================

    /**
     * Load calculation history from API
     */
    async loadHistory() {
      this.isLoadingHistory = true;
      try {
        this.calculationHistory = await inventoryApi.getHistory();
      } catch (error) {
        console.error('Error loading history:', error);
        throw error;
      } finally {
        this.isLoadingHistory = false;
      }
    },

    /**
     * Save current calculation to API
     */
    async saveCalculation() {
      if (this.calculatedOrders.length === 0) {
        throw new Error('Không có dữ liệu để lưu');
      }

      const data: SaveCalculationRequest = {
        filters: this.filters,
        resultsSummary: this.resultsSummary,
        orders: this.calculatedOrders.map(order => ({
          orderCode: order.orderCode,
          customer: order.customer,
          product: order.product,
          gsm: order.gsm,
          weight: order.weight,
          selectedRollCode: order.selectedRoll?.rollCode || null,
          selectedBrand: order.selectedRoll?.brand || null,
          waste: order.selectedRoll?.waste || null,
        })),
      };

      try {
        const response = await inventoryApi.saveCalculation(data);
        
        // Reload history after saving
        await this.loadHistory();
        
        return response;
      } catch (error) {
        console.error('Error saving calculation:', error);
        throw error;
      }
    },

    /**
     * Load specific calculation from history
     */
    async loadCalculation(id: number) {
      try {
        const calculation = await inventoryApi.getCalculation(id);
        // You can restore filters from history if needed
        this.filters = calculation.filters;
        return calculation;
      } catch (error) {
        console.error('Error loading calculation:', error);
        throw error;
      }
    },

    /**
     * Delete calculation from history
     */
    async deleteCalculation(id: number) {
      try {
        await inventoryApi.deleteCalculation(id);
        
        // Reload history after deleting
        await this.loadHistory();
      } catch (error) {
        console.error('Error deleting calculation:', error);
        throw error;
      }
    },
  },
});
