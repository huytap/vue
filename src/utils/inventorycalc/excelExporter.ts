import * as ExcelJS from 'exceljs';
import type { CalculatedOrder } from '@/api/inventory/types';
import { sumInventoryByMaterial } from './inventoryCalculator';

/**
 * Export kết quả tính toán ra file Excel với styling
 * 
 * @param orders - Danh sách đơn hàng đã tính toán
 * @param fileName - Tên file (optional)
 */
export async function exportToExcel(
  orders: CalculatedOrder[],
  fileName?: string
): Promise<void> {
  if (!orders || orders.length === 0) {
    throw new Error('Không có dữ liệu để export!');
  }

  try {
    // Tạo workbook mới
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Tính toán tồn kho');

    // Định nghĩa columns
    worksheet.columns = [
      { header: 'STT', key: 'stt', width: 6 },
      { header: 'KHÁCH HÀNG', key: 'khachHang', width: 12 },
      { header: 'SẢN PHẨM', key: 'tenSP', width: 16 },
      { header: 'Tổng FC (sp)', key: 'FC', width: 20 },
      { header: 'Loại giấy', key: 'loaiGiay', width: 12 },
      { header: 'DL (gsm)', key: 'gsm', width: 8 },
      { header: 'Cuồn (cm)', key: 'cuon', width: 12 },
      { header: 'Cắt tới (cm)', key: 'catToi', width: 12 },
      { header: 'Số Kg', key: 'slSuDung', width: 15 },
      { header: 'Số Tờ', key: 'slTo', width: 15 },
      { header: 'Số ĐV/tờ', key: 'soDv', width: 8 },
      { header: 'Số SP', key: 'slDH', width: 15 },
      { header: 'Hiệu', key: 'hieuG', width: 15 },
      { header: 'Tồn kho (Kg)', key: 'tonKho', width: 15 },
      { header: 'Chênh lệch (Kg)', key: 'chenhLech', width: 15 },
      { header: '---', key: 'separator', width: 10 },
      { header: 'Mã VT', key: 'maVT', width: 16 },
      { header: 'Hiệu giấy', key: 'hieuGiay', width: 20 },
      { header: 'Rộng Cuộn (cm)', key: 'rongCuon', width: 14 },
      { header: 'Rộng Cắt (cm)', key: 'rongCat', width: 14 },
      { header: 'Lãng phí (cm)', key: 'langPhi', width: 12 },
      { header: 'Kịch bản', key: 'kichBan', width: 12 },
      { header: 'Trọng lượng Cuộn (Kg)', key: 'trongLuongCuon', width: 18 }
    ];

    // Style cho HEADER (dòng tiêu đề)
    const headerRow = worksheet.getRow(1);
    headerRow.height = 30;
    headerRow.font = { bold: true, size: 11, color: { argb: 'FF000000' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFB4C7E7' } // Xanh dương nhạt
    };
    headerRow.alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true
    };
    headerRow.border = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } }
    };

    // Thêm dữ liệu
    orders.forEach((order, index) => {
      const difference = order.inventoryWeight - order.weight;

      // Dòng thông tin đơn hàng chính
      const mainRow = worksheet.addRow({
        stt: index + 1,
        khachHang: order.customer || 'N/A',
        tenSP: order.product || 'N/A',
        FC: '',
        loaiGiay: order.paperType || 'N/A',
        gsm: order.gsm || 'N/A',
        cuon: order.rollWidth || 'N/A',
        catToi: order.cutWidth || 'N/A',
        slSuDung: order.weight ? parseFloat(order.weight.toFixed(2)) : 0,
        slTo: order.weight ? (order.weight / (order.gsm * order.rollWidth * order.cutWidth * 0.0000001)) : 0,
        soDv: order.units || 1,
        slDH: order.quantity || 0,
        hieuG: order.selectedRoll?.brand || 'N/A',
        tonKho: order.selectedRoll ? sumInventoryByMaterial(order.inventoryDetails, order.selectedRoll.rollCode) : 0,
        chenhLech: parseFloat(difference.toFixed(2)),
        separator: '===',
        maVT: '',
        hieuGiay: '',
        rongCuon: '',
        rongCat: '',
        langPhi: '',
        kichBan: '',
        trongLuongCuon: ''
      });

      // Style cho dòng chính
      mainRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      mainRow.border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      };

      // Thêm các dòng chi tiết tồn kho
      if (order.checkTon && order.checkTon.length > 0) {
        order.checkTon.forEach((detail, idx) => {
          const detailRow = worksheet.addRow({
            stt: '',
            khachHang: '',
            tenSP: '',
            FC: '',
            loaiGiay: '',
            gsm: '',
            cuon: '',
            catToi: '',
            slSuDung: '',
            slTo: '',
            soDv: '',
            slDH: '',
            hieuG: '',
            tonKho: '',
            chenhLech: '',
            separator: idx === 0 ? '→ CHỌN' : '→ Dự phòng',
            maVT: detail.rollCode || 'N/A',
            hieuGiay: detail.brand || 'N/A',
            rongCuon: detail.width || 'N/A',
            rongCat: detail.usedWidth || detail.width || 'N/A',
            langPhi: detail.waste !== undefined ? parseFloat(detail.waste.toFixed(2)) : 0,
            kichBan: detail.scenario || 'Gốc',
            trongLuongCuon: detail.weight ? parseFloat(detail.weight.toFixed(2)) : 0
          });

          // Style cho dòng chi tiết
          detailRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
          detailRow.border = {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          };

          // Highlight cho dòng được chọn
          if (idx === 0) {
            detailRow.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFFEB9C' } // Vàng nhạt
            };
            detailRow.font = { bold: true };
          }
        });
      }

      // Dòng trống phân cách
      const emptyRow = worksheet.addRow({});
      emptyRow.border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      };
    });

    // Tạo tên file với timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const finalFileName = fileName || `TinhToanTonKho_${timestamp}.xlsx`;

    // Xuất file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    // Tạo link download
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = finalFileName;
    anchor.click();
    
    // Cleanup
    window.URL.revokeObjectURL(url);

    console.log(`✅ Export thành công: ${finalFileName}`);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw new Error(`Lỗi khi export Excel: ${(error as Error).message}`);
  }
}

/**
 * Export với filter: chỉ export các cuộn được chọn
 */
export async function exportSelectedToExcel(
  orders: CalculatedOrder[],
  selectedIndexes: Map<number, number[]>
): Promise<void> {
  // Clone orders và filter theo selected
  const filteredOrders = orders.map((order, orderIdx) => {
    const selected = selectedIndexes.get(orderIdx);
    
    if (!selected || selected.length === 0) {
      // Không tick gì → mặc định lấy dòng đầu (CHỌN)
      return {
        ...order,
        checkTon: order.checkTon ? [order.checkTon[0]] : []
      };
    }
  // Có tick → lấy các dòng đã tick (sort theo index)
    const selectedRolls = selected
      .sort((a, b) => a - b)
      .map(i => order.checkTon[i])
      .filter(roll => roll !== undefined);
    return {
      ...order,
      checkTon: selectedRolls
    };
  });

  await exportToExcel(filteredOrders);
}
