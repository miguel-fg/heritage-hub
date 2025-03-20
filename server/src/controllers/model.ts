import { Request, Response } from "express";
import prisma from "../services/prisma";
import { generatePresignedUrl } from "../scripts/r2Storage";

const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME!;

export const getModels = async (req: Request, res: Response): Promise<void> => {
  try {
    const models = await prisma.model.findMany({
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
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
    res.status(200).json({ models });
  } catch (error) {
    console.error(
      "[server]: Failed to fetch models from database. ERR: ",
      error,
    );
    res.status(500).json({
      error: `[server]: Failed to fetch models from database. ERR: ${error}`,
    });
  }
};

export const getModel = async (req: Request, res: Response): Promise<void> => {
  try {
    const modelId = req.params.id;

    const model = await prisma.model.findUnique({
      where: {
        id: modelId,
      },
      include: {
        materials: {
          select: { name: true },
        },
        tags: {
          select: { name: true },
        },
      },
    });

    res.status(200).json({ model });
  } catch (error) {
    console.error("[server]: Failed to fetch model data. ERR: ", error);
    res.status(500).json({
      error: `[server]: Failed to fetch model data. ERR: ${error}`,
    });
  }
};

export const getModelThumbnailUrl = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const modelId = req.params.id;

  try {
    const thumbnailUrl = await generatePresignedUrl(
      BUCKET_NAME,
      `${modelId}/thumbnail.png`,
    );
    res.status(200).json({ thumbnailUrl });
  } catch (error) {
    console.error("[server]: Failed to generate presigned URL. ERR: ", error);
    res.status(500).json({
      error: `[server]: Failed to generate presigned URL. ERR: ${error}`,
    });
  }
};

export const getModelObjectUrl = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const modelId = req.params.id;

  try {
    const objectUrl = await generatePresignedUrl(
      BUCKET_NAME,
      `${modelId}/model.glb`,
    );
    res.status(200).json({ objectUrl });
  } catch (error) {
    console.error("[server]: Failed to generate presigned URL. ERR: ", error);
    res.status(500).json({
      error: `[server]: Failed to generate presigned URL. ERR: ${error}`,
    });
  }
};

export const newModel = async (req: Request, res: Response): Promise<void> => {
  res.status(200).json({ message: "Create a new model" });
};
