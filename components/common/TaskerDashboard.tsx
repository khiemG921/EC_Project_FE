import React from 'react';
import { DollarSign, Star, Briefcase, ArrowRight } from 'lucide-react';

const StatCard = ({ icon: Icon, title, value, color }: any) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-shadow border border-slate-100 flex items-center gap-5">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}><Icon className="text-white" size={24} /></div>
        <div><p className="text-slate-500 text-sm font-medium">{title}</p><p className="text-slate-800 text-2xl font-bold">{value}</p></div>
    </div>
);

const TaskerDashboard = ({ user }: any) => {
    const taskerData = {
        stats: { monthlyEarning: '12.500.000 VNĐ', avgRating: 4.9, newInvites: 5 },
        jobInvites: [
            { id: 3, service: "Tổng vệ sinh", date: "18/07/2025", time: "Cả ngày", reward: "800.000 VNĐ" },
            { id: 4, service: "Vệ sinh máy lạnh", date: "19/07/2025", time: "10:00", reward: "250.000 VNĐ" },
        ]
    };

    return (
        <main className="container mx-auto p-6 lg:p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800">Bảng điều khiển Đối tác</h1>
                <p className="text-slate-500 mt-1">Quản lý công việc và thu nhập của bạn.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <StatCard icon={DollarSign} title="Thu nhập tháng này" value={taskerData.stats.monthlyEarning} color="bg-green-500" />
                <StatCard icon={Star} title="Đánh giá trung bình" value={taskerData.stats.avgRating} color="bg-amber-500" />
                <StatCard icon={Briefcase} title="Lời mời mới" value={taskerData.stats.newInvites} color="bg-sky-500" />
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-5">
                    <h3 className="text-xl font-bold text-slate-800">Cơ hội việc làm mới</h3>
                    <a href="/jobs-board" className="flex items-center gap-1 text-sm font-semibold text-teal-600 hover:underline">Tìm việc <ArrowRight size={14} /></a>
                </div>
                {taskerData.jobInvites.length > 0 ? (
                    <div className="space-y-4">
                        {taskerData.jobInvites.map(job => (
                            <div key={job.id} className="bg-slate-50 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                <div>
                                    <p className="font-bold text-slate-800">{job.service}</p>
                                    <p className="text-sm text-slate-500 mt-1">{job.date} lúc {job.time} - <span className="font-semibold text-green-600">{job.reward}</span></p>
                                </div>
                                <div className="flex gap-2">
                                    <button className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-300">Từ chối</button>
                                    <button className="bg-teal-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-teal-600">Chấp nhận</button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : <p className="text-slate-500">Hiện không có lời mời làm việc nào.</p>}
            </div>
        </main>
    );
};

export default TaskerDashboard;
// Component để hiển thị bảng điều khiển đối tác với thống kê thu nhập, đánh giá và lời mời làm việc mới
