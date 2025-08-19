const BASE = `${(globalThis as any)?.process?.env?.NEXT_PUBLIC_API_URL || 'https://ecprojectbe-production.up.railway.app'}/api/crawler`;

export async function getCrawlerStatus() {
  const r = await fetch(`${BASE}/status`, { cache: 'no-store' });
  const j = await r.json();
  if (!j.success) throw new Error(j.message || 'Failed to get status');
  return j.data;
}

export async function updateCrawlerConfig(cfg: Partial<{ enabled: boolean; cron: string; pythonPath: string; mode: 'notebook'|'script'; notebookPath: string; scriptPath: string; outputDir: string; }>) {
  const r = await fetch(`${BASE}/config`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cfg),
  });
  const j = await r.json();
  if (!j.success) throw new Error(j.message || 'Failed to update config');
  return j.data;
}

export async function runCrawlerNow() {
  const r = await fetch(`${BASE}/run`, { method: 'POST' });
  const j = await r.json();
  if (!j.success) throw new Error(j.message || 'Failed to run crawler');
  return j.data;
}

export function getCsvDownloadUrl(file: string) {
  return `${BASE}/download/${encodeURIComponent(file)}`;
}
