import fetchWithAuth from '@/lib/apiClient';

export interface Service {
    id: number;
    name: string;
    description: string;
    type: string; // Thay đổi từ category thành type
    status?: 'active' | 'inactive';
    imageUrl?: string;
    basePrice?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateServiceData {
    name: string;
    description: string;
    type: string; // Thay đổi từ category thành type
    status?: 'active' | 'inactive';
    imageUrl?: string;
    basePrice?: number;
}

// Lấy tất cả services
export async function getAllServices(): Promise<Service[]> {
    const res = await fetchWithAuth('/api/admin/services', { method: 'GET' });
    if (!res.ok) throw new Error('Không thể lấy danh sách dịch vụ');
    return res.json();
}

// Tạo service mới
export async function createService(data: CreateServiceData): Promise<{ message: string; service: Service }> {
    const res = await fetchWithAuth('/api/admin/services', {
        method: 'POST',
        body: JSON.stringify(data),
    });
    
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Không thể tạo dịch vụ');
    }
    
    return res.json();
}

// Cập nhật service
export async function updateService(id: number, data: CreateServiceData): Promise<{ message: string; service: Service }> {
    const res = await fetchWithAuth(`/api/admin/services/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
    
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Không thể cập nhật dịch vụ');
    }
    
    return res.json();
}

// Xóa service
export async function deleteService(id: number): Promise<{ message: string }> {
    const res = await fetchWithAuth(`/api/admin/services/${id}`, {
        method: 'DELETE',
    });
    
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Không thể xóa dịch vụ');
    }
    
    return res.json();
}
