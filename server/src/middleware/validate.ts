import { Request, Response, NextFunction, RequestHandler } from 'express'
import { ZodSchema, ZodError } from 'zod'
import { checkModelOwnership, ModelNotFoundError } from '../scripts/prisma'

export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body)
      next()
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({
          error: 'Invalid request body',
          issues: err.errors,
        })
      } else {
        next(err)
      }
    }
  }
}

export const validateUploadPermissions: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const user = req.user

  if (!user) {
    res.status(401).send('Unauthorized')
    return
  }

  if (user.permissions === 'RESTRICTED') {
    res.status(403).send('Forbidden: Cannot upload models')
    return
  }

  next()
}

export const validateModifyPermissions =
  (getModelId: (req: Request) => string): RequestHandler =>
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user

    if (!user) {
      res.status(401).send('Unauthorized')
      return
    }

    if (user.permissions === 'RESTRICTED') {
      res.status(403).send('Forbidden: Cannot modify models')
      return
    }

    if (user.permissions === 'FULL' || user.permissions === 'ADMIN') {
      return next()
    }

    try {
      const modelId = getModelId(req)
      const isOwner = await checkModelOwnership(modelId, user.id)
      if (!isOwner) {
        res.status(403).send("Forbidden: You don't own this model")
        return
      }
      return next()
    } catch (err) {
      if (err instanceof ModelNotFoundError) {
        res.status(404).send('Model not found')
        return
      }
      console.error('validateModifyPermissions Error', err)
      res.status(500).send('Internal server error')
    }
  }
