import { Request, Response } from "express";
import prisma from "../services/prisma";
import { generatePresignedUrl } from "../scripts/r2Storage";

const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME!;

export const getModels = async (req: Request, res: Response): Promise<void> => {
  const models = await prisma.model.findMany();
  res.status(200).json({ models });
};

export const getModel = async (req: Request, res: Response): Promise<void> => {
  const modelId = req.params.id;
  res.status(200).json({ message: `Get a single model with ID: ${modelId}` });
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
    res.status(500).json({ error: "Failed to generate presigned URL" });
  }
};

export const newModel = async (req: Request, res: Response): Promise<void> => {
  res.status(200).json({ message: "Create a new model" });
};
