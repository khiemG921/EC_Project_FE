'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { getCrawlerStatus, updateCrawlerConfig, runCrawlerNow, getCsvDownloadUrl } from '@/lib/crawlerApi';
import fetchWithAuth from '@/lib/apiClient';

async function importLatest(maxTotal?: number) {
    const r = await fetchWithAuth('/api/proxy/news-import/import-latest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maxTotal }),
        credentials: 'include'
    });
    const j = await r.json();
    if (!j.success) throw new Error(j.message || 'Import failed');
    return j.data;
}
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader, Play, Save, RefreshCcw } from 'lucide-react';

export default function CrawlerAdminPage() {
    const [status, setStatus] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [running, setRunning] = useState(false);
    const [form, setForm] = useState({ enabled: false, cron: '0 0 * * 0', pythonPath: 'python', mode: 'notebook' as 'notebook' | 'script', notebookPath: '', scriptPath: '', outputDir: '' });
    const [maxTotal, setMaxTotal] = useState<string>('500');

    const load = async () => {
        setLoading(true);
        try {
            const s = await getCrawlerStatus();
            setStatus(s);
            setForm({
                enabled: !!s.enabled, cron: s.cron, pythonPath: s.pythonPath || 'python', mode: (s.mode || 'notebook') as 'notebook' | 'script',
                notebookPath: s.notebookPath || '', scriptPath: s.scriptPath || '', outputDir: s.outputDir || ''
            });
        } catch (e) {
            console.error(e);
        } finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const onSave = async () => {
        setSaving(true);
        try {
            await updateCrawlerConfig(form);
            await load();
        } catch (e) { console.error(e); }
        finally { setSaving(false); }
    };

    const onRun = async () => {
        setRunning(true);
        try {
            await runCrawlerNow();
            await load();
        } catch (e) { console.error(e); }
        finally { setRunning(false); }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Crawler Tin tức</h1>
                        <p className="text-slate-500">Thiết lập lịch chạy và xuất CSV. Không ghi DB.</p>
                    </div>
                    <Button onClick={load} variant="outline"><RefreshCcw className="w-4 h-4 mr-2" />Làm mới</Button>
                </div>

                {loading ? (
                    <div className="flex items-center gap-2"><Loader className="w-5 h-5 animate-spin" /> Đang tải...</div>
                ) : (
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
                                <Button onClick={onSave} disabled={saving}><Save className="w-4 h-4 mr-2" />Lưu cấu hình</Button>
                                <Button onClick={onRun} variant="secondary" disabled={running}><Play className="w-4 h-4 mr-2" />Chạy ngay</Button>
                                <Button onClick={async () => { try { const res = await importLatest(Number(maxTotal) || undefined); alert(`Đã import: ${res.inserted}, bỏ qua: ${res.skipped}`); } catch (e) { console.error(e); alert('Import lỗi'); } }} variant="outline">Insert vào DB</Button>
                            </div>
                        </div>

                        <div className="space-y-4 bg-white p-6 rounded-lg border">
                            <h2 className="font-semibold mb-2">Trạng thái</h2>
                            <div className="text-sm text-slate-700 space-y-1">
                                <div>Enabled: <b>{status?.enabled ? 'Yes' : 'No'}</b></div>
                                <div>Cron: <code>{status?.cron}</code></div>
                                <div>Last run: {status?.lastRun || '-'}</div>
                                <div>Last status: <b>{status?.lastStatus}</b></div>
                                {status?.lastMessage && (
                                    <details className="mt-2"><summary>Logs</summary><pre className="text-xs bg-slate-50 p-3 rounded overflow-auto max-h-60">{status.lastMessage}</pre></details>
                                )}
                            </div>

                            <h3 className="font-semibold mt-4">CSV gần đây</h3>
                            <ul className="list-disc pl-6 text-sm">
                                {(status?.files || []).map((f: any) => (
                                    <li key={f.name} className="flex items-center justify-between gap-3">
                                        <span>{f.name} <span className="text-slate-400">({Math.round(f.size / 1024)} KB)</span></span>
                                        <a className="text-teal-600 hover:underline" href={getCsvDownloadUrl(f.name)} target="_blank">Tải</a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
