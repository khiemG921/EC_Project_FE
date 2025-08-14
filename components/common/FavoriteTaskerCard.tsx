import React from 'react';
import { Star, Briefcase, X } from 'lucide-react';

interface FavoriteTaskerCardProps {
    tasker: {
        id: string;
        name: string;
        rating: number;
        jobs: number;
        avatar: string;
    };
    onRemove: (id: string) => void;
}

const FavoriteTaskerCard: React.FC<FavoriteTaskerCardProps> = ({ tasker, onRemove }) => (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300 border border-slate-100 p-5 group">
        <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
                <img src={tasker.avatar} alt={tasker.name} className="w-16 h-16 rounded-full object-cover" />
                <div>
                    <h3 className="font-bold text-slate-800 text-lg">{tasker.name}</h3>
                    <div className="flex items-center text-sm text-slate-500 mt-1 gap-3">
                        <span className="flex items-center gap-1"><Star size={14} className="text-amber-400 fill-current" /> {tasker.rating}</span>
                        <span className="flex items-center gap-1"><Briefcase size={14} /> {tasker.jobs} việc</span>
                    </div>
                </div>
            </div>
            <button
                onClick={() => onRemove(tasker.id)}
                className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Bỏ yêu thích"
            >
                <X size={20} />
            </button>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-100 flex gap-3">
            <a href={`/tasker/${tasker.id}`} className="flex-1 text-center bg-slate-100 text-slate-700 font-bold py-2.5 rounded-lg hover:bg-slate-200 transition-colors">Xem hồ sơ</a>
            <a href={`/booking?tasker=${tasker.id}`} className="flex-1 text-center bg-teal-500 text-white font-bold py-2.5 rounded-lg hover:bg-teal-600 transition-colors">Đặt lịch</a>
        </div>
    </div>
);

export default FavoriteTaskerCard;
// Component để hiển thị thẻ người làm việc yêu thích với khả năng bỏ yêu thích