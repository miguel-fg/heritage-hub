import { z } from "zod";

const DIMENSION_TYPES = [
  "WIDTH",
  "HEIGHT",
  "DEPTH",
  "WEIGHT",
  "VOLUME",
] as const;

const DIMENSION_UNITS = [
  "mm",
  "cm",
  "m",
  "in",
  "ft",
  "g",
  "kg",
  "oz",
  "lb",
  "ml",
  "l",
  "fl oz",
  "gal",
] as const;

export const modelSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(3).max(75),
  caption: z.string().min(10).max(250),
  description: z.string().min(20).max(2000),
  accNum: z.string().nullable(),
  downloadable: z.boolean(),
  tags: z.array(
    z.object({
      where: z.object({ name: z.string().min(1) }),
      create: z.object({ name: z.string().min(1) }),
    }),
  ),
  materials: z.array(
    z.object({
      where: z.object({ name: z.string().min(1) }),
      create: z.object({ name: z.string().min(1) }),
    }),
  ),
  dimensions: z.array(
    z.object({
      modelId: z.string().uuid(),
      type: z.enum(DIMENSION_TYPES),
      value: z.number().positive(),
      unit: z.enum(DIMENSION_UNITS),
    }),
  ),
  hotspots: z.array(
    z.object({
      modelId: z.string().uuid(),
      label: z.string().min(1),
      content: z.string().min(1),
      posX: z.number(),
      posY: z.number(),
      posZ: z.number(),
      norX: z.number(),
      norY: z.number(),
      norZ: z.number(),
      quatX: z.number(),
      quatY: z.number(),
      quatZ: z.number(),
      quatW: z.number(),
    }),
  ),
});

export type ModelRequestBody = z.infer<typeof modelSchema>;
