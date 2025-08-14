export const serviceId = 4;
export const serviceInfo = { id: 4, name: "Vệ Sinh Sofa, Đệm, Rèm, Thảm" };
export const allPricingOptions = [
    { id: 14, service_id: 4, type: "Sofa Nỉ/Vải", name: "Sofa 1 ghế", seats: 1, description: "Sofa 1 ghế dài, 2-3 chỗ ngồi" },
    { id: 15, service_id: 4, type: "Sofa Nỉ/Vải", name: "Sofa 2 ghế", seats: 2, description: "Sofa 2 ghế dài/bộ chữ L" },
    { id: 16, service_id: 4, type: "Sofa Nỉ/Vải", name: "Sofa 3 ghế", seats: 3, description: "Sofa 2 ghế dài + 1 ghế tựa/bộ chữ U" },
    { id: 17, service_id: 4, type: "Sofa Nỉ/Vải", name: "Sofa đơn", seats: 1, description: "Sofa tựa 1 chỗ ngồi" },
    { id: 18, service_id: 4, type: "Sofa Nỉ/Vải", name: "Đôn thêm", seats: 1 },
    { id: 19, service_id: 4, type: "Sofa Da", name: "Sofa 1 ghế", seats: 1, description: "Sofa 1 ghế dài, 2-3 chỗ ngồi" },
    { id: 20, service_id: 4, type: "Sofa Da", name: "Sofa 2 ghế", seats: 2, description: "Sofa 2 ghế dài/bộ chữ L" },
    { id: 21, service_id: 4, type: "Sofa Da", name: "Sofa 3 ghế", seats: 3, description: "Sofa 2 ghế dài + 1 ghế tựa/bộ chữ U" },
    { id: 22, service_id: 4, type: "Sofa Da", name: "Sofa đơn", seats: 1, description: "Sofa tựa 1 chỗ ngồi" },
    { id: 23, service_id: 4, type: "Sofa Da", name: "Đôn thêm", seats: 1 },
    { id: 24, service_id: 4, type: "Đệm", name: "Đệm < 1.5m" },
    { id: 25, service_id: 4, type: "Đệm", name: "Đệm 1.5m - 2m" },
    { id: 26, service_id: 4, type: "Đệm", name: "Đệm > 2m" },
    { id: 27, service_id: 4, type: "Thảm", name: "Thảm < 1.5m" },
    { id: 28, service_id: 4, type: "Thảm", name: "Thảm 1.5m - 2m" },
    { id: 29, service_id: 4, type: "Thảm", name: "Thảm 2m - 2.5m" },
    { id: 30, service_id: 4, type: "Thảm", name: "Thảm 2.5m - 3m" },
    { id: 31, service_id: 4, type: "Rèm", washing: "Khô", name: "Rèm đôi nhỏ", description: "Rèm đôi 1 lớp, cửa rộng 1m - 2.5m" },
    { id: 32, service_id: 4, type: "Rèm", washing: "Khô", name: "Rèm đôi lớn", description: "Rèm đôi 1 lớp, cửa rộng 2.5m - 4m" },
    { id: 33, service_id: 4, type: "Rèm", washing: "Khô", name: "Rèm cửa đơn", description: "Rèm đơn 1 lớp, cửa rộng < 1m" },
    { id: 34, service_id: 4, type: "Rèm", washing: "Khô", name: "Rèm cửa sổ Roman", description: "Rèm xếp lớp hoặc rèm cuốn Roman" },
    { id: 35, service_id: 4, type: "Rèm", washing: "Nước", name: "< 10kg" },
    { id: 36, service_id: 4, type: "Rèm", washing: "Nước", name: "10kg - 15kg" }
];

export const upholsteryOptions = {
    sofaNylon: allPricingOptions.filter(p => p.type === 'Sofa Nỉ/Vải'),
    sofaLeather: allPricingOptions.filter(p => p.type.includes('Sofa Da')),
    mattress: allPricingOptions.filter(p => p.type === 'Đệm'),
    carpet: allPricingOptions.filter(p => p.type === 'Thảm'),
    curtainDry: allPricingOptions.filter(p => p.type === 'Rèm' && p.washing === 'Khô'),
    curtainWet: allPricingOptions.filter(p => p.type === 'Rèm' && p.washing === 'Nước'),
};
