import { Router } from 'express'
import { authGuard } from '../middleware/authGuard'
import { validateBody, validateModifyPermissions } from '../middleware/validate'
import { createPdfs, processPdf, cancelPdfs } from '../controllers/pdf'
import { upload } from '../middleware/upload'
import { modelPdfsSchema } from '../scripts/validators'

const router = Router()

router.post(
  '/',
  authGuard,
  validateModifyPermissions((req) => req.body.modelId),
  validateBody(modelPdfsSchema),
  createPdfs,
)

router.post(
  '/process',
  authGuard,
  upload.single('file'),
  validateModifyPermissions((req) => req.body.modelId),
  processPdf,
)

router.delete(
  '/process',
  authGuard,
  validateModifyPermissions((req) => req.body.modelId),
  cancelPdfs,
)

export default router
