export const FILTER_OPTIONS = {
  // Mapping Key-Value rõ ràng cho những trường cần Literal Type
  times: [
    { key: 'all' as const, value: 'Tất cả' },
    { key: 'today' as const, value: 'Hôm nay' },
    { key: 'week' as const, value: 'Tuần này' },
    { key: 'month' as const, value: 'Tháng này' },
  ],
  
  // Đối với status, bạn nên mapping từ text sang key của interface
  statuses: [
    { key: 'all' as const, value: 'Tất cả' },
    { key: 'confirmed' as const, value: 'Đã xác nhận' },
    { key: 'pending' as const, value: 'Chờ xác nhận' },
    { key: 'cancelled' as const, value: 'Đã hủy' },
  ],

  // Staffs thường sẽ lấy từ API, nhưng nếu là hardcode:
  staffs: [
    { key: 'all' as const, value: 'Tất cả nhân viên' },
    { key: 1, value: 'NV A' },
    { key: 2, value: 'NV B' },
  ]
};

export const STATUS_CONFIG = {
  pending: { label: 'Chờ xác nhận', class: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Đã xác nhận', class: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Đã hủy', class: 'bg-red-100 text-red-800' },
  completed: { label: 'Hoàn thành', class: 'bg-blue-100 text-blue-800' },
} as const;