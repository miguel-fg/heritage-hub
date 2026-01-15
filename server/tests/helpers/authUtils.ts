import { encodeHexLowerCase } from '@oslojs/encoding'
import { sha256 } from '@oslojs/crypto/sha2'
import { seedUser, seedSession } from './seedData'
import type { PermissionLevel } from '@prisma/client'

/**
 * Creates a user with a valid session and returns both
 */
export const createAuthenticatedUser = async (
  permissions: PermissionLevel = 'STANDARD',
) => {
  const user = await seedUser({ permissions })
  const sessionToken = generateMockSessionToken()
  const session = await seedSession({
    id: hashSessionToken(sessionToken),
    userId: user.id,
  })

  return { user, session, sessionToken }
}

/**
 * Creates an admin user with session
 */
export const createAuthenticatedAdmin = async () => {
  return createAuthenticatedUser('ADMIN')
}

/**
 * Creates an admin user with session
 */
export const createAuthenticatedFull = async () => {
  return createAuthenticatedUser('FULL')
}

/**
 * Creates a restricted user
 */
export const createRestrictedUser = async () => {
  return createAuthenticatedUser('RESTRICTED')
}

/**
 * Creates multiple authenticated users
 */
export const createMultipleAuthenticatedUsers = async (
  count: number,
  permissions: PermissionLevel = 'STANDARD',
) => {
  return Promise.all(
    Array.from({ length: count }, () => createAuthenticatedUser(permissions)),
  )
}

/**
 * Generates a mock session token
 */
export const generateMockSessionToken = (): string => {
  return `test_session_${Math.random().toString(36).substring(7)}`
}

/**
 * Hashes a session token
 */
export const hashSessionToken = (token: string): string => {
  return encodeHexLowerCase(sha256(new TextEncoder().encode(token)))
}

/**
 * Creates a session cookie header for supertest
 */
export const getAuthCookie = (sessionToken: string): string => {
  return `session=${sessionToken}`
}
