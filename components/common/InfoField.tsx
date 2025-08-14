import React from 'react';

interface InfoFieldProps {
    label: string;
    value: any;
    isEditing: boolean;
    name: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
}

const InfoField: React.FC<InfoFieldProps> = ({ label, value, isEditing, name, onChange, type = 'text' }) => (
    <div>
        <label className="text-sm font-medium text-slate-500">{label}</label>
        {isEditing ? (
            <input type={type} name={name} value={value} onChange={onChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500" />
        ) : (
            <p className="font-semibold text-slate-800 text-base mt-1 break-words">{value || 'Chưa cập nhật'}</p>
        )}
    </div>
);

export default InfoField;
// Component để hiển thị trường thông tin với khả năng chỉnh sửa của personal information
