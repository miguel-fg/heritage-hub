import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import {
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} from '@aws-sdk/client-s3'

import s3Client from '../../src/services/s3Client'

import {
  generatePresignedUrl,
  generateFilePresignedUrl,
  generatePresignedUploadUrl,
  deleteObjectFromR2,
  deleteAllFromR2,
} from '../../src/scripts/r2Storage'

vi.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: vi.fn(),
}))

vi.mock('../../src/services/s3Client', () => ({
  default: { send: vi.fn() },
}))

const signMock = vi.mocked(getSignedUrl)
const sendMock = vi.mocked(s3Client.send) as unknown as ReturnType<typeof vi.fn>

beforeEach(() => {
  signMock.mockResolvedValue('https://signed.url')
})

describe('R2 Storage utility functions', () => {
  describe('generatePresignedUrl', () => {
    it('signs a GetObjectCommand for the bucket and key', async () => {
      const url = await generatePresignedUrl('bucket', 'key.glb')

      expect(url).toBe('https://signed.url')
      const [client, command, options] = signMock.mock.calls[0]

      expect(client).toBe(s3Client)
      expect(command).toBeInstanceOf(GetObjectCommand)
      expect(command.input).toEqual({ Bucket: 'bucket', Key: 'key.glb' })
      expect(options).toEqual({ expiresIn: 3600 })
    })

    it('uses a custom expiry', async () => {
      await generatePresignedUrl('bucket', 'key.glb', 60)

      expect(signMock.mock.calls[0][2]).toEqual({ expiresIn: 60 })
    })
  })

  describe('generateFilePresignedUrl', () => {
    it('adds an attachment content disposition with the filename', async () => {
      const url = await generateFilePresignedUrl('bucket', 'key', 'model.pdf')

      expect(url).toBe('https://signed.url')
      const [client, command, options] = signMock.mock.calls[0]

      expect(client).toBe(s3Client)
      expect(command).toBeInstanceOf(GetObjectCommand)
      expect(command.input).toEqual({
        Bucket: 'bucket',
        Key: 'key',
        ResponseContentDisposition: 'attachment; filename="model.pdf"',
      })
      expect(options).toEqual({ expiresIn: 3600 })
    })

    it('uses a custom expiry', async () => {
      await generateFilePresignedUrl('bucket', 'key', 'f.pdf', 120)

      expect(signMock.mock.calls[0][2]).toEqual({ expiresIn: 120 })
    })
  })

  describe('generatePresignedUploadUrl', () => {
    it('signs a PutObjectCommand with a 1 hour expiry', async () => {
      const url = await generatePresignedUploadUrl('bucket', 'upload/key')

      expect(url).toBe('https://signed.url')
      const [client, command, options] = signMock.mock.calls[0]
      expect(client).toBe(s3Client)
      expect(command).toBeInstanceOf(PutObjectCommand)
      expect(command.input).toEqual({ Bucket: 'bucket', Key: 'upload/key' })
      expect(options).toEqual({ expiresIn: 3600 })
    })
  })

  describe('deleteObjectFromR2', () => {
    it('sends a DeleteObjectCommand and returns true', async () => {
      sendMock.mockResolvedValue({})

      const result = await deleteObjectFromR2('bucket', 'key')

      expect(result).toBe(true)
      expect(sendMock).toHaveBeenCalledTimes(1)
      const command = sendMock.mock.calls[0][0]
      expect(command).toBeInstanceOf(DeleteObjectCommand)
      expect(command.input).toEqual({ Bucket: 'bucket', Key: 'key' })
    })

    it('logs and rethrows on failure', async () => {
      const error = new Error('R2 Down')
      sendMock.mockRejectedValue(error)
      const logSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(deleteObjectFromR2('bucket', 'key')).rejects.toBe(error)

      expect(logSpy).toHaveBeenCalledWith(
        '[R2 Error] Error deleting object key: ERR: ',
        error,
      )
      logSpy.mockRestore()
    })
  })

  describe('deleteAllFromR2', () => {
    it('lists objects by prefix, then deletes them in one batch', async () => {
      sendMock
        .mockResolvedValueOnce({
          Contents: [{ Key: 'models/1/a.glb' }, { Key: 'models/1/b.png' }],
        })
        .mockResolvedValueOnce({})

      await deleteAllFromR2('bucket', 'models/1/')

      expect(sendMock).toHaveBeenCalledTimes(2)

      const listCommand = sendMock.mock.calls[0][0]
      expect(listCommand).toBeInstanceOf(ListObjectsV2Command)
      expect(listCommand.input).toEqual({
        Bucket: 'bucket',
        Prefix: 'models/1/',
      })

      const deleteCommand = sendMock.mock.calls[1][0]
      expect(deleteCommand).toBeInstanceOf(DeleteObjectsCommand)
      expect(deleteCommand.input).toEqual({
        Bucket: 'bucket',
        Delete: {
          Objects: [{ Key: 'models/1/a.glb' }, { Key: 'models/1/b.png' }],
          Quiet: true,
        },
      })
    })

    it('does not delete anything when the listing is empty', async () => {
      sendMock.mockResolvedValue({ Contents: [] })

      await deleteAllFromR2('bucket', 'prefix/')

      expect(sendMock).toHaveBeenCalledTimes(1)
    })

    it('does not delete anything when Contents is undefined', async () => {
      sendMock.mockResolvedValue({})

      await deleteAllFromR2('bucket', 'prefix/')

      expect(sendMock).toHaveBeenCalledTimes(1)
    })

    it('skips listed entries without a Key', async () => {
      sendMock
        .mockResolvedValueOnce({
          Contents: [{ Key: 'a' }, {}, { Key: undefined }, { Key: 'b' }],
        })
        .mockResolvedValueOnce({})

      await deleteAllFromR2('bucket', 'prefix/')

      expect(sendMock.mock.calls[1][0].input.Delete.Objects).toEqual([
        { Key: 'a' },
        { Key: 'b' },
      ])
    })

    it('propagates list errors without attempting a delete', async () => {
      sendMock.mockRejectedValue(new Error('list failed'))

      await expect(deleteAllFromR2('bucket', 'prefix/')).rejects.toThrow(
        'list failed',
      )
      expect(sendMock).toHaveBeenCalledTimes(1)
    })
  })
})
