import { Request, Response } from "express";
import prisma from "../services/prisma";

export async function getModels(req: Request, res: Response): Promise<void> {
  const models = await prisma.model.findMany();

  res.status(200).json({ models: models });
}

export async function getModel(req: Request, res: Response): Promise<void> {
  const modelId = req.params.id;
  res.status(200).json({ message: `Get a single model with ID: ${modelId}` });
}

export async function newModel(req: Request, res: Response): Promise<void> {
  res.status(200).json({ message: "Create a new model" });
}
