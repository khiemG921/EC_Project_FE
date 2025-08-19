import { NewsArticle } from '../types/news';

const API_URL = `${(globalThis as any)?.process?.env?.NEXT_PUBLIC_API_URL || 'https://ecprojectbe-production.up.railway.app'}/api/news`;

// Hàm này sẽ lấy danh sách tin tức với các tham số tìm kiếm, phân trang và giới hạn
export async function fetchNewsList({ search = '', page = 1, limit = 10 }: { search?: string; page?: number; limit?: number }): Promise<{ news: NewsArticle[]; total: number }> {
    const params = new URLSearchParams({ search, page: String(page), limit: String(limit) });
    const res = await fetch(`${API_URL}?${params}`);
    if (!res.ok) throw new Error('Failed to fetch news list');
    return await res.json();
}

// Hàm này sẽ lấy chi tiết một bài viết tin tức theo ID
export async function fetchNewsDetail(id: number): Promise<NewsArticle> {
    const res = await fetch(`${API_URL}/${id}`);
    if (!res.ok) throw new Error('Failed to fetch news detail');
    return await res.json();
}
