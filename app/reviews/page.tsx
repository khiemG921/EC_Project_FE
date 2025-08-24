'use client'; // This is a client component

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Star, Heart, User, Send, Loader2, X } from 'lucide-react';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import { logDev } from '@/lib/utils';
import fetchWithAuth from '@/lib/apiClient';


interface Service {
  id: number;
  name: string;
  description: string;
  type: string;
  image_url: string;
  status: string;
  price_from: number;
  duration: string;
}

interface Customer {
  customer_id: number;
  name: string;
  avatar_url: string;
}

interface Review {
  review_id: number;
  customer_id: number;
  job_id: number;
  service_id: number; // Đã đổi thành number
  rating_job: number;
  rating_tasker: number;
  detail: string;
  Customer: Customer;
}

// Hàm với exponential backoff để gọi API
const fetchWithExponentialBackoff = async (url: string, options: RequestInit, maxRetries = 5, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetchWithAuth(url, options);
      if (response.status !== 429) { // 429 Too Many Requests
        return response;
      }
    } catch (error) {
      console.error(`Fetch attempt ${i + 1} failed:`, error);
    }
    await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
  }
  throw new Error('Tất cả các lần thử đều thất bại.');
};

// Component Modal tùy chỉnh thay thế alert()
const CustomModal = ({ message, onClose }: { message: string; onClose: () => void }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full text-center shadow-lg">
        <p className="text-lg font-semibold mb-4">{message}</p>
        <button
          onClick={onClose}
          className="bg-teal-500 text-white px-4 py-2 rounded-full hover:bg-teal-600 transition-colors"
        >
          Đóng
        </button>
      </div>
    </div>
  );
};

