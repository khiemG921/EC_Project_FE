import fetchWithAuth from '@/lib/apiClient';
import type { User } from '@/types/user';

export async function fetchUsers(): Promise<User[]> {
    const res = await fetchWithAuth('/api/admin/users/getAllUser', { method: 'GET' });
    if (!res.ok)
        throw new Error(
            `Không thể tải danh sách người dùng: ${res.status} ${res.statusText}`
        );
    const data = await res.json();

    // Map dữ liệu từ backend sang chuẩn User interface
    return data.map(
        (user: any): User => ({
            id: String(user.customer_id), // Đảm bảo sử dụng customer_id từ MySQL
            name: user.name || '',
            email: user.email || '',
            avatar: user.avatar_url || user.avatar || '',
            roles:
                user.roles && Array.isArray(user.roles)
                    ? user.roles
                    : ['customer'], // Sử dụng roles từ Firebase
            phone: user.phone || '',
            gender: user.gender || '',
            dob: user.date_of_birth || user.dob || '',
            address: user.address || '',
            rewardPoints: user.reward_points || user.rewardPoints || 0,
        })
    );
}

export async function createUser(data: User): Promise<User> {
    // Map dữ liệu từ User interface sang format backend
    const backendData = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        gender: data.gender,
        date_of_birth: data.dob,
        address: data.address,
        avatar_url: data.avatar,
        reward_points: data.rewardPoints || 0,
    };

    const res = await fetchWithAuth('/api/admin/users/createUser', {
        method: 'POST',
        body: JSON.stringify(backendData),
    });
    if (!res.ok)
        throw new Error(
            `Không thể tạo người dùng: ${res.status} ${res.statusText}`
        );
    const responseData = await res.json();

    // Map response về User interface
    return {
        id: String(responseData.customer_id), // Đảm bảo sử dụng customer_id từ MySQL
        name: responseData.name || '',
        email: responseData.email || '',
        avatar: responseData.avatar_url || responseData.avatar || '',
        roles:
            responseData.roles && Array.isArray(responseData.roles)
                ? responseData.roles
                : ['customer'],
        phone: responseData.phone || '',
        gender: responseData.gender || '',
        dob: responseData.date_of_birth || responseData.dob || '',
        address: responseData.address || '',
        rewardPoints:
            responseData.reward_points || responseData.rewardPoints || 0,
    };
}

export async function updateUser(
    id: string,
    data: Partial<User>
): Promise<User> {
    // Map dữ liệu từ User interface sang format backend
    const backendData: any = {};
    if (data.name) backendData.name = data.name;
    if (data.email) backendData.email = data.email;
    if (data.phone) backendData.phone = data.phone;
    if (data.gender) backendData.gender = data.gender;
    if (data.dob) backendData.date_of_birth = data.dob;
    if (data.address) backendData.address = data.address;
    if (data.avatar) backendData.avatar_url = data.avatar;
    if (data.rewardPoints !== undefined)
        backendData.reward_points = data.rewardPoints;

    const res = await fetchWithAuth(`/api/admin/users/updateUser/${id}`, {
        method: 'PUT',
        body: JSON.stringify(backendData),
    });
    if (!res.ok)
        throw new Error(
            `Không thể cập nhật người dùng: ${res.status} ${res.statusText}`
        );
    const responseData = await res.json();

    // Map response về User interface
    return {
        id: String(responseData.customer_id), // Đảm bảo sử dụng customer_id từ MySQL
        name: responseData.name || '',
        email: responseData.email || '',
        avatar: responseData.avatar_url || responseData.avatar || '',
        roles:
            responseData.roles && Array.isArray(responseData.roles)
                ? responseData.roles
                : ['customer'],
        phone: responseData.phone || '',
        gender: responseData.gender || '',
        dob: responseData.date_of_birth || responseData.dob || '',
        address: responseData.address || '',
        rewardPoints:
            responseData.reward_points || responseData.rewardPoints || 0,
    };
}

export async function deleteUser(id: string): Promise<void> {
    const res = await fetchWithAuth(`/api/admin/users/deleteUser/${id}`, {
        method: 'DELETE',
    });
    if (!res.ok)
        throw new Error(
            `Không thể xóa người dùng: ${res.status} ${res.statusText}`
        );
}

export async function setRoleUser(id: string, role: string): Promise<void> {
    const res = await fetchWithAuth(`/api/admin/users/setRole/${id}`, {
        method: 'POST',
        body: JSON.stringify({ role }),
    });
    if (!res.ok)
        throw new Error(
            `Không thể cập nhật vai trò người dùng: ${res.status} ${res.statusText}`
        );
}

// Thêm role (admin tasker)
export async function grantRoleUser(id: string, role: 'admin' | 'tasker'): Promise<string[]> {
    const res = await fetchWithAuth(`/api/admin/users/grantRole/${id}`, {
        method: 'POST',
        body: JSON.stringify({ role }),
    });
    if (!res.ok) throw new Error(`Không thể cấp quyền: ${res.status} ${res.statusText}`);
    const data = await res.json();
    return data.roles as string[];
}

// Thu hồi role (admin tasker)
export async function revokeRoleUser(id: string, role: 'admin' | 'tasker'): Promise<string[]> {
    const res = await fetchWithAuth(`/api/admin/users/revokeRole/${id}`, {
        method: 'POST',
        body: JSON.stringify({ role }),
    });
    if (!res.ok) throw new Error(`Không thể thu hồi quyền: ${res.status} ${res.statusText}`);
    const data = await res.json();
    return data.roles as string[];
}
