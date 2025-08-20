import fetchWithAuth from '@/lib/apiClient';

export async function fetchCountUsers(){
    const response = await fetchWithAuth('/api/admin/statistics/countUsers', { method: 'GET' });
    if (!response.ok) throw new Error('Failed to fetch user count');
    return response.json();
}

export async function fetchCountServices(){
    const response = await fetchWithAuth('/api/admin/statistics/countServices', { method: 'GET' });
    if (!response.ok) throw new Error('Failed to fetch service count');
    return response.json();
}

export async function fetchCountJobs(){
    const response = await fetchWithAuth('/api/admin/statistics/countJobs', { method: 'GET' });
    if (!response.ok) throw new Error('Failed to fetch job count');
    return response.json();
}