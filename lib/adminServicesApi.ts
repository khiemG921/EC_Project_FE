import { auth } from './firebase';

const API_BASE_URL = (globalThis as any)?.process?.env?.NEXT_PUBLIC_API_URL || 'https://ecprojectbe-production.up.railway.app';

// Helper function để lấy auth token
async function getAuthHeaders() {
    const user = auth.currentUser;
    if (!user) {
        throw new Error('Bạn cần đăng nhập để thực hiện thao tác này');
    }
    
    const token = await user.getIdToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

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
    const res = await fetch(`${API_BASE_URL}/api/admin/services`, {
        credentials: 'include'
    });
    
    if (!res.ok) {
        throw new Error('Không thể lấy danh sách dịch vụ');
    }
    
    return res.json();
}

// Tạo service mới
export async function createService(data: CreateServiceData): Promise<{ message: string; service: Service }> {
    const headers = await getAuthHeaders();
    
    const res = await fetch(`${API_BASE_URL}/api/admin/services`, {
        method: 'POST',
        headers,
        credentials: 'include',
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
    const headers = await getAuthHeaders();
    
    const res = await fetch(`${API_BASE_URL}/api/admin/services/${id}`, {
        method: 'PUT',
        headers,
        credentials: 'include',
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
    const headers = await getAuthHeaders();
    
    const res = await fetch(`${API_BASE_URL}/api/admin/services/${id}`, {
        method: 'DELETE',
        headers,
        credentials: 'include',
    });
    
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Không thể xóa dịch vụ');
    }
    
    return res.json();
}
