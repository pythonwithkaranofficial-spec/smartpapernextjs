import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth/middleware';
import { UserRepository } from '@/lib/db/user-repository';
import { computePlanExpiry, isAdminUser, isSuperAdminEmail, isTrustedSuperAdmin } from '@/lib/auth/helpers';
import { AuthenticatedRequestContext } from '@/lib/auth/middleware';
import { queryRows } from '@/lib/turso';
import { DatabaseUser } from '@/types/db';
import { UserRole, UserPlan } from '@/types/auth';
import { handleApiError, AuthError, ValidationError } from '@/lib/errors';

const VALID_PLANS: UserPlan[] = ['FREE', 'PRO', 'PREMIUM', 'ENTERPRISE'];

/**
 * Resolve the caller and require admin rights. Super-admin status is derived from the
 * Firebase-verified token email, never from an unverified DB value.
 */
async function requireAdmin(authContext: AuthenticatedRequestContext): Promise<{ caller: DatabaseUser; callerIsSuperAdmin: boolean }> {
  let caller = await UserRepository.findUserByFirebaseUid(authContext.uid);
  if (!caller) {
    throw new AuthError('User account not found', 404, 'NOT_FOUND');
  }

  const callerIsSuperAdmin = isTrustedSuperAdmin(authContext.email, authContext.emailVerified);

  // Auto-lock verified Super Admin accounts to ADMIN role
  if (callerIsSuperAdmin && caller.role !== 'ADMIN') {
    caller = (await UserRepository.updateRole(caller.firebase_uid, 'ADMIN')) || caller;
  }

  if (!callerIsSuperAdmin && !isAdminUser(caller)) {
    throw new AuthError('Admin privileges required', 403, 'FORBIDDEN');
  }

  return { caller, callerIsSuperAdmin };
}

export async function GET(req: NextRequest) {
  try {
    const authContext = await verifyAuthToken(req);
    await requireAdmin(authContext);

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
    const { caller, callerIsSuperAdmin } = await requireAdmin(authContext);

    const body = await req.json();
    const { targetFirebaseUid, action, role, plan } = body;

    if (typeof targetFirebaseUid !== 'string' || !targetFirebaseUid || typeof action !== 'string') {
      throw new ValidationError('Missing targetFirebaseUid or action');
    }

    const targetUser = await UserRepository.findUserByFirebaseUid(targetFirebaseUid);
    if (!targetUser) {
      throw new ValidationError('Target user not found', 404, 'NOT_FOUND');
    }
    // Regular admins cannot modify other admins or themselves; only verified super-admins can.
    if (!callerIsSuperAdmin && (targetUser.role === 'ADMIN' || targetUser.firebase_uid === caller.firebase_uid)) {
      throw new AuthError('Only Super-Admin accounts may modify admin accounts', 403, 'SUPER_ADMIN_REQUIRED');
    }

    if (action === 'update_role') {
      // EXCLUSIVE RULE: Only Super Admin accounts can assign or remove ADMIN role
      if (!callerIsSuperAdmin) {
        throw new AuthError(
          'Permission Denied: Only Super-Admin accounts may promote or demote Admin accounts.',
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
      if (!VALID_PLANS.includes(plan)) {
        throw new ValidationError('Invalid plan specified');
      }
      // Admin-granted paid plans follow the normal plan duration.
      await UserRepository.updatePlan(targetFirebaseUid, plan as UserPlan, computePlanExpiry(plan as UserPlan));
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
