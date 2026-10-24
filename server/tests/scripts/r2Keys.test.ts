import { describe, it, expect } from 'vitest'
import {
  modelPrefix,
  modelGLBKey,
  modelOBJKeys,
  modelTextureKey,
  imageKeys,
  pdfKey,
  thumbnailKey,
} from '../../src/scripts/r2Keys'

describe('r2Keys.modelPrefix', () => {
  it('generates a prefix key for a given model', () => {
    expect(modelPrefix('abc')).toBe('abc/')
  })
})

describe('r2Keys.modelGLBKey', () => {
  it('generates a single key for a GLB model', () => {
    expect(modelGLBKey('abc')).toBe('abc/model.glb')
  })
})

describe('r2Keys.modelOBJKeys', () => {
  it('generates two keys: `model` and `materials` for an OBJ model', () => {
    expect(modelOBJKeys('abc')).toEqual({
      model: 'abc/model.obj',
      materials: 'abc/materials.mtl',
    })
  })
})

describe('r2Keys.modelTextureKey', () => {
  it('generates a key for model a texture file', () => {
    expect(modelTextureKey('abc', 'text_01.png')).toBe(
      'abc/textures/text_01.png',
    )
  })
})

describe('r2Keys.thumbnailKey', () => {
  it('generates a key for the model thumbnail', () => {
    expect(thumbnailKey('abc')).toBe('abc/thumbnail.png')
  })
})

describe('r2Keys.imageKeys', () => {
  it('generates two keys: `full` and `thumb` for an image attachment', () => {
    expect(imageKeys('abc', 'image-1')).toEqual({
      full: 'abc/images/image-1/full.webp',
      thumb: 'abc/images/image-1/thumb.webp',
    })
  })
})

describe('r2Keys.pdfKey', () => {
  it('generates a key for a pdf attachment', () => {
    expect(pdfKey('abc', 'pdf-1')).toBe('abc/pdfs/pdf-1.pdf')
  })
})
