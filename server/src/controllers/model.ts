import { Request, Response } from "express";
import prisma from "../services/prisma";
import { generatePresignedUrl } from "../scripts/r2Storage";

const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME!;

export const getModels = async (req: Request, res: Response): Promise<void> => {
  const models = await prisma.model.findMany();

  const modelsWithPresignedUrls = await Promise.all(
    models.map(async (model) => {
      const thumbnailUrl = await generatePresignedUrl(
        BUCKET_NAME,
        model.thumbnailPath,
      );
      return {
        ...model,
        thumbnailUrl,
      };
    }),
  );

  res.status(200).json({ models: modelsWithPresignedUrls });
};

export const getModel = async (req: Request, res: Response): Promise<void> => {
  const modelId = req.params.id;
  res.status(200).json({ message: `Get a single model with ID: ${modelId}` });
};

export const newModel = async (req: Request, res: Response): Promise<void> => {
  res.status(200).json({ message: "Create a new model" });
};
