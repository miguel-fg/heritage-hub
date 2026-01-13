import { faker } from '@faker-js/faker'

export const fakeUser = {
  id: faker.string.uuid(),
  casId: faker.string.alphanumeric({ length: { min: 5, max: 8 } }),
  authType: 'cas',
  displayName: faker.person.fullName(),
  email: faker.internet.email({ provider: 'sfu.ca' }),
  permissions: 'STANDARD' as const,
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
  modelPath: '<modelId>/model.glb',
  thumbnailPath: '<modelId>/thumbnail.png',
  multimediaPath: [],
  downloadable: faker.datatype.boolean,
  createdAt: faker.date.anytime,
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
