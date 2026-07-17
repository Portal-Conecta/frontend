import { NextResponse } from 'next/server';
import { getStatsEntries } from '@portal/checklist/services/server/statsService';
import { bffErrorResponse } from '../../../_lib/bffError';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  try {
    const { path } = await params;
    const suffix = path.length > 0 ? `/${path.join('/')}` : '';
    const data = await getStatsEntries(`/api/submission-windows/stats${suffix}`);
    return NextResponse.json(data);
  } catch (err) {
    return bffErrorResponse(err);
  }
}