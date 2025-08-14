'use client';

import React, { useState, useMemo, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Search } from 'react-feather';
import { fetchNewsList } from '@/lib/newsApi';

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
);


interface NewsArticle {
    news_id: number;
    title: string;
    content: string;
    image_url?: string | null;
    created_at: string | null;
    source?: string | null;
}

const SearchIcon = () => <Search size={18} className="text-gray-400" />;

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

const fetchNews = async (): Promise<NewsArticle[]> => {
    const res = await fetch(`${API_URL}/api/news`);
    if (!res.ok) throw new Error('Không thể tải tin tức');
    const data = await res.json();
    return data.news;
};

const createNews = async (data: Partial<NewsArticle>, token: string) => {
    const res = await fetch(`${API_URL}/api/news`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Không thể tạo tin tức');
    return await res.json();
};

const updateNews = async (id: number, data: Partial<NewsArticle>, token: string) => {
    const res = await fetch(`${API_URL}/api/news/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Không thể cập nhật tin tức');
    return await res.json();
};

const deleteNews = async (id: number, token: string) => {
    const res = await fetch(`${API_URL}/api/news/${id}`, {
        method: 'DELETE',
        headers: {
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    });
    if (!res.ok) throw new Error('Không thể xóa tin tức');
    return await res.json();
};


// --- Modal Component for Form and Confirmation ---
const Modal = ({ children, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {children}
        </div>
    </div>
);

// --- News Article Form Component ---
const NewsArticleForm = ({ initialData, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState(
        initialData || {
            news_id: 0,
            title: '',
            content: '',
            image_url: '',
            created_at: null,
            source: '',
        }
    );

    // useEffect để cập nhật lại formData khi initialData thay đổi
    React.useEffect(() => {
        setFormData({
            news_id: initialData?.news_id ?? 0,
            title: initialData?.title ?? '',
            content: initialData?.content ?? '',
            image_url: initialData?.image_url ?? '',
            created_at: initialData?.created_at ?? null,
            source: initialData?.source ?? '',
        });
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.content) {
            alert('Vui lòng điền đầy đủ tiêu đề và nội dung.');
            return;
        }
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {initialData ? 'Chỉnh sửa bài viết' : 'Thêm bài viết mới'}
            </h2>
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
                <input id="title" name="title" type="text" value={formData.title} onChange={handleChange} placeholder="Tiêu đề bài viết" className="w-full p-2 border rounded-lg text-gray-700 focus:ring-cyan-500 focus:border-cyan-500" />
            </div>
            <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">Nội dung (hỗ trợ HTML)</label>
                <textarea id="content" name="content" value={formData.content} onChange={handleChange} rows={8} placeholder="Nội dung bài viết..." className="w-full p-2 border rounded-lg text-gray-700 focus:ring-cyan-500 focus:border-cyan-500" />
            </div>
            <div>
                <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-1">URL Hình ảnh</label>
                <input id="image_url" name="image_url" type="text" value={formData.image_url} onChange={handleChange} placeholder="https://example.com/image.jpg" className="w-full p-2 border rounded-lg text-gray-700 focus:ring-cyan-500 focus:border-cyan-500" />
            </div>
            <div>
                <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-1">Nguồn</label>
                <input
                    id="source"
                    name="source"
                    type="text"
                    value={formData.source ?? ''}
                    onChange={handleChange}
                    placeholder="Nguồn tin tức (ví dụ: Báo Mới)"
                    className="w-full p-2 border rounded-lg text-gray-700 focus:ring-cyan-500 focus:border-cyan-500"
                />
            </div>
            {initialData && initialData.created_at && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày tạo</label>
                    <input type="text" value={new Date(initialData.created_at).toLocaleString('vi-VN')} readOnly className="w-full p-2 border rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed" />
                </div>
            )}
            <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Hủy</button>
                <button type="submit" className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700">{initialData ? 'Cập nhật' : 'Lưu'}</button>
            </div>
        </form>
    );
};

// --- Main Page Component ---
export default function AdminNewsPage() {
    const [articles, setArticles] = useState<NewsArticle[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10); // Cho phép chọn số bài/trang
    const [total, setTotal] = useState(0);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
    const [deletingArticle, setDeletingArticle] = useState<NewsArticle | null>(null);
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        fetchNewsList({ search: searchTerm, page: currentPage, limit: itemsPerPage })
            .then(data => {
                setArticles(data.news);
                setTotal(data.total);
            });
    }, [searchTerm, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(total / itemsPerPage);
    // Xử lý sự kiện
    const handlePageChange = (page: number) => {
        if (page > 0 && page <= totalPages) setCurrentPage(page);
    };

    const handleOpenModal = (article: NewsArticle | null = null) => {
        setEditingArticle(article);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingArticle(null);
    };

    const getToken = async () => {
        if (typeof window !== 'undefined') {
            const { auth } = await import('@/lib/firebase');
            const user = auth.currentUser;
            return user ? await user.getIdToken() : '';
        }
        return '';
    };

    const handleFormSubmit = async (articleData: NewsArticle) => {
        setLoading(true);
        try {
            const token = await getToken();
            if (editingArticle) {
                // Update
                await updateNews(editingArticle.news_id, articleData, token);
            } else {
                // Create
                await createNews(articleData, token);
            }
            const updated = await fetchNews();
            setArticles(updated);
            handleCloseModal();
        } catch (err: any) {
            alert(err.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteConfirm = async (article: NewsArticle) => {
        setLoading(true);
        try {
            const token = await getToken();
            await deleteNews(article.news_id, token);
            const updated = await fetchNews();
            setArticles(updated);
            setDeletingArticle(null);
        } catch (err: any) {
            alert(err.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout>
            <div className="p-6 bg-gray-50 min-h-screen">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">📰 Quản lý Tin tức</h1>
                <p className="text-gray-600 mb-6">Tạo, sửa, xóa và quản lý các bài viết tin tức.</p>

                {/* Control Bar: Search, Add */}
                <div className="bg-white rounded-lg shadow p-4 mb-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="relative w-full md:flex-grow">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3"><SearchIcon /></span>
                            <input
                                type="text"
                                placeholder="Tìm theo tiêu đề..."
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                className="w-full pl-10 pr-4 py-2 border rounded-lg text-gray-700 focus:ring-cyan-500 focus:border-cyan-500"
                            />
                        </div>
                        <button onClick={() => handleOpenModal()} className="flex items-center justify-center w-full md:w-auto px-4 py-2 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition-colors shadow flex-shrink-0">
                            <PlusIcon />
                            <span className="ml-2">Thêm bài viết</span>
                        </button>
                    </div>
                </div>

                {/* Articles Table */}
                <div className="bg-white rounded-lg shadow overflow-x-auto">
                    <table className="w-full min-w-max text-sm text-left text-gray-600">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                            <tr>
                                <th scope="col" className="px-6 py-3">Bài viết</th>
                                <th scope="col" className="px-6 py-3">Nguồn</th>
                                <th scope="col" className="px-6 py-3">Ngày tạo</th>
                                <th scope="col" className="px-6 py-3 text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {articles.map((article) => (
                                <tr key={article.news_id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <img
                                                className="w-16 h-16 rounded-md object-cover mr-4 bg-gray-100"
                                                src={article.image_url || 'https://placehold.co/64x64/E2E8F0/4A5568?text=...'}
                                                alt={article.title}
                                                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://placehold.co/64x64/E2E8F0/4A5568?text=...'; }}
                                            />
                                            <span className="font-semibold text-gray-800">{article.title}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{article.source || 'N/A'}</td>
                                    <td className="px-6 py-4">
                                        {article.created_at ? new Date(article.created_at).toLocaleString('vi-VN') : 'Chưa có'}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button onClick={() => handleOpenModal(article)} className="font-medium text-blue-600 hover:underline mr-3">Sửa</button>
                                        <button onClick={() => setDeletingArticle(article)} className="font-medium text-red-600 hover:underline">Xóa</button>
                                    </td>
                                </tr>
                            ))}
                            {articles.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="text-center py-10 text-gray-500">Không có bài viết nào.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-6">
                        <span className="text-sm text-gray-700">
                            Hiển thị <span className="font-semibold">{articles.length}</span> trên tổng số <span className="font-semibold">{total.length}</span> kết quả
                        </span>
                        <div className="inline-flex rounded-md shadow-sm">
                            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 disabled:opacity-50">Trước</button>
                            <span className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border-t border-b border-gray-300">Trang {currentPage} / {totalPages}</span>
                            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 disabled:opacity-50">Sau</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <Modal onClose={handleCloseModal}>
                    <NewsArticleForm initialData={editingArticle} onSubmit={handleFormSubmit} onCancel={handleCloseModal} />
                </Modal>
            )}

            {/* Delete Confirmation Modal */}
            {deletingArticle && (
                <Modal onClose={() => setDeletingArticle(null)}>
                    <div className="p-6">
                        <h3 className="text-lg font-bold text-gray-900">Xác nhận xóa</h3>
                        <p className="mt-2 text-sm text-gray-600">Bạn có chắc chắn muốn xóa bài viết "{deletingArticle.title}" không? Hành động này không thể hoàn tác.</p>
                        <div className="mt-6 flex justify-end space-x-3">
                            <button onClick={() => setDeletingArticle(null)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Hủy</button>
                            <button onClick={() => handleDeleteConfirm(deletingArticle)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Xóa</button>
                        </div>
                    </div>
                </Modal>
            )}
        </AdminLayout>
    );
}
