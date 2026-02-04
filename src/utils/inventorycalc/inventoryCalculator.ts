import type { Order, InventoryItem, OptimalRoll, CalculatedOrder,CalculationFilters} from '@/api/inventory/types';

/**
 * Tính trọng lượng giấy cần dùng cho đơn hàng
 * Formula: (GSM * Rộng cuộn * Cắt tới * Số lượng * 10^-7) / Số đơn vị
 */
export function calculateWeight(order: Order): number {
  const { quantity, cutWidth, rollWidth, gsm, units } = order;
  
  if (quantity > 0 && cutWidth > 0 && rollWidth > 0 && gsm > 0) {
    return (gsm * rollWidth * cutWidth * quantity * Math.pow(10, -7)) / units;
  }
  
  return 0;
}

/**
 * Chọn cuộn giấy tối ưu nhất
 * 
 * @param inventoryDetails - Danh sách cuộn giấy có sẵn
 * @param requiredWidth - Chiều rộng cần cắt
 * @param requiredLength - Chiều dài cần cắt
 * @param location - NM1 (có đảo chiều) hoặc NM2 (không đảo chiều)
 * @returns Danh sách cuộn được sắp xếp theo độ ưu tiên
 */
export function selectOptimalRoll(
  inventoryDetails: InventoryItem[],
  requiredWidth: number,
  requiredLength: number,
  location: 'NM1' | 'NM2' = 'NM2'
): OptimalRoll[] {
  const allCandidates: OptimalRoll[] = [];
  const bestScenarioNM1 = new Map<string, OptimalRoll>();

  inventoryDetails.forEach((roll, index) => {
    if (!roll.width || roll.width <= 0) return;

    // Định nghĩa các kịch bản cắt
    const scenarios: Array<{ width: number; description: 'Gốc' | 'Đảo chiều' }> = [
      { width: requiredWidth, description: 'Gốc' }
    ];

    // Nếu ở NM1, thêm kịch bản đảo chiều
    if (location === 'NM1') {
      scenarios.push({
        width: requiredLength,
        description: 'Đảo chiều'
      });
    }

    // Tạo key duy nhất cho mỗi cuộn
    const rollKey = `${roll.rollCode}_${roll.width}_${roll.weight}_${index}`;

    scenarios.forEach(scenario => {
      // 1. Tính số lần cắt được từ cuộn
      const cuts = Math.floor(roll.width / scenario.width);
      if (cuts === 0) return; // Không cắt được thì bỏ qua

      // 2. Tính lãng phí
      const cutValue = cuts * scenario.width;
      const waste = roll.width - cutValue;

      // 3. Tính điểm quyết định (càng thấp càng tốt)
      let decisionScore = waste;
      
      // Bonus điểm cho:
      // - Lãng phí = 0 (cắt vừa khít)
      if (waste === 0) decisionScore -= 0.005;
      
      // - Cuộn rộng 60cm (ưu tiên size chuẩn)
      if (roll.width === 60) decisionScore -= 0.01;

      // 4. Tạo candidate
      const candidate: OptimalRoll = {
        ...roll,
        usedWidth: scenario.width,
        cutsPerRoll: cuts,
        waste,
        score: decisionScore,
        scenario: scenario.description,
      };

      // 5. Xử lý logic NM1 vs NM2
      if (location === 'NM1') {
        // NM1: Chỉ giữ kịch bản tốt nhất cho mỗi cuộn
        const current = bestScenarioNM1.get(rollKey);
        if (!current || candidate.waste < current.waste) {
          bestScenarioNM1.set(rollKey, candidate);
        }
      } else {
        // NM2: Thêm tất cả candidates
        allCandidates.push(candidate);
      }
    });
  });

  // Với NM1: Lấy kịch bản tốt nhất cho mỗi cuộn
  if (location === 'NM1') {
    bestScenarioNM1.forEach(candidate => allCandidates.push(candidate));
  }

  // Sắp xếp theo điểm (thấp nhất = tốt nhất)
  return allCandidates.sort((a, b) => a.score - b.score);
}

/**
 * Filter đơn hàng theo điều kiện
 */
export function filterOrders(
  orders: Order[],
  filters: CalculationFilters
): Order[] {
  return orders.filter(order => {
    // Filter by customer
    if (filters.customer && order.customer !== filters.customer) {
      return false;
    }

    // Filter by GSM
    if (filters.gsm) {
      const gsmArray = filters.gsm.split(',').map(g => g.trim());
      if (!gsmArray.includes(String(order.gsm))) {
        return false;
      }
    }

    // Filter by order type
    if (filters.orderType === 'approved' && order.type !== 'approved') {
      return false;
    }
    if (filters.orderType === 'forecast' && order.type !== 'forecast') {
      return false;
    }

    return true;
  });
}

/**
 * Tính toán đầy đủ cho tất cả đơn hàng
 * 
 * @param orders - Danh sách đơn hàng
 * @param inventoryItems - Danh sách tồn kho
 * @param location - NM1 hoặc NM2
 * @returns Danh sách đơn hàng đã được tính toán
 */
export function calculateOrders(
  orders: Order[],
  inventoryItems: InventoryItem[],
  location: 'NM1' | 'NM2' = 'NM2'
): CalculatedOrder[] {
  return orders.map(order => {
    // 1. Tính trọng lượng cần dùng
    const weight = calculateWeight(order);

    // 2. Lấy danh sách tồn kho phù hợp (cùng GSM và loại giấy)
    const inventoryDetails = inventoryItems.filter(
      item => item.gsm === order.gsm && item.paperType === order.paperType
    );

    // 3. Tính tổng trọng lượng tồn kho
    const inventoryWeight = inventoryDetails.reduce(
      (sum, item) => sum + item.weight, 
      0
    );

    // 4. Chọn cuộn tối ưu
    const checkTon = selectOptimalRoll(
      inventoryDetails,
      order.rollWidth,
      order.cutWidth,
      location
    );

    // 5. Lấy cuộn được chọn (index 0 = tốt nhất)
    const selectedRoll = checkTon[0] || null;

    return {
      ...order,
      weight,
      inventoryWeight,
      inventoryDetails,
      checkTon,
      selectedRoll,
    };
  });
}

/**
 * Tính tổng trọng lượng tồn kho theo mã vật tư
 * (Để hiển thị tồn kho của cuộn được chọn)
 */
export function sumInventoryByMaterial(
  inventory: InventoryItem[],
  rollCode: string
): number {
  if (!rollCode) return 0;

  return inventory
    .filter(item => item.rollCode === rollCode)
    .reduce((sum, item) => sum + item.weight, 0);
}

/**
 * Validate calculation data
 */
export function validateCalculationData(
  orders: Order[],
  inventoryItems: InventoryItem[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!orders || orders.length === 0) {
    errors.push('Không có dữ liệu đơn hàng');
  }

  if (!inventoryItems || inventoryItems.length === 0) {
    errors.push('Không có dữ liệu tồn kho');
  }

  // Check for invalid orders
  const invalidOrders = orders.filter(
    o => !o.gsm || !o.rollWidth || !o.cutWidth || !o.quantity
  );
  
  if (invalidOrders.length > 0) {
    errors.push(`Có ${invalidOrders.length} đơn hàng thiếu thông tin`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
