// Dùng chung cho toàn bộ app: user, service, tasker, v.v...

export const MOCK_USER = {
  id: 'cus123',
  name: 'Nguyễn Kim Anh',
  email: 'kim.anh@example.com',
  avatar: 'https://media.giphy.com/media/wJ0y1sXGzMqqwPE09G/giphy.gif',
  roles: ['customer', 'admin', 'tasker'],
};

export const MOCK_FAVORITE_SERVICES = [
  { id: 'svc1', name: 'Giúp việc theo giờ', description: 'Linh hoạt, nhanh chóng cho mọi nhu cầu.', image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=800&auto=format&fit=crop', bookingUrl: '/booking/hourly' },
  { id: 'svc2', name: 'Vệ sinh Sofa-Rèm', description: 'Làm sạch chuyên sâu, loại bỏ vết bẩn.', image: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?q=80&w=800&auto=format&fit=crop', bookingUrl: '/booking/upholstery' },
  // { id: 'svc3', name: 'Vệ sinh máy lạnh', description: 'Bảo dưỡng định kỳ, không khí trong lành.', image: 'https://images.unsplash.com/photo-1596541243939-70560a5734e4?q=80&w=800&auto=format&fit=crop', bookingUrl: '/booking/ac-cleaning' },
];

export const MOCK_FAVORITE_TASKERS = [
  { id: 'tsk1', name: 'Chị Lan', rating: 4.9, jobs: 125, avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200' },
  { id: 'tsk2', name: 'Anh Hùng', rating: 4.8, jobs: 98, avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200' },
];

// Có thể mở rộng thêm các mock khác nếu cần
