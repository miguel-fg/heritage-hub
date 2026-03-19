import { Router } from 'express'
import { authGuard } from '../middleware/authGuard'
import { createImages, processImage, cancelImages } from '../controllers/image'
import { validateBody, validateModifyPermissions } from '../middleware/validate'
import { modelImagesSchema } from '../scripts/validators'
import { upload } from '../middleware/upload'

const router = Router()

router.post(
  '/',
  authGuard,
  validateModifyPermissions((req) => req.body.modelId),
  validateBody(modelImagesSchema),
  createImages,
)

router.post(
  '/process',
  authGuard,
  upload.single('file'),
  validateModifyPermissions((req) => req.body.modelId),
  processImage,
)

router.delete(
  '/process',
  authGuard,
  validateModifyPermissions((req) => req.body.modelId),
  cancelImages,
)

export default router
