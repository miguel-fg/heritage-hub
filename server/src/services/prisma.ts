import { PrismaClient } from '@prisma/client'
import { ENV } from '../../env'

const isTest = ENV.ENVIRONMENT === 'test'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: isTest ? ENV.DATABASE_TEST_URL : ENV.DATABASE_URL,
    },
  },
})

export default prisma
