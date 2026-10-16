import type { ZodTypeAny } from 'zod'
export const UUID = '550e8400-e29b-41d4-a716-446655440000'

export const passes = (schema: ZodTypeAny, data: unknown) =>
  schema.safeParse(data).success

export const failsAt = (schema: ZodTypeAny, data: unknown, path: string) => {
  const result = schema.safeParse(data)

  return (
    !result.success &&
    result.error.issues.some((i) => i.path.join('.') === path)
  )
}

export const baseModel = () => ({
  id: UUID,
  name: 'Roman amphora',
  caption: 'A short caption',
  description: 'A description that is at least twenty characters long.',
  accNum: null,
  provenance: null,
  downloadable: true,
  objFileType: 'GLB',
  tags: [{ where: { name: 'roman' }, create: { name: 'roman' } }],
  materials: [{ where: { name: 'clay' }, create: { name: 'clay' } }],
  dimensions: [{ modelId: UUID, type: 'WIDTH', value: 10, unit: 'cm' }],
  hotspots: [
    {
      modelId: UUID,
      label: 'Handle',
      content: 'Left handle',
      posX: 0,
      posY: 0,
      posZ: 0,
      norX: 0,
      norY: 1,
      norZ: 0,
      quatX: 0,
      quatY: 0,
      quatZ: 0,
      quatW: 1,
    },
  ],
})

export const validModel = () => ({
  ...baseModel(),
  assets: [{ modelId: UUID, type: 'GLB', filename: 'amphora.glb' }],
})
