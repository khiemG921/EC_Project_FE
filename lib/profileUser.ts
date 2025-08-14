const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL 

export async function fetchProfile() {
  const res = await fetch(`${API_BASE_URL}/api/profile/findCustomer`, { credentials: 'include' });
  if (!res.ok) throw new Error('Không thể lấy thông tin user');
  const raw = await res.json();
  // Map dữ liệu từ backend sang đúng định dạng UserProfile
  const user = {
    id: raw.customer_id || raw.id || '',
    name: raw.name || '',
    email: raw.email || '',
    avatar: raw.avatar_url || raw.avatar || '',
    roles: Array.isArray(raw.roles) ? raw.roles : [raw.roles || 'customer'],
    phone: raw.phone || '',
    gender: raw.gender || '',
    dob: raw.date_of_birth || raw.dob || '',
    address: raw.address || '',
    rewardPoints: raw.reward_points ?? 0,

    taskerInfo: raw.taskerInfo ? {
      avgRating: raw.taskerInfo.avgRating ?? 0,
      completedJobs: raw.taskerInfo.completedJobs ?? 0,
      bio: raw.taskerInfo.bio || '',
    } : undefined,
  };
  return user;
}

export async function updateProfile(data: any) {
  // Chỉ gửi các field backend chấp nhận
  const payload: any = {};
  if (data.name !== undefined) payload.name = data.name;
  if (data.phone !== undefined) payload.phone = data.phone;
  if (data.gender !== undefined) payload.gender = data.gender;
  if (data.avatar !== undefined) payload.avatar_url = data.avatar; // map
  if (data.dob !== undefined) payload.dob = data.dob; // backend sẽ map sang date_of_birth
  if (data.address !== undefined) payload.address = data.address;

  const res = await fetch(`${API_BASE_URL}/api/profile/updateCustomerProfile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let serverMsg = '';
    try { serverMsg = (await res.json())?.details || (await res.json())?.error; } catch {}
    console.error('Update profile failed. Status:', res.status, 'Payload:', payload, 'Server message:', serverMsg);
    throw new Error('Không thể cập nhật thông tin');
  }

  return res.json();
}

export async function uploadAvatar(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('avatar', file);
  const res = await fetch(`${API_BASE_URL}/api/profile/updateCustomerImage`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || 'Không thể tải lên ảnh đại diện');
  }
  const data = await res.json();
  // Backend returns { success, message, avatarUrl }
  const url = data?.avatarUrl || data?.secure_url || data?.url;
  if (!url || typeof url !== 'string') {
    throw new Error('Phản hồi không có URL ảnh');
  }
  return url;
}