'use client';

import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import fetchWithAuth from '@/lib/apiClient';
import { Button } from '@/components/ui/button';

export default function CrawlerAdminPage() {
    const [running, setRunning] = useState(false);

    const onRun = async () => {
        setRunning(true);
        try {
            const r = await fetchWithAuth('/api/admin/trigger-github', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}), // Use server defaults (owner/repo/workflow/ref)
                credentials: 'include',
            });
            const j = await r.json();
            if (!j.success) throw new Error(j.message || JSON.stringify(j));
            if (j.runUrl) window.open(j.runUrl, '_blank');
        } catch (e) {
            console.error(e);
        } finally {
            setRunning(false);
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg border">
                    <h2 className="font-semibold mb-4">Crawler</h2>
                    <p className="text-sm text-slate-600 mb-4">Nhấn nút để chạy workflow crawler trên GitHub Actions (dùng cấu hình mặc định trong repo backend).</p>
                    <Button onClick={onRun} disabled={running}>{running ? 'Đang chạy…' : 'Chạy workflow'}</Button>
                </div>
            </div>
        </AdminLayout>
    );
}
