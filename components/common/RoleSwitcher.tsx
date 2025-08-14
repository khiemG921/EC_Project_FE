"use client";
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const roleLabel = (role: string) => {
    if (role === 'customer') return 'Khách hàng';
    if (role === 'tasker') return 'Đối tác';
    if (role === 'admin') return 'Quản trị';
    return role;
};

const RoleSwitcher = ({ roles, activeRole, onRoleChange }: {
    roles: string[];
    activeRole: string;
    onRoleChange: (role: string) => void;
}) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        if (open) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [open]);

    return (
        <div className="relative inline-block text-left" ref={ref}>
            <button
                type="button"
                className={`inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg shadow-sm border border-slate-200 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all ${open ? 'ring-2 ring-teal-500' : ''}`}
                id="role-menu"
                aria-haspopup="true"
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
            >
                <span>{roleLabel(activeRole)}</span>
                <ChevronDown size={16} className={`text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
                <div className="origin-top-right absolute right-0 mt-2 w-40 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 animate-fade-in-down">
                    <div className="py-1">
                        {roles.map((role) => (
                            <button
                                key={role}
                                onClick={() => {
                                    onRoleChange(role);
                                    setOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2 text-sm rounded-lg transition-colors ${role === activeRole ? 'bg-teal-50 text-teal-600 font-bold' : 'text-slate-700 hover:bg-slate-100'}`}
                            >
                                {roleLabel(role)}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoleSwitcher;
// Component để chuyển đổi vai trò người dùng với danh sách các vai trò và chức năng chọn vai trò hiện tại