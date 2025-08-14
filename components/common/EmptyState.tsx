import React from 'react';

interface EmptyStateProps {
    icon: React.ReactNode;
    title: string;
    description: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description }) => (
    <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
        {icon}
        <h3 className="mt-4 text-xl font-bold text-slate-800">{title}</h3>
        <p className="mt-1 text-slate-500">{description}</p>
    </div>
);

export default EmptyState;
// Component để hiển thị trạng thái rỗng trong các danh sách hoặc trang không có dữ liệu