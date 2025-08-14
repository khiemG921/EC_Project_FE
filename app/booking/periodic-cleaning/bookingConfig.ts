export const serviceInfo = { id: 2, name: 'Dọn dẹp Định kỳ' };

export const weekDays: Record<string, string> = {
    T2: 'Thứ 2',
    T3: 'Thứ 3',
    T4: 'Thứ 4',
    T5: 'Thứ 5',
    T6: 'Thứ 6',
    T7: 'Thứ 7',
    CN: 'Chủ nhật',
};

export const timeSlots: Record<string, string> = {
    Sang: 'Sáng (8-12h)',
    Chieu: 'Chiều (13-17h)',
    Toi: 'Tối (17-21h)',
};

export const pricingData = {
    sessions: [
        { id: 1, label: '2 buổi/tuần', value: 2 },
        { id: 2, label: '3 buổi/tuần', value: 3 },
        { id: 3, label: '4 buổi/tuần', value: 4 },
        { id: 4, label: '5 buổi/tuần', value: 5 },
        { id: 5, label: '6 buổi/tuần', value: 6 },
    ],
    durations: [
        { id: 7, label: '2h/buổi', value: 2 },
        { id: 8, label: '3h/buổi', value: 3 },
        { id: 9, label: '4h/buổi', value: 4 },
    ],
    packages: [
        { id: 1, label: '1 tháng', value: 1 },
        { id: 2, label: '3 tháng', value: 3 },
        { id: 3, label: '6 tháng', value: 6 },
    ],
    extras: [
        { id: 11, name: 'Nấu ăn', value: 1, icon: 'fas fa-utensils' },
        { id: 13, name: 'Giặt ủi', value: 1, icon: 'fas fa-tshirt' },
    ],
    other: [
        { id: 14, name: 'Sử dụng máy hút bụi', icon: 'fas fa-vacuum' },
    ],
};

// Hàm dùng chung
export function getExtraServicesWithPrices(extraServices: number[]) {
    return (extraServices || []).map((id) => {
        const found = pricingData.extras.find((e) => e.id === id);
        return found ? { ...found, unitPrice: found.value || 0 } : null;
    }).filter(Boolean);
}

export function getScheduleSummary(schedule: any) {
    return Object.keys(schedule || {}).map((dayKey: string) => {
        const slots = Object.keys(schedule[dayKey] || {}).filter((slotKey: string) => schedule[dayKey][slotKey]).map((slotKey: string) => timeSlots[slotKey]?.split(' ')[0]);
        return slots.length > 0 ? `${weekDays[dayKey]}: ${slots.join(', ')}` : null;
    }).filter(Boolean).join('; ');
}
