import { Router } from 'express'
import { authGuard } from '../middleware/authGuard'
import { createImages } from '../controllers/image'
import { validateBody, validateModifyPermissions } from '../middleware/validate'
import { modelImagesSchema } from '../scripts/validators'

const router = Router()

router.post(
  '/',
  authGuard,
  validateModifyPermissions((req) => req.body.modelId),
  validateBody(modelImagesSchema),
  createImages,
)

export default router
