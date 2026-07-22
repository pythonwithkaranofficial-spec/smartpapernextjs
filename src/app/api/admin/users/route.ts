import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth/middleware';
import { UserRepository } from '@/lib/db/user-repository';
import { queryRows, executeSql } from '@/lib/turso';
import { DatabaseUser } from '@/types/db';
import { UserRole, UserPlan } from '@/types/auth';
import { handleApiError, AuthError, ValidationError } from '@/lib/errors';

export async function GET(req: NextRequest) {
  try {
    const authContext = await verifyAuthToken(req);
    const caller = await UserRepository.findUserByFirebaseUid(authContext.uid);

    if (!caller || caller.role !== 'ADMIN') {
      throw new AuthError('Admin privileges required to access this endpoint', 403, 'FORBIDDEN');
    }

    const users = await queryRows<DatabaseUser>({
      sql: `SELECT * FROM users ORDER BY created_at DESC`,
    });

    const todayStr = new Date().toISOString().split('T')[0];
    const usageRows = await queryRows<{ total: number }>({
      sql: `SELECT SUM(papers_generated) as total FROM daily_usage WHERE date = ?`,
      args: [todayStr],
    });

    const papersToday = usageRows[0]?.total || 0;

    return NextResponse.json({
      success: true,
      data: {
        users,
        stats: {
          totalUsers: users.length,
          papersGeneratedToday: papersToday,
          proUsers: users.filter((u) => u.plan === 'PRO').length,
          premiumUsers: users.filter((u) => u.plan === 'PREMIUM').length,
          admins: users.filter((u) => u.role === 'ADMIN').length,
        },
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const authContext = await verifyAuthToken(req);
    const caller = await UserRepository.findUserByFirebaseUid(authContext.uid);

    if (!caller || caller.role !== 'ADMIN') {
      throw new AuthError('Admin privileges required to access this endpoint', 403, 'FORBIDDEN');
    }

    const body = await req.json();
    const { targetFirebaseUid, action, role, plan } = body;

    if (!targetFirebaseUid || !action) {
      throw new ValidationError('Missing targetFirebaseUid or action');
    }

    if (action === 'update_role') {
      if (!role || (role !== 'USER' && role !== 'ADMIN')) {
        throw new ValidationError('Invalid role specified');
      }
      await UserRepository.updateRole(targetFirebaseUid, role as UserRole);
    } else if (action === 'update_plan') {
      if (!plan) {
        throw new ValidationError('Invalid plan specified');
      }
      await UserRepository.updatePlan(targetFirebaseUid, plan as UserPlan);
    } else if (action === 'delete_user') {
      await UserRepository.deleteUser(targetFirebaseUid);
    } else {
      throw new ValidationError('Unsupported action');
    }

    const updatedUser = await UserRepository.findUserByFirebaseUid(targetFirebaseUid);

    return NextResponse.json({
      success: true,
      data: updatedUser || { deleted: true },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
