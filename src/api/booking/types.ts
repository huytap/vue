import type { Service } from "../services/types";
import type { BaseFilters } from "../types";
import type { User } from "../user/types";
import type { BookingStatus, TimeRange } from "./enums";

export interface Booking {
  id: number;
  merchant_id: number;
  uuid: string;
  service: Service;
  staff_id: number;
  
  start_time: string; // DATETIME được biểu diễn dưới dạng ISO string
  end_time: string;

  client_name: string;
  client_phone: string;
  client_email: string;

  contact_source: 'web' | 'phone' | 'walk-in'; // ENUM: Giả định các giá trị này, bạn có thể sửa lại
  
  deposit_amount: number; // DECIMAL: Dùng number, JS không có decimal type riêng biệt

  // Các trường thời gian khác
  deposit_received_at?: string; // Dấu ? vì có thể null (chưa nhận cọc)

  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'; // ENUM: Giả định các trạng thái

  completed_at?: string; // Có thể null
  cancelled_at?: string; // Có thể null
  notes?: string; // TEXT: Có thể là chuỗi dài hoặc null

  created_at: string;
  updated_at: string;
  
  client_id: number;
  user: User;
}
export interface BookingFilters extends BaseFilters{
    time_range?: TimeRange,
    status?: BookingStatus,
    staff_id?: number | 'all';
}