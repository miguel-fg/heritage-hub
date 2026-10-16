import { describe, it, expect } from 'vitest'
import express, { Request, Response, NextFunction } from 'express'
import multer from 'multer'
import request from 'supertest'
import { upload } from '../../src/middleware/upload'
import { ACCEPTED_MIME, MAX_FILESIZE } from '../../utils/upload'

function buildApp() {
  const app = express()

  app.post('/upload', upload.single('file'), (req, res) => {
    res.json({
      received: !!req.file,
      mimetype: req.file?.mimetype,
      size: req.file?.size,
      isBuffer: Buffer.isBuffer(req.file?.buffer),
      hasPath: !!(req.file as any)?.path,
    })
  })

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof multer.MulterError) {
      res.status(400).json({ code: err.code })
      return
    }
    res.status(500).json({ message: err.message })
  })

  return app
}

describe('Upload middleware', () => {
  const app = buildApp()

  describe('accepted mime types', () => {
    it.each(ACCEPTED_MIME)('accepts %s', async (contentType) => {
      const res = await request(app)
        .post('/upload')
        .attach('file', Buffer.from('data'), { filename: 'f', contentType })

      expect(res.status).toBe(200)
      expect(res.body.received).toBe(true)
      expect(res.body.mimetype).toBe(contentType)
    })
  })

  describe('rejected mime types', () => {
    it.each([
      'text/plain',
      'application/zip',
      'image/svg+xml',
      'application/x-msdownload',
    ])('rejects %s', async (contentType) => {
      const res = await request(app)
        .post('/upload')
        .attach('file', Buffer.from('data'), { filename: 'f', contentType })

      expect(res.status).toBe(500)
    })
  })

  describe('storage', () => {
    it('keeps the file in memory', async () => {
      const res = await request(app)
        .post('/upload')
        .attach('file', Buffer.from('hello'), {
          filename: 'a.png',
          contentType: 'image/png',
        })

      expect(res.body.isBuffer).toBe(true)
      expect(res.body.hasPath).toBe(false)
      expect(res.body.size).toBe(5)
    })
  })

  describe('size limit', () => {
    it('accepts a file under 20MB', async () => {
      const res = await request(app)
        .post('/upload')
        .attach('file', Buffer.alloc(MAX_FILESIZE - 1), {
          filename: 'big.pdf',
          contentType: 'application/pdf',
        })

      expect(res.status).toBe(200)
      expect(res.body.size).toBe(MAX_FILESIZE - 1)
    })

    it('rejects a file 20MB or larger with LIMIT_FILE_SIZE', async () => {
      const res = await request(app)
        .post('/upload')
        .attach('file', Buffer.alloc(MAX_FILESIZE + 1), {
          filename: 'big.pdf',
          contentType: 'application/pdf',
        })

      expect(res.status).toBe(400)
      expect(res.body.code).toBe('LIMIT_FILE_SIZE')
    })
  })

  describe('field name', () => {
    it('errors on an unexpected field name', async () => {
      const res = await request(app)
        .post('/upload')
        .attach('wrong', Buffer.from('x'), {
          filename: 'a.png',
          contentType: 'image/png',
        })

      expect(res.body.code).toBe('LIMIT_UNEXPECTED_FILE')
    })
  })
})
