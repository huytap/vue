import axiosClient from '../axios';
import type { Booking, BookingFilters } from './types'; // Nhớ import types
import type {PaginatedResponse} from '../types';

export const bookingApi = {
    
  getList(params: BookingFilters) {
    return axiosClient.get<PaginatedResponse<Booking>>('/bookings', { params });
  },

  // Hàm tạo mới lịch hẹn
  create(data: Partial<Booking>) {
    return axiosClient.post<Booking>('/bookings', data);
  },

  // Hàm lấy chi tiết
  getDetail(id: number) {
    return axiosClient.get<Booking>(`/bookings/${id}`);
  }
};
