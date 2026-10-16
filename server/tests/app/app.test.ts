import { afterEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'

const { stub } = vi.hoisted(() => ({
  stub: async (name: string) => {
    const { Router } = await import('express')
    const r = Router()

    r.all('/ping', (_req, res) => {
      res.json({ route: name })
    })
    return { default: r }
  },
}))

vi.mock('../../src/routes/model', () => stub('models'))
vi.mock('../../src/routes/tag', () => stub('tags'))
vi.mock('../../src/routes/material', () => stub('materials'))
vi.mock('../../src/routes/search', () => stub('search'))
vi.mock('../../src/routes/auth', () => stub('cas'))
vi.mock('../../src/routes/user', () => stub('user'))
vi.mock('../../src/routes/image', () => stub('images'))
vi.mock('../../src/routes/pdf', () => stub('pdfs'))

vi.mock('morgan', () => ({ default: () => (_q: any, _s: any, n: any) => n() }))

async function loadApp(env?: string) {
  vi.resetModules()

  vi.stubEnv('ENVIRONMENT', env)
  return (await import('../../src/app')).default
}

describe('Express App', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  describe('route mounting', () => {
    afterEach(() => {
      vi.unstubAllEnvs()
    })

    it.each([
      ['/api/models', 'models'],
      ['/api/tags', 'tags'],
      ['/api/materials', 'materials'],
      ['/api/search', 'search'],
      ['/api/cas', 'cas'],
      ['/api/user', 'user'],
      ['/api/images', 'images'],
      ['/api/pdfs', 'pdfs'],
    ])('mounts %s', async (path, name) => {
      const app = await loadApp('dev')
      const res = await request(app)
        .get(`${path}/ping`)
        .set('Origin', 'http://localhost:5173')
      expect(res.body).toEqual({ route: name })
    })
  })

  describe('allowedOrigins', () => {
    afterEach(() => {
      vi.unstubAllEnvs()
    })

    it('allows `localhost` origin in development environments', async () => {
      const app = await loadApp('dev')
      const res = await request(app)
        .post('/api/tags/ping')
        .set('Origin', 'http://localhost:5173')

      expect(res.headers['access-control-allow-origin']).toBe(
        'http://localhost:5173',
      )
      expect(res.headers['access-control-allow-credentials']).toBe('true')
      expect(res.status).toBe(200)
    })

    it('rejects `localhost` origin in production environments', async () => {
      const app = await loadApp('prod')
      const res = await request(app)
        .post('/api/tags/ping')
        .set('Origin', 'http://localhost:5173')

      expect(res.headers['access-control-allow-origin']).toBeUndefined()
      expect(res.status).toBe(403)
    })

    it('allows the production origin in production environments', async () => {
      const app = await loadApp('prod')
      const res = await request(app)
        .post('/api/tags/ping')
        .set('Origin', 'https://heritage-hub.ca')

      expect(res.headers['access-control-allow-origin']).toBe(
        'https://heritage-hub.ca',
      )
      expect(res.headers['access-control-allow-credentials']).toBe('true')
      expect(res.status).toBe(200)
    })
  })

  it('returns 404 for unknown routes', async () => {
    const app = await loadApp('dev')
    const res = await request(app)
      .get('/api/nope')
      .set('Origin', 'http://localhost:5173')
    expect(res.status).toBe(404)
  })
})
