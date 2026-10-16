import { describe, it, expect } from 'vitest'
import {
  baseModel,
  failsAt,
  passes,
  validModel,
  UUID,
} from '../helpers/validators'
import {
  modelSchema,
  modelEditSchema,
  modelImagesSchema,
  modelImageEditSchema,
  modelPdfsSchema,
  ASSET_TYPES,
  FILE_TYPES,
  DIMENSION_TYPES,
  DIMENSION_UNITS,
} from '../../src/scripts/validators'

describe('Schema validators', () => {
  describe.each([
    ['modelSchema', modelSchema, validModel],
    ['modelEditSchema', modelEditSchema, baseModel],
  ] as const)('%s (shared fields)', (_name, schema, build) => {
    it('accepts a valid body', () => {
      expect(passes(schema, build())).toBe(true)
    })

    it('accepts empty tags, materials, dimensions and hotspots', () => {
      expect(
        passes(schema, {
          ...build(),
          tags: [],
          materials: [],
          dimensions: [],
          hotspots: [],
        }),
      ).toBe(true)
    })

    it('accepts non-null accNum and provenance', () => {
      expect(
        passes(schema, { ...build(), accNum: 'A-1', provenance: 'Rome' }),
      ).toBe(true)
    })

    it.each(['id'])('rejects a non-uuid %s', (field) => {
      expect(failsAt(schema, { ...build(), [field]: 'nope' }, field)).toBe(true)
    })

    describe('name', () => {
      it('rejects fewer than 3 characters', () => {
        expect(failsAt(schema, { ...build(), name: 'ab' }, 'name')).toBe(true)
      })

      it('accepts exactly 3 and 75 characters', () => {
        expect(passes(schema, { ...build(), name: 'abc' })).toBe(true)
        expect(passes(schema, { ...build(), name: 'a'.repeat(75) })).toBe(true)
      })

      it('rejects more than 75 characters', () => {
        expect(
          failsAt(schema, { ...build(), name: 'a'.repeat(76) }, 'name'),
        ).toBe(true)
      })
    })

    describe('caption', () => {
      it('rejects an empty caption', () => {
        expect(failsAt(schema, { ...build(), caption: '' }, 'caption')).toBe(
          true,
        )
      })

      it('accepts 1 and 250 characters', () => {
        expect(passes(schema, { ...build(), caption: 'a' })).toBe(true)
        expect(passes(schema, { ...build(), caption: 'a'.repeat(250) })).toBe(
          true,
        )
      })

      it('rejects more than 250 characters', () => {
        expect(
          failsAt(schema, { ...build(), caption: 'a'.repeat(251) }, 'caption'),
        ).toBe(true)
      })
    })

    describe('description', () => {
      it('rejects fewer than 20 characters', () => {
        expect(
          failsAt(
            schema,
            { ...build(), description: 'a'.repeat(19) },
            'description',
          ),
        ).toBe(true)
      })

      it('accepts 20 and 2000 characters', () => {
        expect(
          passes(schema, { ...build(), description: 'a'.repeat(20) }),
        ).toBe(true)
        expect(
          passes(schema, { ...build(), description: 'a'.repeat(2000) }),
        ).toBe(true)
      })

      it('rejects more than 2000 characters', () => {
        expect(
          failsAt(
            schema,
            { ...build(), description: 'a'.repeat(2001) },
            'description',
          ),
        ).toBe(true)
      })
    })

    describe('objFileType', () => {
      it.each(FILE_TYPES)('accepts %s', (objFileType) => {
        expect(passes(schema, { ...build(), objFileType })).toBe(true)
      })

      it.each(['MTL', 'TEXTURE', 'glb', ''])('rejects %s', (objFileType) => {
        expect(
          failsAt(schema, { ...build(), objFileType }, 'objFileType'),
        ).toBe(true)
      })
    })

    describe.each(['tags', 'materials'] as const)('%s', (field) => {
      it('rejects an empty where.name', () => {
        const body = {
          ...build(),
          [field]: [{ where: { name: '' }, create: { name: 'x' } }],
        }

        expect(failsAt(schema, body, `${field}.0.where.name`)).toBe(true)
      })

      it('rejects an empty create.name', () => {
        const body = {
          ...build(),
          [field]: [{ where: { name: 'x' }, create: { name: '' } }],
        }

        expect(failsAt(schema, body, `${field}.0.create.name`)).toBe(true)
      })

      it('rejects an entry missing create', () => {
        const body = { ...build(), [field]: [{ where: { name: 'x' } }] }
        expect(failsAt(schema, body, `${field}.0.create`)).toBe(true)
      })
    })

    describe('dimensions', () => {
      const dim = (override: object) => ({
        ...build(),
        dimensions: [{ ...build().dimensions[0], ...override }],
      })

      it.each(DIMENSION_TYPES)('accepts type %s', (type) => {
        expect(passes(schema, dim({ type }))).toBe(true)
      })

      it('rejects unknown types', () => {
        expect(
          failsAt(schema, dim({ type: 'LENGTH' }), 'dimensions.0.type'),
        ).toBe(true)
      })

      it.each(DIMENSION_UNITS)('accepts unit %s', (unit) => {
        expect(passes(schema, dim({ unit }))).toBe(true)
      })

      it('rejects an unknown unit', () => {
        expect(failsAt(schema, dim({ unit: 'km' }), 'dimensions.0.unit')).toBe(
          true,
        )
      })

      it('accepts a fractional positive value', () => {
        expect(passes(schema, dim({ value: 0.5 }))).toBe(true)
      })

      it.each([0, -1])('rejects value %s', (value) => {
        expect(failsAt(schema, dim({ value }), 'dimensions.0.value')).toBe(true)
      })

      it('rejects a string value', () => {
        expect(
          failsAt(schema, dim({ value: '10' }), 'dimensions.0.value'),
        ).toBe(true)
      })

      it('rejects a non-uuid modelId', () => {
        expect(
          failsAt(schema, dim({ modelId: 'x' }), 'dimensions.0.modelId'),
        ).toBe(true)
      })
    })

    describe('hotspots', () => {
      const hotspot = (override: object) => ({
        ...build(),
        hotspots: [{ ...build().hotspots[0], ...override }],
      })

      it('rejects an empty label', () => {
        expect(
          failsAt(schema, hotspot({ label: '' }), 'hotspots.0.label'),
        ).toBe(true)
      })

      it('rejects empty content', () => {
        expect(
          failsAt(schema, hotspot({ content: '' }), 'hotspots.0.content'),
        ).toBe(true)
      })

      it('rejects a non-uuid modelId', () => {
        expect(
          failsAt(schema, hotspot({ modelId: 'x' }), 'hotspots.0.modelId'),
        ).toBe(true)
      })

      it('accepts negative and fractional coordinates', () => {
        expect(
          passes(schema, hotspot({ posX: -1.5, norY: -0.25, quatW: -1 })),
        ).toBe(true)
      })

      it.each([
        'posX',
        'posY',
        'posZ',
        'norX',
        'norY',
        'norZ',
        'quatX',
        'quatY',
        'quatZ',
        'quatW',
      ])('rejects a non-number %s', (field) => {
        expect(
          failsAt(schema, hotspot({ [field]: '1' }), `hotspots.0.${field}`),
        ).toBe(true)
      })
    })

    it.each([
      'tags',
      'materials',
      'dimensions',
      'hotspots',
      'downloadable',
      'accNum',
      'provenance',
    ])('requires %s to be present', (field) => {
      const body: any = build()
      delete body[field]
      expect(failsAt(schema, body, field)).toBe(true)
    })
  })

  describe('modelSchema (assets)', () => {
    const asset = (override: object) => ({
      ...validModel(),
      assets: [{ ...validModel().assets[0], ...override }],
    })

    it('requires assets to be present', () => {
      const { assets, ...rest } = validModel()
      expect(failsAt(modelSchema, rest, 'assets')).toBe(true)
    })

    it('accepts an empty assets array', () => {
      expect(passes(modelSchema, { ...validModel(), assets: [] })).toBe(true)
    })

    it.each(ASSET_TYPES)('accepts type %s', (type) => {
      expect(passes(modelSchema, asset({ type }))).toBe(true)
    })

    it('rejects an unknown type', () => {
      expect(
        failsAt(modelSchema, asset({ type: 'PNG' }), 'assets.0.type'),
      ).toBe(true)
    })

    it('rejects a non-uuid modelId', () => {
      expect(
        failsAt(modelSchema, asset({ modelId: 'x' }), 'assets.0.modelId'),
      ).toBe(true)
    })

    it('rejects a missing filename', () => {
      expect(
        failsAt(
          modelSchema,
          asset({ filename: undefined }),
          'assets.0.filename',
        ),
      ).toBe(true)
    })
  })

  describe('modelEditSchema (assets)', () => {
    it('does not require assets', () => {
      expect(passes(modelEditSchema, baseModel())).toBe(true)
    })

    it('strips assets if they are sent', () => {
      const result = modelEditSchema.safeParse(validModel())

      expect(result.success).toBe(true)
      expect(result.success && 'assets' in result.data).toBe(false)
    })
  })

  describe('modelImagesSchema', () => {
    const image = (override: object = {}) => ({
      id: UUID,
      order: 0,
      ...override,
    })
    const body = (images: unknown[] = [image()]) => ({ modelId: UUID, images })

    it('accepts a barebones image', () => {
      expect(passes(modelImagesSchema, body())).toBe(true)
    })

    it('accepts optional alt, label and description', () => {
      expect(
        passes(
          modelImagesSchema,
          body([image({ alt: 'a', label: 'l', description: 'd' })]),
        ),
      ).toBe(true)
    })

    it('rejects a non-uuid modelId', () => {
      expect(
        failsAt(modelImagesSchema, { ...body(), modelId: 'x' }, 'modelId'),
      ).toBe(true)
    })

    it('rejects an empty images array', () => {
      expect(failsAt(modelImagesSchema, body([]), 'images')).toBe(true)
    })

    it('rejects a non-uuid image id', () => {
      expect(
        failsAt(modelImagesSchema, body([image({ id: 'x' })]), 'images.0.id'),
      ).toBe(true)
    })

    it.each([0, 1, 99])('accepts order %s', (order) => {
      expect(passes(modelImagesSchema, body([image({ order })]))).toBe(true)
    })

    it.each([-1, 1.5, '1'])('rejects order %s', (order) => {
      expect(
        failsAt(modelImagesSchema, body([image({ order })]), 'images.0.order'),
      ).toBe(true)
    })
  })

  describe('modelImageEditSchema', () => {
    const body = (image: unknown = {}) => ({ modelId: UUID, image })

    it('accepts an empty image object', () => {
      expect(passes(modelImageEditSchema, body())).toBe(true)
    })

    it('accepts strings, nulls and undefined for the text fields', () => {
      expect(
        passes(modelImageEditSchema, body({ alt: 'a', label: null })),
      ).toBe(true)
      expect(
        passes(
          modelImageEditSchema,
          body({ alt: null, label: null, description: null }),
        ),
      ).toBe(true)
    })

    it('rejects non-string text fields', () => {
      expect(failsAt(modelImageEditSchema, body({ alt: 5 }), 'image.alt')).toBe(
        true,
      )
    })

    it('requires the image object', () => {
      expect(failsAt(modelImageEditSchema, { modelId: UUID }, 'image')).toBe(
        true,
      )
    })

    it('rejects a non-uuid modelId', () => {
      expect(
        failsAt(modelImageEditSchema, { ...body(), modelId: 'x' }, 'modelId'),
      ).toBe(true)
    })
  })

  describe('modelPdfsSchema', () => {
    const body = (pdfs: unknown[] = [{ id: UUID }]) => ({ modelId: UUID, pdfs })

    it('accepts a pdf without a title', () => {
      expect(passes(modelPdfsSchema, body())).toBe(true)
    })

    it('accepts a pdf with a title', () => {
      expect(
        passes(modelPdfsSchema, body([{ id: UUID, title: 'Report' }])),
      ).toBe(true)
    })

    it('rejects an empty pdfs array', () => {
      expect(failsAt(modelPdfsSchema, body([]), 'pdfs')).toBe(true)
    })

    it('rejects a non-uuid pdf id', () => {
      expect(failsAt(modelPdfsSchema, body([{ id: 'x' }]), 'pdfs.0.id')).toBe(
        true,
      )
    })

    it('rejects a non-string title', () => {
      expect(
        failsAt(
          modelPdfsSchema,
          body([{ id: UUID, title: 5 }]),
          'pdfs.0.title',
        ),
      ).toBe(true)
    })

    it('rejects a non-uuid modelId', () => {
      expect(
        failsAt(modelPdfsSchema, { ...body(), modelId: 'x' }, 'modelId'),
      ).toBe(true)
    })
  })
})
