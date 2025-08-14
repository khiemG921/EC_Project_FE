import React from 'react';
import { Users, Briefcase, DollarSign, Shield } from 'lucide-react';

const StatCard = ({ icon: Icon, title, value, color }: any) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-shadow border border-slate-100 flex items-center gap-5">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}><Icon className="text-white" size={24} /></div>
        <div><p className="text-slate-500 text-sm font-medium">{title}</p><p className="text-slate-800 text-2xl font-bold">{value}</p></div>
    </div>
);

const AdminDashboard = ({ user }: any) => {
    const adminData = {
        stats: { totalUsers: 1250, activeTaskers: 350, totalRevenue: '950.000.000 VNĐ', disputedTasks: 4 },
        recentUsers: [
            { id: 1, name: 'Phạm Thị D', email: 'd@email.com', role: 'customer', date: '11/07/2025' },
            { id: 2, name: 'Hoàng Văn E', email: 'e@email.com', role: 'tasker', date: '10/07/2025' },
        ]
    };

    return (
        <main className="container mx-auto p-6 lg:p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800">Trang Quản trị</h1>
                <p className="text-slate-500 mt-1">Tổng quan hoạt động hệ thống.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard icon={Users} title="Tổng người dùng" value={adminData.stats.totalUsers} color="bg-blue-500" />
                <StatCard icon={Briefcase} title="Đối tác hoạt động" value={adminData.stats.activeTaskers} color="bg-teal-500" />
                <StatCard icon={DollarSign} title="Tổng doanh thu" value={adminData.stats.totalRevenue} color="bg-green-500" />
                <StatCard icon={Shield} title="Khiếu nại" value={adminData.stats.disputedTasks} color="bg-red-500" />
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-xl font-bold text-slate-800 mb-5">Người dùng mới đăng ký</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                            <tr><th className="px-6 py-3">Tên</th><th className="px-6 py-3">Email</th><th className="px-6 py-3">Vai trò</th><th className="px-6 py-3">Ngày tham gia</th><th className="px-6 py-3">Hành động</th></tr>
                        </thead>
                        <tbody>
                            {adminData.recentUsers.map(u => (
                                <tr key={u.id} className="bg-white border-b">
                                    <td className="px-6 py-4 font-medium text-slate-900">{u.name}</td>
                                    <td className="px-6 py-4">{u.email}</td>
                                    <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${u.role === 'customer' ? 'bg-blue-100 text-blue-800' : 'bg-teal-100 text-teal-800'}`}>{u.role}</span></td>
                                    <td className="px-6 py-4">{u.date}</td>
                                    <td className="px-6 py-4"><a href="#" className="font-medium text-blue-600 hover:underline">Xem</a></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
};

export default AdminDashboard;
