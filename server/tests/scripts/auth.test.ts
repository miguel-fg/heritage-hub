import { describe, it, vi, expect, afterEach } from 'vitest'
import {
  getCASServiceURL,
  getFrontendURL,
  generateSessionToken,
  createSession,
  validateSessionToken,
  invalidateSession,
  createOneTimeCode,
  oneTimeCodeTransaction,
  setSessionTokenCookie,
  deleteSessionTokenCookie,
} from '../../src/scripts/auth'
import { createHash } from 'node:crypto'
import prisma from '../../src/services/prisma'
import { encodeBase32LowerCaseNoPadding } from '@oslojs/encoding'
import { beforeEach } from 'node:test'
import { OneTimeCode, Session } from '@prisma/client'
import { Response } from 'express'
import { ENV } from '../../env'

const defaultEnv = { ...ENV }

vi.mock('@oslojs/encoding', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@oslojs/encoding')>()

  return {
    ...actual,
    encodeBase32LowerCaseNoPadding: vi.fn(
      actual.encodeBase32LowerCaseNoPadding,
    ),
  }
})

vi.mock('../../src/services/prisma', () => ({
  default: {
    session: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    oneTimeCode: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}))

afterEach(() => {
  Object.assign(ENV, defaultEnv)
})

describe('Auth utility functions', () => {
  describe('getCASServiceURL', () => {
    it('returns the CAS development URL', () => {
      ENV.ENVIRONMENT = 'dev'

      expect(getCASServiceURL()).toBe(ENV.CAS_DEV)
    })

    it('returns the CAS production URL', () => {
      ENV.ENVIRONMENT = 'prod'

      expect(getCASServiceURL()).toBe(ENV.CAS_PROD)
    })
  })

  describe('getFrontendURL', () => {
    it('returns the HH development URL', () => {
      ENV.ENVIRONMENT = 'dev'

      expect(getFrontendURL()).toBe(ENV.HH_DEV)
    })

    it('returns the HH production URL', () => {
      ENV.ENVIRONMENT = 'prod'

      expect(getFrontendURL()).toBe(ENV.HH_PROD)
    })
  })

  describe('generateSessionToken', () => {
    it('returns a base32 token built from 20 random bytes', () => {
      const cryptoSpy = vi.spyOn(crypto, 'getRandomValues')
      const token = generateSessionToken()

      expect(cryptoSpy).toHaveBeenCalledTimes(1)
      const bytes = cryptoSpy.mock.calls[0][0] as Uint8Array
      expect(bytes).toBeInstanceOf(Uint8Array)
      expect(bytes).toHaveLength(20)

      expect(encodeBase32LowerCaseNoPadding).toHaveBeenCalledTimes(1)
      expect(encodeBase32LowerCaseNoPadding).toHaveBeenCalledWith(bytes)

      expect(typeof token).toBe('string')
      expect(token).toMatch(/^[a-z2-7]{32}$/)
    })
  })

  describe('createSession', () => {
    const THIRTY_DAYS = 1000 * 60 * 60 * 24 * 30

    beforeEach(() => {
      vi.mocked(prisma.session.create).mockResolvedValue({} as Session)
    })

    afterEach(() => {
      vi.clearAllMocks()
    })

    it('hashes the token with sha256 as the session id', async () => {
      const session = await createSession('my-token', 'user-1')

      const expectedId = createHash('sha256').update('my-token').digest('hex')
      expect(session.id).toBe(expectedId)
      expect(session.id).not.toBe('my-token')
    })

    it('sets the expiry to 30 days from now', async () => {
      const before = Date.now()
      const session = await createSession('my-token', 'user-1')
      const after = Date.now()

      const expiry = session.expiresAt.getTime()

      expect(expiry).toBeGreaterThanOrEqual(before + THIRTY_DAYS)
      expect(expiry).toBeLessThanOrEqual(after + THIRTY_DAYS)
    })

    it('persists the session and returns it', async () => {
      const session = await createSession('my-token', 'user-1')

      expect(session.userId).toBe('user-1')
      expect(prisma.session.create).toHaveBeenCalledTimes(1)
      expect(prisma.session.create).toHaveBeenCalledWith({ data: session })
    })

    it('propagates database errors', async () => {
      vi.mocked(prisma.session.create).mockRejectedValue(new Error('db down'))

      await expect(createSession('my-token', 'user-1')).rejects.toThrow(
        'db down',
      )
    })
  })

  describe('validateSessionToken', () => {
    const DAY = 1000 * 60 * 60 * 24
    const TOKEN = 'my-token'
    const SESSION_ID = createHash('sha256').update(TOKEN).digest('hex')
    const user = { id: 'user-1' }

    const dbResult = (expiresInMs: number) => ({
      id: SESSION_ID,
      userId: 'user-1',
      expiresAt: new Date(Date.now() + expiresInMs),
      user,
    })

    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('looks the session up by the hashed token, including the user', async () => {
      vi.mocked(prisma.session.findUnique).mockResolvedValue(null)

      await validateSessionToken(TOKEN)

      expect(prisma.session.findUnique).toHaveBeenCalledWith({
        where: { id: SESSION_ID },
        include: { user: true },
      })
    })

    it('returns nulls when the session does not exist', async () => {
      vi.mocked(prisma.session.findUnique).mockResolvedValue(null)

      const result = await validateSessionToken(TOKEN)

      expect(result).toEqual({ session: null, user: null })
      expect(prisma.session.delete).not.toHaveBeenCalled()
      expect(prisma.session.update).not.toHaveBeenCalled()
    })

    it('deletes an expired session and returns nulls', async () => {
      vi.mocked(prisma.session.findUnique).mockResolvedValue(dbResult(-DAY))

      const result = await validateSessionToken(TOKEN)

      expect(result).toEqual({ session: null, user: null })
      expect(prisma.session.delete).toHaveBeenCalledWith({
        where: { id: SESSION_ID },
      })
      expect(prisma.session.update).not.toHaveBeenCalled()
    })

    it('extends a session expiring within 15 days to 30 days from now', async () => {
      vi.mocked(prisma.session.findUnique).mockResolvedValue(dbResult(10 * DAY))

      const before = Date.now()
      const result = await validateSessionToken(TOKEN)
      const after = Date.now()

      const expiry = result.session!.expiresAt.getTime()
      expect(expiry).toBeGreaterThanOrEqual(before + 30 * DAY)
      expect(expiry).toBeLessThanOrEqual(after + 30 * DAY)

      expect(prisma.session.update).toHaveBeenCalledWith({
        where: { id: SESSION_ID },
        data: { expiresAt: result.session!.expiresAt },
      })
      expect(prisma.session.delete).not.toHaveBeenCalled()
      expect(result.user).toEqual(user)
    })

    it('leaves a session with more than 15 days remaining untouched', async () => {
      const row = dbResult(20 * DAY)
      vi.mocked(prisma.session.findUnique).mockResolvedValue(row)

      const result = await validateSessionToken(TOKEN)

      expect(prisma.session.update).not.toHaveBeenCalled()
      expect(prisma.session.delete).not.toHaveBeenCalled()
      expect(result.session!.expiresAt).toEqual(row.expiresAt)
      expect(result.user).toEqual(user)
    })

    it('returns the user separately from the session', async () => {
      vi.mocked(prisma.session.findUnique).mockResolvedValue(dbResult(20 * DAY))

      const result = await validateSessionToken(TOKEN)

      expect(result.session).not.toHaveProperty('user')
      expect(result.session).toMatchObject({ id: SESSION_ID, userId: 'user-1' })
    })
  })

  describe('invalidateSession', () => {
    it('deletes the session by the hashed token', async () => {
      vi.mocked(prisma.session.delete).mockResolvedValue({} as Session)

      await invalidateSession('my-token')

      const expectedId = createHash('sha256').update('my-token').digest('hex')
      expect(prisma.session.delete).toHaveBeenCalledTimes(1)
      expect(prisma.session.delete).toHaveBeenCalledWith({
        where: { id: expectedId },
      })
    })
  })

  describe('createOneTimeCode', () => {
    beforeEach(() => {
      vi.mocked(prisma.oneTimeCode.create).mockResolvedValue({} as OneTimeCode)
    })

    it('returns a base32 code from 20 random bytes', async () => {
      const cryptoSpy = vi.spyOn(crypto, 'getRandomValues')

      const code = await createOneTimeCode('user-1')

      expect(cryptoSpy).toHaveBeenCalledTimes(1)
      expect((cryptoSpy.mock.calls[0][0] as Uint8Array).length).toBe(20)
      expect(code).toMatch(/^[a-z2-7]{32}$/)
    })

    it('stores the code for the user with a 60 second expiry', async () => {
      const before = Date.now()
      const code = await createOneTimeCode('user-1')
      const after = Date.now()

      expect(prisma.oneTimeCode.create).toHaveBeenCalledTimes(1)
      const { data } = vi.mocked(prisma.oneTimeCode.create).mock.calls[0][0]

      expect(data.code).toBe(code)
      expect(data.userId).toBe('user-1')

      const expiry = (data.expiresAt as Date).getTime()
      expect(expiry).toBeGreaterThanOrEqual(before + 60_000)
      expect(expiry).toBeLessThanOrEqual(after + 60_000)
    })
  })

  describe('oneTimeCodeTransaction', () => {
    const tx = {
      oneTimeCode: {
        findUnique: vi.fn(),
        delete: vi.fn(),
      },
    }

    const record = (expiresInMs: number) => ({
      code: 'abc',
      userId: 'user-1',
      expiresAt: new Date(Date.now() + expiresInMs),
    })

    beforeEach(() => {
      tx.oneTimeCode.delete.mockResolvedValue({})
    })

    it('it looks up the code, deletes it, and returns the record in a single transaction', async () => {
      vi.mocked(prisma.$transaction).mockImplementation((cb: any) => cb(tx))
      const rec = record(60_000)
      tx.oneTimeCode.findUnique.mockResolvedValue(rec)

      const result = await oneTimeCodeTransaction('abc')

      expect(tx.oneTimeCode.findUnique).toHaveBeenCalledWith({
        where: { code: 'abc' },
      })
      expect(tx.oneTimeCode.delete).toHaveBeenCalledWith({
        where: { code: 'abc' },
      })
      expect(result).toBe(rec)

      expect(prisma.$transaction).toHaveBeenCalledTimes(1)
    })

    it('throws and does not delete when the code does not exist', async () => {
      vi.mocked(prisma.$transaction).mockImplementation((cb: any) => cb(tx))
      tx.oneTimeCode.findUnique.mockResolvedValue(null)

      await expect(oneTimeCodeTransaction('abc')).rejects.toThrow(
        'Invalid or expired code',
      )
      expect(tx.oneTimeCode.delete).not.toHaveBeenCalled()
    })

    it('throws and does not delete when the code is expired', async () => {
      vi.mocked(prisma.$transaction).mockImplementation((cb: any) => cb(tx))
      tx.oneTimeCode.findUnique.mockResolvedValue(record(-1000))

      await expect(oneTimeCodeTransaction('abc')).rejects.toThrow(
        'Invalid or expired code',
      )
      expect(tx.oneTimeCode.delete).not.toHaveBeenCalled()
    })
  })

  describe('session cookies', () => {
    const makeRes = () => {
      const res: Pick<Response, 'setHeader'> = { setHeader: vi.fn() }
      return res as Response
    }

    const headerOf = (res: { setHeader: ReturnType<typeof vi.fn> }) => {
      expect(res.setHeader).toHaveBeenCalledTimes(1)
      const [name, value] = res.setHeader.mock.calls[0]
      expect(name).toBe('Set-Cookie')
      return value as string
    }

    describe('setSessionTokenCookie', () => {
      const expiresAt = new Date('2026-12-01T10:00:00Z')

      it('sets a Lax, non-Secure cookie outside prod', () => {
        ENV.ENVIRONMENT = 'dev'
        const res = makeRes()

        setSessionTokenCookie(res, 'my-token', expiresAt)

        expect(headerOf(res as any)).toBe(
          'session=my-token; HttpOnly; SameSite=Lax; Expires=Tue, 01 Dec 2026 10:00:00 GMT; Path=/',
        )
      })

      it('sets a None, Secure cookie in prod', () => {
        ENV.ENVIRONMENT = 'prod'
        const res = makeRes()

        setSessionTokenCookie(res, 'my-token', expiresAt)

        expect(headerOf(res as any)).toBe(
          'session=my-token; HttpOnly; SameSite=None; Expires=Tue, 01 Dec 2026 10:00:00 GMT; Path=/; Secure',
        )
      })
    })

    describe('deleteSessionTokenCookie', () => {
      it('clears the cookie with Max-Age=0 outside prod', () => {
        ENV.ENVIRONMENT = 'dev'
        const res = makeRes()

        deleteSessionTokenCookie(res)

        expect(headerOf(res as any)).toBe(
          'session=; HttpOnly; SameSite=Lax; Max-Age=0; Path=/',
        )
      })

      it('clears the cookie with None and Secure in prod', () => {
        ENV.ENVIRONMENT = 'prod'
        const res = makeRes()

        deleteSessionTokenCookie(res)

        expect(headerOf(res as any)).toBe(
          'session=; HttpOnly; SameSite=None; Max-Age=0; Path=/; Secure',
        )
      })
    })
  })
})