function ServiceDetailContent() {
  const searchParams = useSearchParams();
  const serviceId = searchParams.get('serviceId');
const API_BASE_URL = (globalThis as any)?.process?.env?.NEXT_PUBLIC_API_URL || 'https://ecprojectbe-production.up.railway.app';
  const [service, setService] = useState<Service | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [modalMessage, setModalMessage] = useState<string | null>(null);

  const [reviewRating, setReviewRating] = useState<number>(0);
  const [reviewDetail, setReviewDetail] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Giả lập dữ liệu người dùng và yêu thích, bạn sẽ thay thế bằng dữ liệu thực
  const MOCK_LOGGED_IN = true;
  const MOCK_USER = { 
    customer_id: 1, 
    name: 'Lê Văn C', 
    email: 'levanc@example.com', 
    roles: ['customer'], 
    avatar_url: 'https://placehold.co/40x40/f4f4f4/000000?text=C' 
  };
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const user = MOCK_LOGGED_IN ? MOCK_USER : null;

  useEffect(() => {
    if (!serviceId) {
      setIsLoading(false);
      return;
    }

    const fetchServiceAndReviews = async () => {
      try {
        // Gọi API services (single service)
        const resService = await fetchWithExponentialBackoff(`${API_BASE_URL}/api/services/${serviceId}`, {});
        if (!resService.ok) {
          throw new Error('Không thể tải thông tin dịch vụ');
        }
        const serviceData = await resService.json();
        setService(serviceData);
        logDev("Service Data:", serviceData);

        const resReviews = await fetchWithExponentialBackoff(`${API_BASE_URL}/api/reviews/service/${serviceId}`, {});
        if (!resReviews.ok) {
          const txt = await resReviews.text().catch(() => '');
          console.error('Fetch reviews failed:', resReviews.status, txt);
          throw new Error('Không thể tải các đánh giá');
        }
        const dataReviews = await resReviews.json();
        setReviews(dataReviews);
        logDev("Review Data:", dataReviews);

      } catch (err: any) {
        console.error('Lỗi khi lấy dữ liệu:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServiceAndReviews();
  }, [serviceId]);

  const handleReviewSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (reviewRating === 0 || reviewDetail.trim() === '') {
        setModalMessage('Vui lòng điền đầy đủ thông tin đánh giá.');
        return;
    }
    if (!user) {
        setModalMessage('Bạn cần đăng nhập để gửi đánh giá.');
        return;
    }

    setIsSubmitting(true);
    
    const newReviewData = {
      customer_id: user.customer_id,
      job_id: Math.floor(Math.random() * 1000),
      service_id: parseInt(serviceId as string, 10),
      rating_job: reviewRating,
      rating_tasker: reviewRating,
      detail: reviewDetail,
    };

    try {
  const response = await fetchWithExponentialBackoff(`${API_BASE_URL}/api/reviews`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(newReviewData),
        });

        if (!response.ok) {
          throw new Error('Đăng đánh giá thất bại');
        }

        const result = await response.json();
        const createdReview = { ...newReviewData, review_id: result.review_id || Date.now(), Customer: MOCK_USER };
        
        setReviews((prev) => [createdReview, ...prev]);
        setReviewRating(0);
        setReviewDetail('');
        setModalMessage('Đánh giá của bạn đã được gửi thành công!');

    } catch (err: any) {
        console.error('Lỗi khi gửi đánh giá:', err);
        setModalMessage('Đã xảy ra lỗi khi gửi đánh giá. Vui lòng thử lại.');
    } finally {
        setIsSubmitting(false);
    }
  };

  const isFavorite = serviceId ? favoriteIds.includes(parseInt(serviceId as string, 10)) : false;
  const handleToggleFavorite = () => {
    if (!user) {
      setModalMessage('Vui lòng đăng nhập để sử dụng chức năng này.');
      return;
    }
    const idAsNumber = parseInt(serviceId as string, 10);
    setFavoriteIds(prev =>
      prev.includes(idAsNumber)
        ? prev.filter(id => id !== idAsNumber)
        : [...prev, idAsNumber]
    );
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="animate-spin text-teal-500" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 text-lg p-10">
        Đã xảy ra lỗi khi tải dữ liệu: {error}
      </div>
    );
  }

  if (!serviceId) {
    return (
      <div className="text-center text-red-500 text-lg p-10">
        Vui lòng cung cấp serviceId.
      </div>
    );
  }

  return (
    <>
      <Header />

      {/* main với padding-top để tránh header sticky che nội dung */}
      <main className="pt-20">
        <div className="container mx-auto p-6 md:p-12 bg-gray-50 min-h-screen font-sans">
          <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="relative">
              <img
                src={service?.image_url || 'https://placehold.co/1000x400/f4f4f4/000000?text=Service+Image'}
                alt={service?.name || 'Service'}
                className="w-full h-80 object-cover"
              />
              {user && (
                <button 
                  onClick={handleToggleFavorite} 
                  className="absolute top-6 right-6 p-3 bg-white/70 backdrop-blur-sm rounded-full shadow-lg transition-transform duration-300 hover:scale-110"
                  title={isFavorite ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
                >
                  <Heart fill={isFavorite ? '#ef4444' : 'none'} size={32} className={isFavorite ? 'text-red-500' : 'text-gray-600'} />
                </button>
              )}
            </div>
            <div className="p-8">
              <h1 className="text-5xl font-extrabold text-gray-900 mb-4">{service?.name || 'Dịch vụ'}</h1>
              <div className="flex items-center text-yellow-500 mb-6">
                <span className="text-3xl font-bold mr-2">4.8</span>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={28} fill={i < 5 ? '#f59e0b' : 'none'} strokeWidth={1} />
                ))}
              </div>
              <p className="text-3xl font-bold text-green-600 mb-6">{service?.price_from ? service.price_from.toLocaleString('vi-VN') + ' VND' : 'Đang cập nhật'} / {service?.duration || '...'}</p>
              <div className="prose max-w-none text-gray-700">
                <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Mô tả dịch vụ</h2>
                <p>{service?.description || 'Đang cập nhật mô tả...'}</p>
              </div>

              {/* Review Section */}
              <div className="mt-12">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-6">Đánh giá từ khách hàng</h2>
                {user && (
                  <form onSubmit={handleReviewSubmit} className="p-6 bg-gray-100 rounded-xl shadow-inner mb-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Viết đánh giá của bạn</h3>
                    <div className="mb-4">
                      <label className="block text-gray-700 font-medium mb-2">Đánh giá sao:</label>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={32}
                            className={`cursor-pointer transition-colors duration-200 ${
                              star <= reviewRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                            }`}
                            onClick={() => setReviewRating(star)}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 font-medium mb-2" htmlFor="reviewDetail">
                        Chi tiết đánh giá:
                      </label>
                      <textarea
                        id="reviewDetail"
                        name="detail"
                        value={reviewDetail}
                        onChange={(e) => setReviewDetail(e.target.value)}
                        rows={4}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                        placeholder="Chia sẻ cảm nhận của bạn về dịch vụ..."
                      />
                    </div>
                    <div className="flex justify-end space-x-4">
                      <button
                        type="submit"
                        disabled={isSubmitting || reviewRating === 0 || reviewDetail.trim() === ''}
                        className={`py-3 px-6 rounded-full font-semibold transition-colors duration-200 ${
                          isSubmitting || reviewRating === 0 || reviewDetail.trim() === '' ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-teal-500 text-white hover:bg-teal-600'
                        }`}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="animate-spin mr-2 inline" size={20} />
                            Đang gửi...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 inline" size={20} />
                            Gửi đánh giá
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}

                {reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.review_id} className="p-6 bg-white rounded-xl shadow-md border border-gray-200">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center">
                            <img
                              src={review.Customer?.avatar_url || 'https://placehold.co/48x48/f4f4f4/000000?text=C'}
                              alt={review.Customer?.name || 'Anonymous'}
                              className="w-12 h-12 rounded-full border-2 border-gray-300 object-cover"
                            />
                            <div className="ml-4">
                              <p className="font-bold text-lg text-gray-800">{review.Customer?.name || 'Khách hàng ẩn danh'}</p>
                            </div>
                          </div>
                          <div className="flex items-center text-yellow-500">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={20} fill={i < review.rating_job ? '#f59e0b' : 'none'} strokeWidth={1} />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-700 leading-relaxed italic">"{review.detail}"</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-lg text-center p-10 bg-white rounded-xl shadow-md">
                    Chưa có đánh giá nào cho dịch vụ này.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal tùy chỉnh */}
      {modalMessage && <CustomModal message={modalMessage} onClose={() => setModalMessage(null)} />}
      <Footer />
    </>
  );
}

export default function ServiceDetail() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="animate-spin text-teal-500" size={48} />
      </div>
    }>
      <ServiceDetailContent />
    </Suspense>
  );
}
