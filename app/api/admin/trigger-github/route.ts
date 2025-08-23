import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function dispatchWorkflow({ owner, repo, workflow, ref, inputs, pat }: { owner: string; repo: string; workflow: string | number; ref: string; inputs: Record<string, any>; pat: string; }) {
  const url = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflow}/dispatches`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `token ${pat}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ref, inputs }),
  });
  return res;
}

async function listWorkflows({ owner, repo, pat }: { owner: string; repo: string; pat: string; }) {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/actions/workflows`, {
    headers: { Authorization: `token ${pat}`, Accept: 'application/vnd.github.v3+json' },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.json().catch(() => null);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as any));

    // 1) Verify admin via backend
    const apiBase = (globalThis as any)?.process?.env?.NEXT_PUBLIC_API_URL || '';
    const verifyResp = await fetch(`${apiBase}/api/auth/verify`, {
      method: 'GET',
      headers: {
        cookie: req.headers.get('cookie') || '',
        authorization: req.headers.get('authorization') || req.headers.get('Authorization') || '',
      },
      cache: 'no-store',
    });
    const vr = await verifyResp.json().catch(() => ({}));
    const valid = !!(vr?.valid ?? verifyResp.ok);
    const rolesArr = Array.isArray(vr?.user?.roles) ? vr.user.roles : (vr?.user?.role ? [vr.user.role] : []);
    if (!valid || !rolesArr.includes('admin')) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    // 2) Read server config and optional overrides
    const env = (globalThis as any)?.process?.env || {};
    const pat: string | undefined = env.GITHUB_PAT;
    const owner: string = body?.owner || env.GH_OWNER || env.GITHUB_REPO_OWNER || 'khiemG921';
    const repo: string = body?.repo || env.GH_REPO || env.GITHUB_REPO_NAME || 'EC_Project_BE';
    const ref: string = body?.ref || env.GH_REF || env.GITHUB_REF || 'main';
    let workflowIdOrPath: string | number = body?.workflow_id || env.GH_WORKFLOW || env.GITHUB_WORKFLOW_FILE || 'news-crawl.yml';
    const inputs: Record<string, any> = body?.inputs || {};

    if (!pat) return NextResponse.json({ success: false, message: 'Server missing GITHUB_PAT' }, { status: 500 });

    // 3) Try dispatch directly first
    let ghRes = await dispatchWorkflow({ owner, repo, workflow: workflowIdOrPath, ref, inputs, pat });

    // 4) If 404, try to resolve correct workflow by listing (covers .yml/.yaml and numeric id)
    if (ghRes.status === 404) {
      const list = await listWorkflows({ owner, repo, pat });
      const workflows: any[] = Array.isArray(list?.workflows) ? list!.workflows : [];

      // Find by exact path match, case-insensitive, try yml/yaml alternates
      const desired = String(workflowIdOrPath).toLowerCase();
      const altDesired = desired.endsWith('.yml') ? desired.replace(/\.yml$/, '.yaml') : desired.endsWith('.yaml') ? desired.replace(/\.yaml$/, '.yml') : desired;

      const byPath = workflows.find(w => String(w.path || '').toLowerCase().endsWith(desired))
        || workflows.find(w => String(w.path || '').toLowerCase().endsWith(altDesired));

      const byName = byPath ? null : workflows.find(w => String(w.name || '').toLowerCase() === desired.replace(/\.(ya)?ml$/, ''));

      const candidate = byPath || byName;
      if (candidate?.id) {
        workflowIdOrPath = candidate.id; // numeric id is most reliable
        ghRes = await dispatchWorkflow({ owner, repo, workflow: workflowIdOrPath, ref, inputs, pat });
      }

      // If still 404 and we tried yml, try yaml literal fallback (and vice versa)
      if (ghRes.status === 404 && !candidate) {
        const literalAlt = desired.endsWith('.yml') ? desired.replace(/\.yml$/, '.yaml') : desired.endsWith('.yaml') ? desired.replace(/\.yaml$/, '.yml') : desired;
        if (literalAlt !== desired) {
          ghRes = await dispatchWorkflow({ owner, repo, workflow: literalAlt, ref, inputs, pat });
          if (ghRes.ok) workflowIdOrPath = literalAlt;
        }
      }
    }

    if (ghRes.status === 204) {
      // The dispatch was accepted. Try to find the workflow run and return its URL.
      const runsUrl = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflowIdOrPath}/runs`;
      const headers = { Authorization: `token ${pat}`, Accept: 'application/vnd.github.v3+json' } as const;

      // Poll a few times for the run to appear.
      let runUrl: string | null = null;
      for (let i = 0; i < 6; i++) {
        try {
          const listRes = await fetch(runsUrl, { headers, cache: 'no-store' });
          if (listRes.ok) {
            const listJson = await listRes.json().catch(() => ({}));
            const runs = Array.isArray(listJson?.workflow_runs) ? listJson.workflow_runs : listJson?.workflow_runs || [];
            if (runs.length) {
              runUrl = runs[0]?.html_url || runs[0]?.url || null;
              if (runUrl) break;
            }
          }
        } catch {}
        await new Promise(res => setTimeout(res, 1000));
      }

      return NextResponse.json({ success: true, message: 'Workflow dispatched', runUrl });
    }

    const ghJson = await ghRes.json().catch(() => ({}));
    // Helpful details for debugging 404s (permissions or wrong path)
    return NextResponse.json({ success: false, detail: ghJson, hint: 'Check FE env GH_OWNER/GH_REPO/GH_WORKFLOW (file name in .github/workflows) and that GITHUB_PAT has workflow scope and repo access.' }, { status: 500 });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e?.message || 'Error' }, { status: 500 });
  }
}
