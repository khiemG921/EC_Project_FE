"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { Search, ChevronRight, ArrowLeft } from 'lucide-react';
import { Header, Footer } from '../../components/Header';
import { NewsArticle } from '../../types/news';
import { fetchNewsList, fetchNewsDetail } from '../../lib/newsApi';
import { Service, fetchServices } from '../../lib/servicesApi';

const DEFAULT_IMG = "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaDQ3MDA4Zzc2djh4bzV3dngzdnpseWJ3dGx0NTFpb3Jxd2NiaDlkbiZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/BOHvk845AYKAVlETl4/giphy.gif";

// ===================== NewsListPage =====================
const NewsListPage: React.FC<{ onNavigate: (page: string, params?: any) => void }> = ({ onNavigate }) => {
    const [articles, setArticles] = useState<NewsArticle[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [error, setError] = useState('');
    const limit = 10;
    const totalPages = Math.ceil(total / limit);

    useEffect(() => {
        setLoading(true);
        fetchNewsList({ search, page, limit })
            .then(data => {
                setArticles(data.news);
                setTotal(data.total);
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [search, page]);

    return (
        <div className="bg-white">
            <div className="bg-gray-50 py-12">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl font-bold text-gray-800 text-center">Tin Tức</h1>
                    <div className="text-sm text-gray-500 text-center mt-2">
                        <a href="#" onClick={e => { e.preventDefault(); onNavigate('home'); }} className="hover:text-emerald-600">Trang chủ</a>
                        <span className="mx-2">/</span>
                        <span>Tin tức</span>
                    </div>
                </div>
            </div>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {error && <div className="text-red-500 text-center mb-4">{error}</div>}
                {loading ? (
                    <div className="text-center py-20">Đang tải dữ liệu...</div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                            <div className="col-span-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {articles.map(article => (
                                        <div key={article.news_id} className="bg-white rounded-xl shadow-lg overflow-hidden group transform hover:-translate-y-2 transition-all duration-300 flex flex-col">
                                            <img
                                                src={article.image_url ? article.image_url : DEFAULT_IMG}
                                                alt={article.title}
                                                className={`w-full h-56 ${!article.image_url ? 'object-contain max-h-48 bg-white' : 'object-cover'}`}
                                                onError={e => { (e.currentTarget as HTMLImageElement).src = DEFAULT_IMG; }}
                                            />
                                            <div className="p-6 flex flex-col flex-grow">
                                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex-grow hover:text-emerald-600 transition-colors">
                                                    <a href="#" onClick={e => { e.preventDefault(); onNavigate('newsDetail', { id: article.news_id }); }}>{article.title}</a>
                                                </h3>
                                                <a href="#" onClick={e => { e.preventDefault(); onNavigate('newsDetail', { id: article.news_id }); }} className="text-emerald-600 font-semibold hover:underline flex items-center self-start">
                                                    Đọc thêm <ChevronRight size={16} className="ml-1" />
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        {/* Phân trang */}
                        {totalPages > 1 && (
                            <div className="flex justify-center mt-8 space-x-2">
                                <button
                                    className="px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-emerald-100 disabled:opacity-50"
                                    onClick={() => setPage(page - 1)}
                                    disabled={page === 1}
                                >
                                    Trang trước
                                </button>
                                <span className="px-4 py-2 text-gray-600">{page} / {totalPages}</span>
                                <button
                                    className="px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-emerald-100 disabled:opacity-50"
                                    onClick={() => setPage(page + 1)}
                                    disabled={page === totalPages}
                                >
                                    Trang sau
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

// ===================== ArticleDetailPage =====================
const ArticleDetailPage: React.FC<{ articleId: number; onNavigate: (page: string, params?: any) => void }> = ({ articleId, onNavigate }) => {
    const [article, setArticle] = useState<NewsArticle | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        setLoading(true);
        fetchNewsDetail(articleId)
            .then(data => setArticle(data))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [articleId]);

    if (loading) return <div className="text-center py-20">Đang tải dữ liệu...</div>;
    if (error) return <div className="text-center py-20 text-red-500">{error}</div>;
    if (!article) return <div className="text-center py-20">Không tìm thấy bài viết.</div>;

    return (
        <div className="bg-white">
            <div className="bg-gray-50 py-8">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <a href="#" onClick={e => { e.preventDefault(); onNavigate('newsList'); }} className="flex items-center text-emerald-600 hover:underline mb-4">
                        <ArrowLeft size={18} className="mr-2" />
                        Quay lại danh sách tin tức
                    </a>
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-800">{article.title}</h1>
                </div>
            </div>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="max-w-3xl mx-auto">
                    <img
                        src={article.image_url ? article.image_url : DEFAULT_IMG}
                        alt={article.title}
                        className={`w-full mb-8 rounded-lg shadow-lg ${!article.image_url ? 'object-contain max-h-72 bg-white' : 'object-cover'}`}
                        onError={e => { (e.currentTarget as HTMLImageElement).src = DEFAULT_IMG; }}
                    />
                    <div
                        className="prose lg:prose-xl max-w-none"
                        dangerouslySetInnerHTML={{ __html: article.content }}
                    />
                </div>
            </div>
        </div>
    );
};

// ===================== MAIN - News =====================
export default function NewsPage() {
    const [route, setRoute] = useState<{ page: string; params: any }>({ page: 'newsList', params: {} });
    const [services, setServices] = useState<Service[]>([]);

    useEffect(() => {
        fetchServices().then(setServices).catch(() => setServices([]));
    }, []);

    const navigate = (page: string, params: any = {}) => {
        setRoute({ page, params });
        window.scrollTo(0, 0);
    };

    const renderPage = () => {
        switch (route.page) {
            case 'newsList':
                return <NewsListPage onNavigate={navigate} />;
            case 'newsDetail':
                return <ArticleDetailPage articleId={route.params.id} onNavigate={navigate} />;
            default:
                return <NewsListPage onNavigate={navigate} />;
        }
    };

    return (
        <div className="font-sans">
            <Header />
            <main>{renderPage()}</main>
            <Footer services={services} />
        </div>
    );
}
