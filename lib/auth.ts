import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'coordinator-system-secret-key-2024'
)

export interface SessionPayload {
  id: number
  login: string
  role: 'admin' | 'coordinator'
  fullName: string
}

export async function createSession(payload: SessionPayload): Promise<string> {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .setIssuedAt()
    .sign(JWT_SECRET)
  return token
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  if (!token) return null
  return verifySession(token)
}

export async function requireAdmin(): Promise<SessionPayload> {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    throw new Error('Unauthorized')
  }
  return session
}

export async function requireCoordinator(): Promise<SessionPayload> {
  const session = await getSession()
  if (!session || session.role !== 'coordinator') {
    throw new Error('Unauthorized')
  }
  return session
}

export async function requireAuth(): Promise<SessionPayload> {
  const session = await getSession()
  if (!session) {
    throw new Error('Unauthorized')
  }
  return session
}
