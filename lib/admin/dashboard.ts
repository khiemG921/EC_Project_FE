const API_BASE_URL = (globalThis as any)?.process?.env?.NEXT_PUBLIC_API_URL || 'https://ecprojectbe-production.up.railway.app';

export async function fetchCountUsers(){
    const response = await fetch(`${API_BASE_URL}/api/admin/statistics/countUsers`);
    if (!response.ok) {
        throw new Error('Failed to fetch user count');
    }
    return response.json();
}

export async function fetchCountServices(){
    const response = await fetch(`${API_BASE_URL}/api/admin/statistics/countServices`);
    if (!response.ok) {
        throw new Error('Failed to fetch service count');
    }
    return response.json();
}

export async function fetchCountJobs(){
    const response = await fetch(`${API_BASE_URL}/api/admin/statistics/countJobs`);
    if (!response.ok) {
        throw new Error('Failed to fetch job count');
    }
    return response.json();
}