/**
 * Định dạng thời gian: DD/MM HH:mm hoặc HH:mm
 * @param dateStr Chuỗi ngày tháng từ Backend
 * @param includeDate Có bao gồm ngày/tháng không (mặc định có)
 */
export const formatDateTime = (dateStr: string | Date, includeDate: boolean = true): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);

  // Cấu hình định dạng
  const options: Intl.DateTimeFormatOptions = includeDate 
    ? { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }
    : { hour: '2-digit', minute: '2-digit', hour12: false };

  return new Intl.DateTimeFormat('vi-VN', options)
    .format(date)
    .replace(',', ''); // Loại bỏ dấu phẩy giữa ngày và giờ
};