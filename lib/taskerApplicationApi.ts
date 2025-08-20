// lib/taskerApplicationApi.ts
import { auth } from './firebase';
import fetchWithAuth from '@/lib/apiClient';

export interface TaskerApplication {
    id: string;
    firebase_id: string;
    name: string;
    email: string;
    avatar_url?: string;
    skills: string;
    application_date: string;
    status: 'pending' | 'approved' | 'rejected';
}

// Using fetchWithAuth for base URL and auth
// Hàm helper để lấy token với multiple attempts
const getAuthToken = async (): Promise<string> => {
    const cookieToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];
    
    if (cookieToken) {
        return cookieToken;
    }

    // Nếu không có cookie, thử Firebase
    const user = auth.currentUser;
    if (!user) {
        // Đợi Firebase auth initialize
        await new Promise(resolve => setTimeout(resolve, 1000));
        const retryUser = auth.currentUser;
        if (!retryUser) {
            throw new Error('User not authenticated');
        }
        return await retryUser.getIdToken();
    }
    return await user.getIdToken();
};

// API cho customer
export const taskerApplicationApi = {
    // Gửi đơn đăng ký làm tasker
    async apply(skills: string): Promise<{ success: boolean; message: string; data?: TaskerApplication }> {
        try {
                const response = await fetchWithAuth('/api/tasker-applications/apply', {
                    method: 'POST',
                    body: JSON.stringify({ skills }),
                });

                const result = await response.json();
                return result;
            } catch (error) {
            console.error('Error applying for tasker:', error);
            return {
                success: false,
                message: 'Lỗi kết nối server'
            };
        }
    },

    // Kiểm tra trạng thái đơn đăng ký của mình
    async getMyStatus(): Promise<{ success: boolean; data?: TaskerApplication }> {
        try {
            const response = await fetchWithAuth('/api/tasker-applications/my-status', { method: 'GET' });
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error getting application status:', error);
            return {
                success: false
            };
        }
    }
};

// API cho admin
export const adminTaskerApplicationApi = {
    // Lấy danh sách đơn đăng ký
    async getAll(status?: string, search?: string): Promise<{ success: boolean; data?: TaskerApplication[] }> {
        try {
            const params = new URLSearchParams();
            
            if (status) params.append('status', status);
            if (search) params.append('search', search);

            const response = await fetchWithAuth(`/api/tasker-applications?${params}`, { method: 'GET' });
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error getting applications:', error);
            return {
                success: false
            };
        }
    },

    // Duyệt đơn đăng ký
    async approve(id: string): Promise<{ success: boolean; message: string }> {
        try {
            const response = await fetchWithAuth(`/api/tasker-applications/${id}/approve`, { method: 'PUT' });
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error approving application:', error);
            return {
                success: false,
                message: 'Lỗi kết nối server'
            };
        }
    },

    // Từ chối đơn đăng ký
    async reject(id: string): Promise<{ success: boolean; message: string }> {
        try {
            const response = await fetchWithAuth(`/api/tasker-applications/${id}/reject`, { method: 'PUT' });
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error rejecting application:', error);
            return {
                success: false,
                message: 'Lỗi kết nối server'
            };
        }
    }
};
