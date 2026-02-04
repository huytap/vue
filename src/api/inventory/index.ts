import type {CalculationHistoryItem, SaveCalculationRequest, SaveCalculationResponse} from './types';
import axiosClient from '../axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7300/v1';

export const inventoryApi = {
  /**
   * Get calculation history for current user
   */
  async getHistory(): Promise<CalculationHistoryItem[]> {
    const response = await axiosClient.get<CalculationHistoryItem[]>('/inventory/history');
    return response.data;
  },

  /**
   * Get specific calculation by ID
   */
  async getCalculation(id: number): Promise<CalculationHistoryItem> {
    const response = await axiosClient.get<CalculationHistoryItem>(`/inventory/${id}`);
    return response.data;
  },

  /**
   * Save calculation to history
   */
  async saveCalculation(data: SaveCalculationRequest): Promise<SaveCalculationResponse> {
    const response = await axiosClient.post<SaveCalculationResponse>('/inventory/save', data);
    return response.data;
  },

  /**
   * Delete calculation from history
   */
  async deleteCalculation(id: number): Promise<void> {
    await axiosClient.delete(`/inventory/${id}`);
  },

  /**
   * Get all calculations (admin only)
   */
  async getAllCalculations(): Promise<CalculationHistoryItem[]> {
    const response = await axiosClient.get<CalculationHistoryItem[]>('/inventory/all');
    return response.data;
  },
};

export default inventoryApi;
