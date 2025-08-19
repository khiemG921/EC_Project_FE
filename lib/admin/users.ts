const API_BASE_URL = (globalThis as any)?.process?.env?.NEXT_PUBLIC_API_URL || 'https://ecprojectbe-production.up.railway.app';
import type { User } from '@/types/user';

export async function fetchUsers(): Promise<User[]> {
    const res = await fetch(`${API_BASE_URL}/api/admin/customers/getAllUser`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // forward cookies for auth
    });
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

    const res = await fetch(`${API_BASE_URL}/api/admin/customers/createUser`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backendData),
        credentials: 'include',
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

    const res = await fetch(
        `${API_BASE_URL}/api/admin/customers/updateUser/${id}`,
        {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(backendData),
            credentials: 'include',
        }
    );
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
    const res = await fetch(
        `${API_BASE_URL}/api/admin/customers/deleteUser/${id}`,
        {
            method: 'DELETE',
            credentials: 'include',
        }
    );
    if (!res.ok)
        throw new Error(
            `Không thể xóa người dùng: ${res.status} ${res.statusText}`
        );
}

export async function setRoleUser(id: string, role: string): Promise<void> {
    const res = await fetch(
        `${API_BASE_URL}/api/admin/customers/setRole/${id}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role }),
            credentials: 'include',
        }
    );
    if (!res.ok)
        throw new Error(
            `Không thể cập nhật vai trò người dùng: ${res.status} ${res.statusText}`
        );
}
