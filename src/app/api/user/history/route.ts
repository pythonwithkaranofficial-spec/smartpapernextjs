import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth/middleware';
import { UserRepository } from '@/lib/db/user-repository';
import { handleApiError, ValidationError } from '@/lib/errors';

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

    const newRecord = await UserRepository.insertPaperHistory({
      firebase_uid: authContext.uid,
      class: String(body.class),
      subject: String(body.subject),
      paper_type: String(body.paper_type),
      marks: Number(body.marks || 0),
      difficulty: String(body.difficulty || 'Medium'),
      paper_json: body.paper_json,
    });

    return NextResponse.json({
      success: true,
      data: newRecord,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
