import { Request, Response } from 'express'
import prisma from '../services/prisma'

export const getMaterials = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const materials = await prisma.material.findMany({
      select: {
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    })

    res.status(200).json({ materials })
  } catch (error) {
    console.error(
      '[server]: Failed to fetch materials from database. ERR: ',
      error,
    )
    res.status(500).json({
      error: `[server]: Failed to fetch materials from database. ERR: ${error}`,
    })
  }
}
