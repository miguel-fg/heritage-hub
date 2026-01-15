import { faker } from '@faker-js/faker'
import prisma from '../../src/services/prisma'
import { v4 as uuidv4 } from 'uuid'
import type { PermissionLevel, DimensionType } from '@prisma/client'

/*
  USER SEEDS
*/

interface SeedUserOptions {
  id?: string
  casId?: string
  authType?: string
  displayName?: string
  email?: string
  permissions?: PermissionLevel
}

export const seedUser = async (options: SeedUserOptions = {}) => {
  const user = await prisma.user.create({
    data: {
      id: options.id || uuidv4(),
      casId: options.casId || faker.string.alphanumeric(10),
      authType: options.authType || 'cas',
      displayName: options.displayName || faker.person.fullName(),
      email: options.email || faker.internet.email(),
      permissions: options.permissions || 'STANDARD',
    },
  })

  return user
}

export const seedAdminUser = async (options: SeedUserOptions = {}) => {
  return seedUser({ ...options, permissions: 'ADMIN' })
}

export const seedRestrictedUser = async (options: SeedUserOptions = {}) => {
  return seedUser({ ...options, permissions: 'RESTRICTED' })
}
export const seedFullUser = async (options: SeedUserOptions = {}) => {
  return seedUser({ ...options, permissions: 'FULL' })
}

/*
  SESSION SEEDS
*/

interface SeedSessionOptions {
  id?: string
  userId: string
  expiresAt?: Date
}

export const seedSession = async (options: SeedSessionOptions) => {
  const session = await prisma.session.create({
    data: {
      id: options.id || faker.string.alphanumeric(32),
      userId: options.userId,
      expiresAt:
        options.expiresAt || new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    },
  })

  return session
}

/*
  ONE-TIME CODE SEEDS
*/

interface SeedOTCOptions {
  code?: string
  userId: string
  expiresAt?: Date
}

export const seedOneTimeCode = async (options: SeedOTCOptions) => {
  const otc = await prisma.oneTimeCode.create({
    data: {
      code: options.code || faker.string.alphanumeric(32),
      userId: options.userId,
      expiresAt: options.expiresAt || new Date(Date.now() + 60_000),
    },
  })

  return otc
}

export const seedExpiredOneTimeCode = async (options: SeedOTCOptions) => {
  return seedOneTimeCode({
    ...options,
    expiresAt: new Date(Date.now() - 30_000),
  })
}

/*
  TAG & MATERIAL SEEDS
*/

export const seedTag = async (name?: string) => {
  const tag = await prisma.tag.create({
    data: {
      name: name || faker.word.noun(),
    },
  })

  return tag
}

export const seedMaterial = async (name?: string) => {
  const material = await prisma.material.create({
    data: {
      name: name || faker.word.noun(),
    },
  })

  return material
}

export const seedMultipleTags = async (count: number) => {
  const tags = await Promise.all(Array.from({ length: count }, () => seedTag()))

  return tags
}

export const seedMultipleMaterials = async (count: number) => {
  const materials = await Promise.all(
    Array.from({ length: count }, () => seedMaterial()),
  )

  return materials
}

/*
  MODEL SEEDS
*/

interface SeedModelOptions {
  id?: string
  ownerId: string
  name?: string
  caption?: string
  description?: string
  accNum?: string
  provenance?: string
  downloadable?: boolean
  tags?: { id: number }[]
  materials?: { id: number }[]
}

export const seedModel = async (options: SeedModelOptions) => {
  const modelId = options.id || uuidv4()

  const model = await prisma.model.create({
    data: {
      id: modelId,
      ownerId: options.ownerId,
      name: options.name || faker.lorem.words(3),
      caption: options.caption || faker.lorem.sentence(),
      description: options.description || faker.lorem.paragraphs(2),
      accNum: options.accNum || faker.string.alphanumeric(10).toUpperCase(),
      provenance: options.provenance || faker.lorem.sentence(),
      downloadable: options.downloadable ?? true,
      modelPath: `${modelId}/model.glb`,
      thumbnailPath: `${modelId}/thumbnail.png`,
      multimediaPath: [],
      tags: options.tags ? { connect: options.tags } : undefined,
      materials: options.materials ? { connect: options.materials } : undefined,
    },
    include: {
      tags: true,
      materials: true,
    },
  })

  return model
}

