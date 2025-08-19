// Ánh xạ id dịch vụ sang slug bookingUrl
export const SERVICE_ID_TO_BOOKING_URL: Record<number, string> = {
  1: '/booking/hourly-cleaning', // Giúp Việc Ca Lẻ
  2: '/booking/periodic-cleaning', // Giúp Việc Định Kỳ
  4: '/booking/upholstery', // Vệ Sinh Sofa, Đệm, Rèm, Thảm
  5: '/booking/ac-cleaning', // Vệ Sinh Điều Hòa
  8: '/booking/business-cleaning', // Dọn Dẹp Công Nghiệp
  // Các dịch vụ khác sẽ được thêm khi có booking flow
};

export interface Service {
  id: number;
  name: string;
  description: string;
  type: string;
  status?: string; 
  image_url?: string;
  price_from?: number;
  duration?: string;
}

export async function fetchServices(): Promise<Service[]> {
  const base = (globalThis as any)?.process?.env?.NEXT_PUBLIC_API_URL || 'https://ecprojectbe-production.up.railway.app';
  const res = await fetch(`${base}/api/services`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Không thể lấy danh sách dịch vụ');
  
  const response = await res.json();
  const all = Array.isArray(response) ? response : (response.data || []) as Service[];
  
  return all;
}
