import { Request, Response } from 'express'
import prisma from '../services/prisma'

export const getTags = async (_req: Request, res: Response): Promise<void> => {
  try {
    const tags = await prisma.tag.findMany({
      select: {
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    })

    res.status(200).json({ tags })
  } catch (error) {
    console.error('[server]: Failed to fetch tags from database. ERR: ', error)
    res.status(500).json({
      error: `[server]: Failed to fetch tags from database. ERR: ${error}`,
    })
  }
}
