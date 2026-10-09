import { faker } from '@faker-js/faker'
import { Readable } from 'stream'

export const fakeUser = {
  id: faker.string.uuid(),
  casId: faker.string.alphanumeric({ length: { min: 5, max: 8 } }),
  authType: 'cas',
  displayName: faker.person.fullName(),
  email: faker.internet.email({ provider: 'sfu.ca' }),
  permissions: 'STANDARD' as const,
}

export const fakeGLBAsset = {
  id: faker.number.int({ max: 1000 }),
  modelId: faker.string.uuid(),
  type: 'GLB',
  filename: faker.system.commonFileName('glb'),
}

export const fakeModel = {
  id: faker.string.uuid(),
  ownerId: fakeUser.id,
  name: faker.lorem.lines(1),
  caption: faker.lorem.sentences({ min: 1, max: 3 }),
  description: faker.lorem.paragraphs({ min: 2, max: 6 }),
  accNum: faker.string.alphanumeric({
    length: { min: 5, max: 12 },
    casing: 'upper',
  }),
  provenance: faker.lorem.sentence(),
  downloadable: faker.datatype.boolean,
  objFileType: 'GLB',
  createdAt: faker.date.anytime,
  assets: fakeGLBAsset,
}

export const fakeTag = {
  id: faker.number.int({ max: 1000 }),
  name: faker.word.noun(),
}

export const fakeMaterial = {
  id: faker.number.int({ max: 1000 }),
  name: faker.word.noun(),
}

export const fakeDimension = {
  id: faker.number.int({ max: 1000 }),
  modelId: faker.string.uuid(),
  type: 'HEIGHT' as const,
  value: faker.number.float({ min: 1, max: 100, fractionDigits: 2 }),
  unit: 'cm',
}

export const fakeHotspot = {
  id: faker.number.int({ max: 1000 }),
  modelId: faker.string.uuid(),
  label: faker.lorem.words({ min: 3, max: 6 }),
  content: faker.lorem.paragraph(1),
  posX: faker.number.float(),
  posY: faker.number.float(),
  posZ: faker.number.float(),
  norX: faker.number.float(),
  norY: faker.number.float(),
  norZ: faker.number.float(),
  quatX: faker.number.float(),
  quatY: faker.number.float(),
  quatZ: faker.number.float(),
  quatW: faker.number.float(),
}

export const fakeModelImage = {
  id: faker.string.uuid(),
  modelId: fakeModel.id,
  order: 0,
  alt: faker.lorem.sentence(),
  label: faker.lorem.words(3),
  description: faker.lorem.paragraph(),
  createdAt: faker.date.anytime,
}
const mimeTypes = [
  'image/gif',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
]

export const fakeMulterFile = {
  filename: faker.system.commonFileName('png'),
  fieldname: 'file',
  originalname: faker.system.commonFileName(),
  mimetype: mimeTypes[faker.number.int({ min: 0, max: mimeTypes.length - 1 })],
  path: faker.system.filePath(),
  encoding: 'utf-8',
  size: faker.number.int({ min: 1000, max: 10000 }),
  stream: new Readable(),
  destination: '',
  buffer: Buffer.from(''),
} satisfies Express.Multer.File
