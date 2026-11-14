import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth/middleware';
import { UserRepository } from '@/lib/db/user-repository';
import { handleApiError, ValidationError } from '@/lib/errors';

// ~1.5 MB of JSON is far larger than any real paper (with all three sets + solutions).
const MAX_PAPER_JSON_CHARS = 1_500_000;

export async function GET(req: NextRequest) {
  try {
    const authContext = await verifyAuthToken(req);
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const history = await UserRepository.fetchPaperHistory(authContext.uid, limit, offset);

    return NextResponse.json({
      success: true,
      data: history,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const authContext = await verifyAuthToken(req);
    const body = await req.json();

    if (!body.class || !body.subject || !body.paper_type || !body.paper_json) {
      throw new ValidationError('Missing required fields (class, subject, paper_type, paper_json)');
    }

    const paperJsonStr = typeof body.paper_json === 'string' ? body.paper_json : JSON.stringify(body.paper_json);
    if (paperJsonStr.length > MAX_PAPER_JSON_CHARS) {
      throw new ValidationError('Paper is too large to save to history', 413, 'PAYLOAD_TOO_LARGE');
    }

    const newRecord = await UserRepository.insertPaperHistory({
      firebase_uid: authContext.uid,
      class: String(body.class).slice(0, 50),
      subject: String(body.subject).slice(0, 120),
      paper_type: String(body.paper_type).slice(0, 80),
      marks: Number.isFinite(Number(body.marks)) ? Math.trunc(Number(body.marks)) : 0,
      difficulty: String(body.difficulty || 'Medium').slice(0, 30),
      paper_json: paperJsonStr,
    });

    return NextResponse.json({
      success: true,
      data: newRecord,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
