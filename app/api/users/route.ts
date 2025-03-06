import { NextResponse } from 'next/server';
import { getFirebaseAdminApp } from '@/lib/firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { cookies } from 'next/headers';

const admin = getFirebaseAdminApp();
const auth = getAuth(admin);

interface TokenVerificationResult {
  isAuthenticated: boolean;
  role: string | null;
  uid: string | null;
}

async function verifyUser(token: string): Promise<TokenVerificationResult> {
  try {
    const decodedToken = await auth.verifyIdToken(token);
    return {
      isAuthenticated: true,
      role: decodedToken.role || 'user',
      uid: decodedToken.uid
    };
  } catch {
    return {
      isAuthenticated: false,
      role: null,
      uid: null
    };
  }
}

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('firebase-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { isAuthenticated, role } = await verifyUser(token);

    if (!isAuthenticated || (role !== 'admin' && role !== 'manager')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const listUsersResult = await auth.listUsers();
    return NextResponse.json({ users: listUsersResult.users });
  } catch (err) {
    console.error('Error listing users:', err);
    return NextResponse.json({ error: 'Failed to list users' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('firebase-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { isAuthenticated, role } = await verifyUser(token);

    if (!isAuthenticated || role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { uid, role: newRole } = await request.json();

    // Prevent changing own role
    const { uid: currentUserUid } = await verifyUser(token);
    if (uid === currentUserUid) {
      return NextResponse.json({ error: 'Cannot change own role' }, { status: 403 });
    }

    await auth.setCustomUserClaims(uid, { role: newRole });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error updating user role:', err);
    return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('firebase-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { isAuthenticated, role } = await verifyUser(token);

    if (!isAuthenticated || role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { uid } = await request.json();

    // Prevent deleting own account
    const { uid: currentUserUid } = await verifyUser(token);
    if (uid === currentUserUid) {
      return NextResponse.json({ error: 'Cannot delete own account' }, { status: 403 });
    }

    await auth.deleteUser(uid);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error deleting user:', err);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}

interface CreateUserError {
  code: string;
  [key: string]: unknown;
}

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('firebase-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { isAuthenticated, role } = await verifyUser(token);

    if (!isAuthenticated || role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { email, role: newRole } = await request.json();

    // First try to get the user by email
    try {
      const userRecord = await auth.getUserByEmail(email);
      // If user exists, just update their role
      await auth.setCustomUserClaims(userRecord.uid, { role: newRole });
      return NextResponse.json({ 
        success: true,
        message: 'User role updated successfully.'
      });
    } catch (err) {
      const error = err as CreateUserError;
      // If user doesn't exist (auth/user-not-found), create new user
      if (error.code === 'auth/user-not-found') {
        const newUser = await auth.createUser({
          email,
          emailVerified: false,
          disabled: false,
        });

        await auth.setCustomUserClaims(newUser.uid, { role: newRole });
        const link = await auth.generatePasswordResetLink(email);

        return NextResponse.json({ 
          success: true, 
          link,
          message: 'User invited successfully. Password reset link generated.'
        });
      }
      // If it's any other error, throw it
      throw error;
    }
  } catch (err) {
    console.error('Error inviting user:', err);
    const errorMessage = err instanceof Error ? err.message : 'Failed to invite user';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 