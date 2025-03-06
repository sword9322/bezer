import { auth } from './firebase'

export interface Changes {
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
}

export const logActivity = async (
  actionType: string,
  entityType: string,
  entityId: string,
  changes: Changes,
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  }
) => {
  try {
    const currentUser = auth.currentUser
    if (!currentUser) {
      console.error('No authenticated user found')
      return
    }

    const token = await currentUser.getIdToken()
    if (!token) {
      console.error('No authentication token available')
      return
    }

    const response = await fetch('/api/logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        actionType,
        entityType,
        entityId,
        changes,
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        userRole: user.role,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to log activity')
    }

    return response.json()
  } catch (error) {
    console.error('Error logging activity:', error)
  }
} 