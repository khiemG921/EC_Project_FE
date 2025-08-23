'use client';

import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import type { User } from '@/types/user';
import { fetchUsers, deleteUser, grantRoleUser, revokeRoleUser, updateUser as updateUserApi } from '@/lib/admin/users';

function getErrorMessage(err: unknown): string {
    if (!err) return '';
    if (err instanceof Error) return err.message;
    if (typeof err === 'string') return err;
    try {
        return JSON.stringify(err as object);
    } catch {
        return String(err);
    }
}

// --- SVG Icons (for demonstration without installing a library) ---
const SearchIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-gray-400"
    >
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
);

const FilterIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-gray-500"
    >
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
    </svg>
);

interface BadgeProps {
    text: string;
    colorClass: string;
}

interface RankingBadgeProps {
    ranking: 'bronze' | 'silver' | 'gold' | 'platinum';
}

interface StatusBadgeProps {
    isActive: boolean;
}

function Avatar({ src, name }: { src?: string; name?: string }) {
    if (src)
        return (
            <img
                src={src}
                alt={name}
                className="w-10 h-10 rounded-full object-cover"
            />
        );
    const initials = (name || 'U')
        .split(' ')
        .map((s) => s[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
    return (
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-700">
            {initials}
        </div>
    );
}

// --- Main Component (Component chính) ---

export default function AdminCustomersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [editing, setEditing] = useState<User | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState<'all' | string>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Load users
    const loadUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchUsers();
            setUsers(data);
        } catch (err: unknown) {
            setError(getErrorMessage(err) || 'Lỗi khi tải dữ liệu người dùng');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const filtered = useMemo(() => {
        return users.filter((u) => {
            const matchesSearch = [u.name, u.email, u.phone || '']
                .join(' ')
                .toLowerCase()
                .includes(searchTerm.toLowerCase());
            const matchesRole =
                filterRole === 'all' || (u.roles || []).includes(filterRole);
            return matchesSearch && matchesRole;
        });
    }, [users, searchTerm, filterRole]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
    const pageSlice = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filtered.slice(start, start + itemsPerPage);
    }, [filtered, currentPage]);

    const handleDelete = async (id: string) => {
        if (!confirm('Xác nhận xóa người dùng này?')) return;
        try {
            await deleteUser(id);
            // optimistic refresh
            setUsers((prev) => prev.filter((u) => u.id !== id));
        } catch (err: unknown) {
            alert(getErrorMessage(err) || 'Không thể xóa người dùng');
        }
    };

    const toggleRole = async (id: string, role: 'admin' | 'tasker', enable: boolean) => {
        try {
            const roles = enable ? await grantRoleUser(id, role) : await revokeRoleUser(id, role);
            setUsers(prev => prev.map(u => u.id === id ? { ...u, roles } : u));
        } catch (err: unknown) {
            alert(getErrorMessage(err) || 'Không thể cập nhật vai trò');
        }
    };

    return (
        <AdminLayout>
            <div className="p-6 bg-gray-50 min-h-screen">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    👥 Quản lý Khách hàng
                </h1>
                <p className="text-gray-600 mb-6">
                    Xem, tìm kiếm, lọc và quản lý thông tin khách hàng.
                </p>
                <div className="bg-white rounded-lg shadow p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Search Input */}
                        <div className="md:col-span-1">
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                    <SearchIcon />
                                </span>
                                <input
                                    type="text"
                                    placeholder="Tìm theo tên, email, phone..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg text-gray-700 focus:ring-cyan-500 focus:border-cyan-500"
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                            <div className="flex items-center">
                                <FilterIcon />
                                <span className="ml-2 font-semibold text-gray-600">
                                    Bộ lọc:
                                </span>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600">
                                    Vai trò
                                </label>
                                <select
                                    value={filterRole}
                                    onChange={(
                                        e: React.ChangeEvent<HTMLSelectElement>
                                    ) => {
                                        setFilterRole(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="mt-1 block w-full border rounded-md p-2"
                                >
                                    <option value="all">Tất cả</option>
                                    <option value="admin">Admin</option>
                                    <option value="tasker">Tasker</option>
                                    <option value="customer">Customer</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600">
                                    Tổng kết
                                </label>
                                <div className="mt-1 text-sm text-gray-700">
                                    {users.length} người dùng
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bảng dữ liệu khách hàng */}
                <div className="bg-white rounded-lg shadow overflow-x-auto">
                    <table className="w-full min-w-max text-sm text-left text-gray-600">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                            <tr>
                                <th className="px-4 py-3">Người dùng</th>
                                <th className="px-4 py-3">Email</th>
                                <th className="px-4 py-3">SĐT</th>
                                <th className="px-4 py-3">Quyền</th>
                                <th className="px-4 py-3">Điểm thưởng</th>
                                <th className="px-4 py-3">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && (
                                <tr>
                                    <td colSpan={6} className="p-4">
                                        Đang tải...
                                    </td>
                                </tr>
                            )}
                            {!loading && error && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="p-4 text-red-600"
                                    >
                                        {error}
                                    </td>
                                </tr>
                            )}
                            {!loading &&
                                !error &&
                                pageSlice.map((user) => (
                                    <tr key={user.id} className="border-b">
                                        <td className="px-4 py-3 flex items-center gap-3">
                                            <Avatar
                                                src={user.avatar}
                                                name={user.name}
                                            />
                                            <div>
                                                <div className="font-medium text-gray-800">
                                                    {user.name || '—'}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    ID: {user.id}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {user.email}
                                        </td>
                                        <td className="px-4 py-3">
                                            {user.phone || '—'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <label className="inline-flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={(user.roles || []).includes('admin')}
                                                        onChange={(e) => toggleRole(user.id, 'admin', e.target.checked)}
                                                    />
                                                    <span className="text-sm">Admin</span>
                                                </label>
                                                <label className="inline-flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={(user.roles || []).includes('tasker')}
                                                        onChange={(e) => toggleRole(user.id, 'tasker', e.target.checked)}
                                                    />
                                                    <span className="text-sm">Tasker</span>
                                                </label>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {user.rewardPoints ?? 0}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() =>
                                                        handleDelete(user.id)
                                                    }
                                                    className="px-2 py-1 text-sm bg-red-50 text-red-700 border rounded"
                                                >
                                                    Xóa
                                                </button>
                                                <button onClick={() => setEditing(user)} className="px-2 py-1 text-sm bg-gray-50 text-gray-700 border rounded">Sửa</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            {!loading && !error && pageSlice.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-4">
                                        Không tìm thấy người dùng.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Phân trang */}
                {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-6">
                        <span className="text-sm text-gray-700">
                            Hiển thị{' '}
                            <span className="font-semibold">
                                {pageSlice.length}
                            </span>{' '}
                            trên tổng số{' '}
                            <span className="font-semibold">
                                {filtered.length}
                            </span>{' '}
                            kết quả
                        </span>
                        <div className="inline-flex rounded-md shadow-sm">
                            <button
                                onClick={() =>
                                    setCurrentPage((p) => Math.max(1, p - 1))
                                }
                                disabled={currentPage === 1}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 disabled:opacity-50"
                            >
                                Trước
                            </button>
                            <div className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border-t border-b border-gray-300">
                                Trang {currentPage} / {totalPages}
                            </div>
                            <button
                                onClick={() =>
                                    setCurrentPage((p) =>
                                        Math.min(totalPages, p + 1)
                                    )
                                }
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 disabled:opacity-50"
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                )}
            </div>
            {editing && (
                <EditUserModal
                    user={editing}
                    onClose={() => setEditing(null)}
                    onSaved={(u) => {
                        setUsers(prev => prev.map(x => x.id === u.id ? u : x));
                        setEditing(null);
                    }}
                />
            )}
        </AdminLayout>
    );
}

function EditUserModal({ user, onClose, onSaved }: { user: User; onClose: () => void; onSaved: (u: User) => void }) {
    const [form, setForm] = useState<Partial<User>>({ name: user.name, email: user.email, phone: user.phone, gender: user.gender, dob: user.dob, address: user.address, avatar: user.avatar });
    const [saving, setSaving] = useState(false);

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const save = async () => {
        setSaving(true);
        try {
            const updated = await updateUserApi(user.id, {
                name: form.name || '',
                email: form.email || '',
                phone: form.phone || '',
                gender: form.gender || '',
                dob: form.dob || '',
                address: form.address || '',
                avatar: form.avatar || '',
            });
            onSaved(updated);
        } catch (e: any) {
            alert(`Lưu thất bại: ${e?.message || e}`);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-lg shadow-lg">
                <div className="px-5 py-4 border-b font-semibold">Chỉnh sửa người dùng</div>
                <div className="p-5 grid grid-cols-1 gap-3">
                    <label className="text-sm text-gray-600">Họ tên<input name="name" value={form.name || ''} onChange={onChange} className="mt-1 w-full border rounded p-2" /></label>
                    <label className="text-sm text-gray-600">Email<input name="email" value={form.email || ''} onChange={onChange} className="mt-1 w-full border rounded p-2" /></label>
                    <label className="text-sm text-gray-600">SĐT<input name="phone" value={form.phone || ''} onChange={onChange} className="mt-1 w-full border rounded p-2" /></label>
                    <label className="text-sm text-gray-600">Giới tính<input name="gender" value={form.gender || ''} onChange={onChange} className="mt-1 w-full border rounded p-2" placeholder="male/female/other hoặc Nam/Nữ/Khác" /></label>
                    <label className="text-sm text-gray-600">Ngày sinh<input name="dob" type="date" value={(form.dob || '').slice(0,10)} onChange={onChange} className="mt-1 w-full border rounded p-2" /></label>
                    <label className="text-sm text-gray-600">Địa chỉ<input name="address" value={form.address || ''} onChange={onChange} className="mt-1 w-full border rounded p-2" /></label>
                    <label className="text-sm text-gray-600">Avatar URL<input name="avatar" value={form.avatar || ''} onChange={onChange} className="mt-1 w-full border rounded p-2" /></label>
                </div>
                <div className="px-5 py-4 border-t flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 border rounded">Hủy</button>
                    <button onClick={save} disabled={saving} className="px-4 py-2 bg-teal-600 text-white rounded disabled:opacity-50">{saving ? 'Đang lưu...' : 'Lưu'}</button>
                </div>
            </div>
        </div>
    );
}
