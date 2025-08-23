import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { owner, repo, workflow_id, ref = 'main', inputs = {} } = body;

    // Verify admin via backend
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

    const pat = (globalThis as any)?.process?.env?.GITHUB_PAT;
    if (!pat) return NextResponse.json({ success: false, message: 'Server misconfigured' }, { status: 500 });

    const ghRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflow_id}/dispatches`, {
      method: 'POST',
      headers: {
        Authorization: `token ${pat}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ref, inputs })
    });

    if (ghRes.status === 204) {
      // The dispatch was accepted. Try to find the workflow run and return its URL.
      const runsUrl = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflow_id}/runs`;
      const headers = { Authorization: `token ${pat}`, Accept: 'application/vnd.github.v3+json' };

      // Poll a few times for the run to appear.
      let runUrl: string | null = null;
      for (let i = 0; i < 6; i++) {
        try {
          const listRes = await fetch(runsUrl, { headers, cache: 'no-store' });
          if (listRes.ok) {
            const listJson = await listRes.json().catch(() => ({}));
            const runs = Array.isArray(listJson?.workflow_runs) ? listJson.workflow_runs : listJson?.workflow_runs || [];
            if (runs.length) {
              // return the most recent run's html_url
              runUrl = runs[0]?.html_url || runs[0]?.url || null;
              if (runUrl) break;
            }
          }
        } catch (err) {
          // ignore and retry
        }
        // wait 1s before next attempt
        await new Promise(res => setTimeout(res, 1000));
      }

      return NextResponse.json({ success: true, message: 'Workflow dispatched', runUrl });
    }
    const ghJson = await ghRes.json().catch(() => ({}));
    return NextResponse.json({ success: false, detail: ghJson }, { status: 500 });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e?.message || 'Error' }, { status: 500 });
  }
}
