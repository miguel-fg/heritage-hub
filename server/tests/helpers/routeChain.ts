import { vi } from 'vitest'
import { Request, Response, NextFunction } from 'express'

export function createRouteChain() {
  const trace: string[] = []

  const mw =
    (name: string) => (_req: Request, _res: Response, next: NextFunction) => {
      trace.push(name)
      next()
    }

  const ctrl = (name: string) => (_req: Request, res: Response) => {
    trace.push(name)
    res.sendStatus(200)
  }

  const mocks = {
    authGuard: () => ({ authGuard: mw('authGuard') }),
    validate: () => ({
      validateBody: vi.fn((schema: string) => mw(`validateBody(${schema})`)),
      validateUploadPermissions: mw('validateUploadPermissions'),
      validateModifyPermissions: vi.fn(() => mw('validateModifyPermissions')),
    }),
    validators: (...names: string[]) =>
      Object.fromEntries(names.map((n) => [n, n])),
    upload: () => ({
      upload: { single: vi.fn(() => mw('upload.single(file)')) },
    }),
    controllers: (...names: string[]) =>
      Object.fromEntries(names.map((n) => [n, ctrl(n)])),
  }

  return { trace, mw, ctrl, mocks }
}
