import React from 'react';
import { X } from 'lucide-react';

interface FavoriteServiceCardProps {
    service: {
        id: string;
        name: string;
        description: string;
        image_url: string;
        bookingUrl: string;
    };
    onRemove: (id: string) => void;
}

const FavoriteServiceCard: React.FC<FavoriteServiceCardProps> = ({ service, onRemove }) => (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300 border border-slate-100 overflow-hidden group">
        <div className="relative">
            <img src={service.image_url} alt={service.name} className="w-full h-40 object-cover" />
            <button
                onClick={() => onRemove(service.id)}
                className="absolute top-3 right-3 bg-black/40 text-white w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                aria-label="Bỏ yêu thích"
            >
                <X size={18} />
            </button>
        </div>
        <div className="p-5 flex flex-col flex-grow">
            <h3 className="font-bold text-slate-800 text-lg">{service.name}</h3>
            <p className="text-sm text-slate-500 mt-1 flex-grow">{service.description}</p>
            <a href={service.bookingUrl} className="mt-4 w-full text-center bg-teal-500 text-white font-bold py-2.5 rounded-lg hover:bg-teal-600 transition-colors">
                Đặt lại
            </a>
        </div>
    </div>
);

export default FavoriteServiceCard;
// Component để hiển thị thẻ dịch vụ yêu thích với khả năng bỏ yêu thích