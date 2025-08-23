'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import fetchWithAuth from '@/lib/apiClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function CrawlerAdminPage() {
    const [saving, setSaving] = useState(false);
    const [running, setRunning] = useState(false);
    const [form, setForm] = useState({ enabled: false, cron: '0 0 * * 0', pythonPath: 'python', mode: 'notebook' as 'notebook' | 'script', notebookPath: '', scriptPath: '', outputDir: '' });
    const [maxTotal, setMaxTotal] = useState<string>('500');

    // Load/save cấu hình từ localStorage để user điền sẵn
    useEffect(() => {
        try {
            const raw = localStorage.getItem('crawler.config');
            if (raw) {
                const saved = JSON.parse(raw);
                setForm({
                    enabled: !!saved.enabled,
                    cron: saved.cron || '0 0 * * 0',
                    pythonPath: saved.pythonPath || 'python',
                    mode: (saved.mode || 'notebook') as 'notebook' | 'script',
                    notebookPath: saved.notebookPath || '',
                    scriptPath: saved.scriptPath || '',
                    outputDir: saved.outputDir || ''
                });
                if (saved.maxTotal) setMaxTotal(String(saved.maxTotal));
            }
        } catch {}
    }, []);

    const onSave = async () => {
        setSaving(true);
        try {
            const toSave = { ...form, maxTotal: Number(maxTotal) || undefined };
            localStorage.setItem('crawler.config', JSON.stringify(toSave));
        } catch (e) { console.error(e); }
        finally { setSaving(false); }
    };

    const onRun = async () => {
        setRunning(true);
        try {
                const r = await fetchWithAuth('/api/admin/trigger-github', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        owner: 'khiemG921',
                        repo: 'EC_Project_BE',
                        workflow_id: 'crawler.yml',
                        ref: 'main',
                        inputs: {
                            enabled: String(form.enabled),
                            cron: form.cron,
                            pythonPath: form.pythonPath,
                            mode: form.mode,
                            notebookPath: form.notebookPath,
                            scriptPath: form.scriptPath,
                            outputDir: form.outputDir,
                            maxTotal: String(Number(maxTotal) || '')
                        }
                    }),
                    credentials: 'include'
                });
                const j = await r.json();
                if (!j.success) throw new Error(j.message || JSON.stringify(j));
                if (j.runUrl) window.open(j.runUrl, '_blank');
            } catch (e) { console.error(e); }
        finally { setRunning(false); }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4 bg-white p-6 rounded-lg border">
                            <h2 className="font-semibold mb-2">Cấu hình</h2>
                            <label className="flex items-center gap-2">
                                <input type="checkbox" checked={form.enabled} onChange={e => setForm({ ...form, enabled: e.target.checked })} />
                                Bật chạy tự động theo lịch
                            </label>
                            <div>
                                <label className="text-sm text-slate-600">Cron (VD: 0 0 * * 0 = CN 00:00)</label>
                                <Input value={form.cron} onChange={e => setForm({ ...form, cron: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-sm text-slate-600">Python path</label>
                                <Input value={form.pythonPath} onChange={e => setForm({ ...form, pythonPath: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-sm text-slate-600">Chế độ</label>
                                <select className="border rounded p-2 w-full" value={form.mode} onChange={e => setForm({ ...form, mode: e.target.value as 'notebook' | 'script' })}>
                                    <option value="notebook">notebook (.ipynb)</option>
                                    <option value="script">python script (.py)</option>
                                </select>
                            </div>
                            {form.mode === 'notebook' ? (
                                <div>
                                    <label className="text-sm text-slate-600">Notebook path</label>
                                    <Input value={form.notebookPath} onChange={e => setForm({ ...form, notebookPath: e.target.value })} placeholder="d:/xampp/htdocs/EC-Project/data_crawling/data_collection.ipynb" />
                                </div>
                            ) : (
                                <div>
                                    <label className="text-sm text-slate-600">Script path</label>
                                    <Input value={form.scriptPath} onChange={e => setForm({ ...form, scriptPath: e.target.value })} placeholder="d:/xampp/htdocs/EC-Project/data_crawling/crawl_news.py" />
                                </div>
                            )}
                            <div>
                                <label className="text-sm text-slate-600">Thư mục output CSV</label>
                                <Input value={form.outputDir} onChange={e => setForm({ ...form, outputDir: e.target.value })} placeholder="d:/xampp/htdocs/EC-Project/data_crawling/output" />
                            </div>

                            <div>
                                <label className="text-sm text-slate-600">Giới hạn tổng bản ghi (prune cũ)</label>
                                <Input value={maxTotal} onChange={e => setMaxTotal(e.target.value)} placeholder="500" />
                            </div>

                            <div className="flex gap-3 mt-3">
                                <Button onClick={onSave} disabled={saving}>Lưu cấu hình</Button>
                                <Button onClick={onRun} variant="secondary" disabled={running}>Chạy workflow</Button>
                            </div>
                        </div>
                </div>
            </div>
        </AdminLayout>
    );
}
