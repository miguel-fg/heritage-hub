export const modelPrefix = (modelId: string) => `${modelId}/`

export const modelGLBKey = (modelId: string) => `${modelId}/model.glb`

export const modelOBJKeys = (modelId: string) => ({
  model: `${modelId}/model.obj`,
  materials: `${modelId}/materials.mtl`,
})

export const modelTextureKey = (modelId: string, filename: string) =>
  `${modelId}/textures/${filename}`

export const thumbnailKey = (modelId: string) => `${modelId}/thumbnail.png`

export const imageKeys = (modelId: string, imageId: string) => ({
  full: `${modelId}/images/${imageId}/full.webp`,
  thumb: `${modelId}/images/${imageId}/thumb.webp`,
})

export const pdfKey = (modelId: string, pdfId: string) =>
  `${modelId}/pdfs/${pdfId}.pdf`
