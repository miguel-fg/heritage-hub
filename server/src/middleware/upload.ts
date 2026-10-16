import multer from 'multer'
import { ACCEPTED_MIME, MAX_FILESIZE } from '../../utils/upload'

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILESIZE }, // 20MB
  fileFilter: (_req, file, cb) => {
    if (ACCEPTED_MIME.includes(file.mimetype)) return cb(null, true)

    cb(new Error('Unsupported file type'))
  },
})
