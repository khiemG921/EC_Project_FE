'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Send, Loader2 } from 'lucide-react';
import { taskerApplicationApi } from '@/lib/taskerApplicationApi';

interface TaskerApplicationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const TaskerApplicationModal: React.FC<TaskerApplicationModalProps> = ({
    isOpen,
    onClose,
    onSuccess
}) => {
    const [skills, setSkills] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!skills.trim()) {
            setError('Vui lòng nhập kỹ năng của bạn');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const result = await taskerApplicationApi.apply(skills.trim());
            
            if (result.success) {
                onSuccess();
                onClose();
                setSkills('');
            } else {
                setError(result.message || 'Có lỗi xảy ra khi gửi đơn đăng ký');
            }
        } catch (error) {
            console.error('Error submitting application:', error);
            setError('Có lỗi xảy ra khi gửi đơn đăng ký');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            onClose();
            setSkills('');
            setError('');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-800">Đăng ký làm Đối tác</h2>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClose}
                        disabled={isLoading}
                        className="p-1 hover:bg-slate-100 rounded-full"
                    >
                        <X size={20} />
                    </Button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="mb-4">
                        <label htmlFor="skills" className="block text-sm font-medium text-slate-700 mb-2">
                            Kỹ năng của bạn <span className="text-red-500">*</span>
                        </label>
                        <Input
                            id="skills"
                            type="text"
                            placeholder="Ví dụ: Vệ sinh nhà cửa, Giúp việc ca lẻ, Chăm sóc trẻ em..."
                            value={skills}
                            onChange={(e) => setSkills(e.target.value)}
                            disabled={isLoading}
                            className="w-full"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                            Mô tả ngắn gọn về những dịch vụ bạn có thể cung cấp
                        </p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <h3 className="font-semibold text-blue-800 mb-2">Quy trình xét duyệt:</h3>
                        <ul className="text-sm text-blue-700 space-y-1">
                            <li>• Đơn đăng ký sẽ được gửi đến admin</li>
                            <li>• Thời gian xét duyệt: 1-2 ngày làm việc</li>
                            <li>• Sau khi được duyệt, bạn có thể bắt đầu nhận việc</li>
                        </ul>
                    </div>

                    {/* Footer */}
                    <div className="flex gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isLoading}
                            className="flex-1"
                        >
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading || !skills.trim()}
                            className="flex-1 bg-teal-500 hover:bg-teal-600"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={16} className="mr-2 animate-spin" />
                                    Đang gửi...
                                </>
                            ) : (
                                <>
                                    <Send size={16} className="mr-2" />
                                    Gửi đơn đăng ký
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TaskerApplicationModal;