/*
  DIMENSION SEEDS
*/

interface SeedDimensionOptions {
  modelId: string
  type: DimensionType
  value?: number
  unit?: string
}

export const seedDimension = async (options: SeedDimensionOptions) => {
  const dimension = await prisma.dimension.create({
    data: {
      modelId: options.modelId,
      type: options.type,
      value:
        options.value ||
        faker.number.float({ min: 1, max: 100, fractionDigits: 2 }),
      unit: options.unit || 'cm',
    },
  })

  return dimension
}

export const seedStandardDimensions = async (modelId: string) => {
  const dimensions = await Promise.all([
    seedDimension({ modelId, type: 'WIDTH' }),
    seedDimension({ modelId, type: 'HEIGHT' }),
    seedDimension({ modelId, type: 'DEPTH' }),
  ])

  return dimensions
}

/*
  HOTSPOT SEEDS
*/

interface SeedHotspotOptions {
  modelId: string
  label?: string
  content?: string
  posX?: number
  posY?: number
  posZ?: number
  norX?: number
  norY?: number
  norZ?: number
  quatX?: number
  quatY?: number
  quatZ?: number
  quatW?: number
}

export const seedHotspot = async (options: SeedHotspotOptions) => {
  const hotspot = await prisma.hotspot.create({
    data: {
      modelId: options.modelId,
      label: options.label || faker.lorem.words(3),
      content: options.content || faker.lorem.paragraph(),
      posX: options.posX ?? faker.number.float({ min: -10, max: 10 }),
      posY: options.posY ?? faker.number.float({ min: -10, max: 10 }),
      posZ: options.posZ ?? faker.number.float({ min: -10, max: 10 }),
      norX: options.norX ?? 0,
      norY: options.norY ?? 1,
      norZ: options.norZ ?? 0,
      quatX: options.quatX ?? 0,
      quatY: options.quatY ?? 0,
      quatZ: options.quatZ ?? 0,
      quatW: options.quatW ?? 1,
    },
  })

  return hotspot
}

export const seedMultipleHotspots = async (modelId: string, count: number) => {
  const hotspots = await Promise.all(
    Array.from({ length: count }, () => seedHotspot({ modelId })),
  )

  return hotspots
}

/*
  COMPLETE MODEL SEEDS
*/

interface SeedCompleteModelOptions {
  ownerId: string
  withDimensions?: boolean
  withHotspots?: boolean
  hotspotsCount?: number
  withTags?: boolean
  tagsCount?: number
  withMaterials?: boolean
  materialsCount?: number
}

export const seedCompleteModel = async (options: SeedCompleteModelOptions) => {
  let tags = undefined
  if (options.withTags) {
    const tagRecords = await seedMultipleTags(options.tagsCount || 2)
    tags = tagRecords.map((t) => ({ id: t.id }))
  }

  let materials = undefined
  if (options.withMaterials) {
    const materialRecords = await seedMultipleMaterials(
      options.materialsCount || 2,
    )
    materials = materialRecords.map((m) => ({ id: m.id }))
  }

  const model = await seedModel({
    ownerId: options.ownerId,
    tags,
    materials,
  })

  let dimensions: any = []
  if (options.withDimensions) {
    dimensions = await seedStandardDimensions(model.id)
  }

  let hotspots: any = []
  if (options.withHotspots) {
    hotspots = await seedMultipleHotspots(model.id, options.hotspotsCount || 2)
  }

  return {
    model,
    dimensions,
    hotspots,
  }
}

/*
  BATCH SEEDS FOR SEARCH/PAGINATIONS TESTS
*/

export const seedMultipleModels = async (ownerId: string, count: number) => {
  const models = await Promise.all(
    Array.from({ length: count }, () => seedModel({ ownerId })),
  )

  return models
}

export const seedMultipleUsers = async (count: number) => {
  const users = await Promise.all(
    Array.from({ length: count }, () => seedUser()),
  )

  return users
}

/*
  CLEANUP
*/

export const cleanupDatabase = async () => {
  await prisma.hotspot.deleteMany()
  await prisma.dimension.deleteMany()
  await prisma.model.deleteMany()
  await prisma.session.deleteMany()
  await prisma.oneTimeCode.deleteMany()
  await prisma.user.deleteMany()
  await prisma.tag.deleteMany()
  await prisma.material.deleteMany()
}
