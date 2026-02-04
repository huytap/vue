import * as XLSX from 'xlsx';
import type { InventoryItem, Order } from '@/api/inventory/types';

/**
 * Đọc file Excel tồn kho
 * Hỗ trợ đọc nhiều sheets
 */
export async function readInventoryFile(file: File): Promise<InventoryItem[]> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);
    const workbook = XLSX.read(data, { 
      type: 'array', 
      cellFormula: false, 
      cellDates: true 
    });

    const allRows: InventoryItem[] = [];

    // Đọc tất cả các sheets
    workbook.SheetNames.forEach(sheetName => {
      console.log('Đang đọc sheet:', sheetName);
      
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: null });

      jsonData.forEach((row: any) => {
        // Xử lý tên cột có thể có khoảng trắng
        const totalWeight = getValueTrimmed(row, 'Total Weight');
        const gsm = row['GSM'];
        
        // Chỉ thêm dòng hợp lệ (có GSM và Total Weight)
        if (gsm && totalWeight) {
          allRows.push({
            rollCode: row['MÃ VẬT TƯ'] || 'N/A',
            brand: row['Hiệu Giấy'] || 'N/A',
            gsm: parseFloat(gsm),
            width: parseFloat(row['Kích Thước']) || 0,
            weight: parseFloat(totalWeight) || 0,
            paperType: row['Loại Giấy'] || '',
            sheet: sheetName, // Lưu tên sheet để debug
          });
        }
      });
    });

    console.log(`✅ Đọc được ${allRows.length} dòng tồn kho từ ${workbook.SheetNames.length} sheets`);
    return allRows;
  } catch (error) {
    console.error('Error reading inventory file:', error);
    throw new Error(`Lỗi đọc file tồn kho: ${(error as Error).message}`);
  }
}

/**
 * Đọc file Excel đơn hàng
 * Chỉ đọc sheet đầu tiên
 */
export async function readOrderFile(file: File): Promise<Order[]> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);
    const workbook = XLSX.read(data, { 
      type: 'array', 
      cellFormula: false, 
      cellDates: true 
    });

    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: null });

    const orders: Order[] = [];

    jsonData.forEach((row: any) => {
      // Phân loại loại đơn hàng
      const loaiDonHang = String(row['Loại ĐH'] || '').toLowerCase();
      const isForecast = loaiDonHang.includes('forecast') || 
                        loaiDonHang.includes('dự báo');

      // Parse order data
      const order: Order = {
        type: isForecast ? 'forecast' : 'approved',
        orderCode: row['Mã DHB'] || 'N/A',
        customer: row['Khách hàng'] || 'N/A',
        product: row['Tên sản phẩm'] || 'N/A',
        gsm: parseFloat(row['gsm']) || 0,
        rollWidth: parseFloat(row['Cuồn (cm)']) || 0,
        cutWidth: parseFloat(row['Cắt tới (cm)']) || 0,
        quantity: parseFloat(row['SL ĐH']) || 0,
        units: parseFloat(row['số đv']) || 1,
        weight: 0, // Will be calculated later
        paperType: row['Loại giấy'] || '',
      };

      orders.push(order);
    });

    console.log(`✅ Đọc được ${orders.length} đơn hàng`);
    return orders;
  } catch (error) {
    console.error('Error reading order file:', error);
    throw new Error(`Lỗi đọc file đơn hàng: ${(error as Error).message}`);
  }
}

/**
 * Hàm helper: Lấy giá trị từ object với key có thể có khoảng trắng
 */
function getValueTrimmed(row: any, key: string): any {
  // Tìm key chính xác hoặc key có khoảng trắng
  const foundKey = Object.keys(row).find(k => k.trim() === key);
  return foundKey ? row[foundKey] : null;
}

/**
 * Validate file Excel
 */
export function validateExcelFile(file: File): { valid: boolean; error?: string } {
  // Check file extension
  const validExtensions = ['.xlsx', '.xls'];
  const fileName = file.name.toLowerCase();
  const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
  
  if (!hasValidExtension) {
    return {
      valid: false,
      error: 'File không đúng định dạng. Vui lòng chọn file .xlsx hoặc .xls',
    };
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File quá lớn. Kích thước tối đa là 10MB',
    };
  }

  return { valid: true };
}
