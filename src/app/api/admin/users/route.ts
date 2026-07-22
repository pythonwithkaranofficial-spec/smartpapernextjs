import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth/middleware';
import { UserRepository } from '@/lib/db/user-repository';
import { isSuperAdminEmail } from '@/lib/auth/helpers';
import { queryRows } from '@/lib/turso';
import { DatabaseUser } from '@/types/db';
import { UserRole, UserPlan } from '@/types/auth';
import { handleApiError, AuthError, ValidationError } from '@/lib/errors';

export async function GET(req: NextRequest) {
  try {
    const authContext = await verifyAuthToken(req);
    let caller = await UserRepository.findUserByFirebaseUid(authContext.uid);

    if (!caller) {
      throw new AuthError('User account not found', 404, 'NOT_FOUND');
    }

    // Auto-lock Super Admin accounts to ADMIN role
    if (isSuperAdminEmail(caller.email) && caller.role !== 'ADMIN') {
      await UserRepository.updateRole(caller.firebase_uid, 'ADMIN');
      caller = await UserRepository.findUserByFirebaseUid(caller.firebase_uid);
    }

    if (!caller || (caller.role !== 'ADMIN' && !isSuperAdminEmail(caller.email))) {
      throw new AuthError('Admin privileges required to access this dashboard', 403, 'FORBIDDEN');
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
    let caller = await UserRepository.findUserByFirebaseUid(authContext.uid);

    if (!caller) {
      throw new AuthError('User account not found', 404, 'NOT_FOUND');
    }

    // Auto-lock Super Admin accounts to ADMIN role
    if (isSuperAdminEmail(caller.email) && caller.role !== 'ADMIN') {
      await UserRepository.updateRole(caller.firebase_uid, 'ADMIN');
      caller = await UserRepository.findUserByFirebaseUid(caller.firebase_uid);
    }

    if (!caller || (caller.role !== 'ADMIN' && !isSuperAdminEmail(caller.email))) {
      throw new AuthError('Admin privileges required to manage users', 403, 'FORBIDDEN');
    }

    const body = await req.json();
    const { targetFirebaseUid, action, role, plan } = body;

    if (!targetFirebaseUid || !action) {
      throw new ValidationError('Missing targetFirebaseUid or action');
    }

    const targetUser = await UserRepository.findUserByFirebaseUid(targetFirebaseUid);

    if (action === 'update_role') {
      // EXCLUSIVE RULE: Only Super Admin accounts can assign or remove ADMIN role
      if (!isSuperAdminEmail(caller.email)) {
        throw new AuthError(
          'Permission Denied: Only Super-Admin accounts (tpaofficial1999@gmail.com, officialworldwithtechnology@gmail.com, pythonwithkaran.official@gmail.com) are permitted to promote or demote Admin accounts.',
          403,
          'SUPER_ADMIN_REQUIRED'
        );
      }

      if (!role || (role !== 'USER' && role !== 'ADMIN')) {
        throw new ValidationError('Invalid role specified');
      }

      // Prevent demoting a Super Admin account
      if (targetUser && isSuperAdminEmail(targetUser.email) && role !== 'ADMIN') {
        throw new ValidationError('Super-Admin accounts are permanently locked as ADMIN and cannot be demoted.');
      }

      await UserRepository.updateRole(targetFirebaseUid, role as UserRole);
    } else if (action === 'update_plan') {
      if (!plan) {
        throw new ValidationError('Invalid plan specified');
      }
      await UserRepository.updatePlan(targetFirebaseUid, plan as UserPlan);
    } else if (action === 'delete_user') {
      if (targetUser && isSuperAdminEmail(targetUser.email)) {
        throw new ValidationError('Super-Admin accounts cannot be deleted.');
      }
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
