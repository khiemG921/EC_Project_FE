import fetchWithAuth from '@/lib/apiClient';

export async function fetchProfile() {
  let res: Response;
  try {
    res = await fetchWithAuth('/api/profile/findCustomer', { method: 'GET' });
  } catch (err) {
    // Network / CORS / fetch-level errors
    const message = err instanceof Error ? err.message : String(err);
    console.error('fetchProfile - network error:', message);
    throw new Error(`Không thể kết nối để lấy thông tin user: ${message}`);
  }

  if (!res.ok) {
    // Try to surface server response to FE console for debugging
    let text = '';
    try { text = await res.text(); } catch (e) { /* ignore */ }
    console.error('fetchProfile - non-ok response', { status: res.status, statusText: res.statusText, body: text });
    throw new Error(`Không thể lấy thông tin user (status=${res.status}): ${text || res.statusText}`);
  }

  // Parse JSON safely: if body isn't valid JSON, surface the raw text for debugging
  let raw: any = null;
  try {
    // Some servers may return empty body; read as text first
    const text = await res.text();
    if (!text) {
      console.warn('fetchProfile - empty response body with ok status', { status: res.status });
      throw new Error(`Empty response body (status=${res.status})`);
    }
    try {
      raw = JSON.parse(text);
    } catch (parseErr) {
      console.error('fetchProfile - failed to parse JSON', { status: res.status, rawText: text });
      throw new Error(`Không thể phân tích phản hồi từ server: ${String(parseErr)}`);
    }
  } catch (e) {
    // rethrow to be handled by caller
    throw e;
  }
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

  let res: Response;
  try {
    res = await fetchWithAuth('/api/profile/updateCustomerProfile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('updateProfile - network error:', message);
    throw new Error(`Không thể kết nối để cập nhật thông tin: ${message}`);
  }

  if (!res.ok) {
    let serverMsg = '';
    try { serverMsg = (await res.json())?.details || (await res.json())?.error || JSON.stringify(await res.text()); } catch {}
    console.error('Update profile failed. Status:', res.status, 'Payload:', payload, 'Server message:', serverMsg);
    throw new Error(`Không thể cập nhật thông tin (status=${res.status}): ${serverMsg}`);
  }

  return res.json();
}

export async function uploadAvatar(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('avatar', file);
  let res: Response;
  try {
    res = await fetchWithAuth('/api/profile/updateCustomerImage', {
      method: 'POST',
      body: formData,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('uploadAvatar - network error:', message);
    throw new Error(`Không thể kết nối để tải ảnh: ${message}`);
  }

  if (!res.ok) {
    // Try parse JSON then fallback to text
    let errBody: any = null;
    try { errBody = await res.json(); } catch { try { errBody = await res.text(); } catch {} }
    console.error('uploadAvatar failed', { status: res.status, body: errBody });
    const msg = typeof errBody === 'object' ? (errBody?.message || JSON.stringify(errBody)) : errBody;
    throw new Error(msg || `Không thể tải lên ảnh đại diện (status=${res.status})`);
  }

  const data = await res.json();
  // Backend returns { success, message, avatarUrl }
  const url = data?.avatarUrl || data?.secure_url || data?.url;
  if (!url || typeof url !== 'string') {
    throw new Error('Phản hồi không có URL ảnh');
  }
  return url;
}