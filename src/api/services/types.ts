export interface Service {
  id: number;
  merchant_id: number;
  name: string;
  slug: string;
  duration_minutes: number;
  price: number; // Hoặc string nếu bạn muốn xử lý độ chính xác cao từ DECIMAL
  description: string | null;
  is_active: number | boolean; // TINYINT thường dùng cho boolean (0 hoặc 1)
  created_at: string;
  updated_at: string;
}