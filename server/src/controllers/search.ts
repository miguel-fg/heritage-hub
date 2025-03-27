import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import prisma from "../services/prisma";
import {
  buildModelSearchConditions,
  buildModelSortConditions,
} from "../scripts/prisma";

export const searchModels = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const limit = Number(req.query.limit) || 18;
    const skip = Number(req.query.skip) || 0;
    const query = req.query.q?.toString().trim() || "";
    const tags =
      req.query.tags
        ?.toString()
        .split(",")
        .filter((tag) => tag.trim() !== "") || [];
    const materials =
      req.query.materials
        ?.toString()
        .split(",")
        .filter((material) => material.trim() !== "") || [];
    const sort = req.query.sort?.toString() || "newest";
    const others =
      req.query.others
        ?.toString()
        .split(",")
        .filter((other) => other.trim() !== "") || [];

    const where = Prisma.validator<Prisma.ModelWhereInput>()(
      buildModelSearchConditions({
        query,
        tags,
        materials,
        others,
      }),
    );

    const orderBy = Prisma.validator<Prisma.ModelOrderByWithRelationInput>()(
      buildModelSortConditions(sort),
    );

    const total = await prisma.model.count({ where });

    const models = await prisma.model.findMany({
      where,
      select: {
        id: true,
        name: true,
        caption: true,
        tags: {
          select: {
            name: true,
          },
        },
        materials: {
          select: {
            name: true,
          },
        },
        thumbnailPath: true,
        downloadable: true,
        createdAt: true,
      },
      orderBy,
      take: limit,
      skip,
    });

    res.status(200).json({
      models,
      total,
    });
  } catch (error) {
    console.error("[server]: Failed to search models. ERR: ", error);
    res.status(500).json({
      error: `[server]: Failed to search models. ERR: ${error}`,
    });
  }
};
