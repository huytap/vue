// services/merchants/index.ts
import axiosClient from '../axios';
import type { Merchant, MerchantFilters } from './types';
import type { ApiResponse, PaginatedResponse } from '../types';

export const merchantApi = {
  // Lấy danh sách phân trang
  getList(params: MerchantFilters) {
    return axiosClient.get<ApiResponse<PaginatedResponse<Merchant>>>('/merchants/index', { params });
  },
  // Lấy chi tiết một merchant
  getDetail(id: number | string) {
    return axiosClient.get<Merchant>(`/merchants/${id}`);
  },

  // Tạo mới
  create(data: Partial<Merchant>) {
    return axiosClient.post<Merchant>('/merchants', data);
  },

  // Cập nhật
  update(id: number | string, data: Partial<Merchant>) {
    return axiosClient.put<Merchant>(`/merchants/${id}`, data);
  },

  // Các hành động đặc thù (Methods từ Laravel model)
  suspend(id: number) {
    return axiosClient.post<Merchant>(`/merchants/${id}/suspend`);
  },

  activate(id: number | string) {
    return axiosClient.post<Merchant>(`/merchants/${id}/activate`);
  },

  extendTrial(id: number | string, days: number = 30) {
    return axiosClient.post<Merchant>(`/merchants/${id}/extend-trial`, { days });
  },

  startSubscription(id: number | string, payload: { plan_type: string; months: number }) {
    return axiosClient.post<Merchant>(`/merchants/${id}/subscribe`, payload);
  }
};