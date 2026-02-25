import { Router } from 'express'
import { authGuard } from '../middleware/authGuard'
import { createImages, getImage, getImages } from '../controllers/image'

const router = Router()

router.get('/', getImages)
router.get('/:id', getImage)

router.post('/', authGuard, createImages)

export default router
