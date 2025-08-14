'use client';

import React from 'react';
import AdminGuard from "@/components/admin/AdminGuard";

interface AdminLayoutProps {
    children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    return (
        <AdminGuard>
            {children}
        </AdminGuard>
    );
}
