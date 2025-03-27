import { Prisma } from "@prisma/client";

type SearchParams = {
  query?: string;
  tags?: string[];
  materials?: string[];
  others?: string[];
};

// Builds WHERE conditions for model search
export const buildModelSearchConditions = (
  params: SearchParams,
): Prisma.ModelWhereInput => {
  const baseConditions: Prisma.ModelWhereInput[] = [];
  const otherConditions: Record<string, boolean> = {};

  // Text search (name or caption)
  if (params.query) {
    baseConditions.push({
      OR: [
        { name: { contains: params.query, mode: "insensitive" } },
        { caption: { contains: params.query, mode: "insensitive" } },
      ],
    });
  }

  // Tags filter
  if (params.tags && params.tags.length > 0) {
    baseConditions.push({
      tags: {
        some: {
          name: { in: params.tags },
        },
      },
    });
  }

  // Materials filter
  if (params.materials && params.materials.length > 0) {
    baseConditions.push({
      materials: {
        some: {
          name: { in: params.materials },
        },
      },
    });
  }

  // Other filters
  if (params.others && params.others.length > 0) {
    params.others.forEach((attr) => {
      otherConditions[attr] = true;
    });
  }

  if (baseConditions.length > 0 || Object.keys(otherConditions).length > 0) {
    const where: Prisma.ModelWhereInput = {};

    if (baseConditions.length > 0) {
      where.AND = baseConditions;
    }

    if (Object.keys(otherConditions).length > 0) {
      Object.assign(where, otherConditions);
    }

    return where;
  }

  return {};
};

export const buildModelSortConditions = (
  sort: string,
): Prisma.ModelOrderByWithRelationInput => {
  switch (sort) {
    case "oldest":
      return { createdAt: "asc" };
    case "a-z":
      return { name: "asc" };
    case "z-a":
      return { name: "desc" };
    case "newest":
    default:
      return { createdAt: "desc" };
  }
};
