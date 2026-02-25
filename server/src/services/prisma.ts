import { PrismaClient } from '@prisma/client'

const isTest = process.env.ENVIRONMENT === 'test'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: isTest ? process.env.DATABASE_TEST_URL : process.env.DATABASE_URL,
    },
  },
})

export default prisma
