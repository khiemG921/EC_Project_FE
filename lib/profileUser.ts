import fetchWithAuth from '@/lib/apiClient';

export async function fetchProfile() {
  // Attempt to fetch both customer and tasker profiles concurrently and merge them.
  const endpoints = [
    { key: 'customer', path: '/api/profile/findCustomer' },
    { key: 'tasker', path: '/api/profile/findTasker' },
  ];

  const results = await Promise.allSettled(endpoints.map(e => fetchWithAuth(e.path, { method: 'GET' })));

  const parsed: Record<string, any> = {};

  for (let i = 0; i < results.length; i++) {
    const ep = endpoints[i];
    const r = results[i];
    if (r.status === 'fulfilled') {
      const res = r.value as Response;
      if (!res.ok) {
        let text = '';
        try { text = await res.text(); } catch {}
        console.warn('fetchProfile - endpoint non-ok', ep.key, { status: res.status, body: text });
        continue;
      }
      // parse safely
      try {
        const text = await res.text();
        if (!text) {
          console.warn('fetchProfile - empty body from', ep.key);
          continue;
        }
        parsed[ep.key] = JSON.parse(text);
      } catch (err) {
        console.error('fetchProfile - parse error for', ep.key, err);
      }
    } else {
      console.warn('fetchProfile - network/fetch failed for', ep.key, results[i]);
    }
  }

  // If neither returned data, throw an error
  if (!parsed.customer && !parsed.tasker) {
    throw new Error('Không thể lấy thông tin user từ server');
  }

  const c = parsed.customer || {};
  const t = parsed.tasker || {};

  // Merge logic: prefer customer fields for profile data and favorites; attach taskerInfo when available
  const merged = {
    id: c.customer_id || c.id || t.tasker_id || t.id || '',
    name: c.name || t.name || '',
    email: c.email || t.email || '',
    avatar: c.avatar_url || c.avatar || t.avatar_url || t.avatar || '',
    roles: (() => {
      const r = new Set<string>();
      if (Array.isArray(c.roles)) c.roles.forEach((x: string) => r.add(x));
      if (Array.isArray(t.roles)) t.roles.forEach((x: string) => r.add(x));
      // if backend used different field names
      if (!r.size) {
        if (c.role) r.add(c.role);
        if (t.role) r.add(t.role);
      }
      if (!r.size) r.add('customer');
      return Array.from(r);
    })(),
    phone: c.phone || t.phone || '',
    gender: c.gender || t.gender || '',
    dob: c.date_of_birth || c.dob || t.date_of_birth || t.dob || '',
    address: c.address || t.address || '',
    // favorites and rewardPoints typically belong to customer
    rewardPoints: c.reward_points ?? c.rewardPoints ?? 0,
    favorites: c.favorite_services || c.favorites || [],
    // tasker info merged
    taskerInfo: (() => {
      const src = t.taskerInfo || t || c.taskerInfo || null;
      if (!src) return undefined;
      return {
        avgRating: src.avgRating ?? src.avg_rating ?? src.rating ?? 0,
        completedJobs: src.completedJobs ?? src.completed_jobs ?? 0,
        bio: src.bio || src.description || '',
        skills: src.tasker_skills || src.skills || t.tasker_skills || c.tasker_skills || undefined,
      };
    })(),
  };

  return merged;
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