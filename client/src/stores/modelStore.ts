import { defineStore } from 'pinia'
import { ref } from 'vue'
import axiosInstance from '../scripts/axiosConfig.ts'
import { unzipSync } from 'fflate'
import type { ModelAssets, ModelFiles, OBJUrls } from '../types/model.ts'

interface Tag {
  name: string
}

interface Material {
  name: string
}

interface Model {
  id: string
  name: string
  caption: string
  tags: Array<Tag>
  materials: Array<Material>
  downloadable: boolean
  createdAt: string
}

interface GLBUrlCache {
  thumbnail?: PresignedUrl
  object?: PresignedUrl
}

interface OBJUrlCache {
  thumbnail?: PresignedUrl
  objFiles?: {
    obj?: PresignedUrl
    mtl?: PresignedUrl
    textures?: {
      filename: string
      url: PresignedUrl
    }[]
  }
}

interface PresignedUrl {
  url: string
  expiresAt: number
}

type ModelUrls = GLBUrlCache | OBJUrlCache

interface PaginationState {
  page: number
  limit: number
  hasMore: boolean
  total: number
}

export const useModelStore = defineStore('models', () => {
  const models = ref<Array<Model> | null>(null)
  const loading = ref(false)
  const error = ref()

  const presignedUrlCache = ref<Record<string, ModelUrls>>({})

  const pagination = ref<PaginationState>({
    page: 1,
    limit: 18,
    hasMore: true,
    total: 0,
  })

  const fetchModels = async (limit = 18, skip = 0) => {
    error.value = null
    loading.value = true

    try {
      const response = await axiosInstance.get('/models', {
        params: {
          limit,
          skip,
        },
      })

      const { models: fetchedModels, total } = response.data

      models.value = fetchedModels

      pagination.value = {
        page: Math.floor(skip / limit) + 1,
        limit,
        total,
        hasMore: skip + limit < total,
      }
    } catch (err) {
      console.error('[model store]: Failed to fetch models. ERR: ', err)
      error.value = err
      models.value = null
    } finally {
      loading.value = false
    }
  }

  const getThumbnailUrl = async (modelId: string) => {
    const cachedModel = presignedUrlCache.value[modelId] || {}
    const cachedThumbnail = cachedModel.thumbnail

    if (cachedThumbnail && cachedThumbnail.expiresAt > Date.now()) {
      return cachedThumbnail.url
    }

    try {
      const response = await axiosInstance.get(
        `/models/${modelId}/thumbnail-url`,
      )
      const newUrl = response.data.thumbnailUrl

      presignedUrlCache.value[modelId] = {
        ...cachedModel,
        thumbnail: {
          url: newUrl,
          expiresAt: Date.now() + 3600 * 1000,
        },
      }

      return newUrl
    } catch (error) {
      console.error(
        '[model store]: Failed to fetch new presigned URL. ERR: ',
        error,
      )
      return null
    }
  }

  // Fake Thumbnail Url For Testing Only
  const getFakeThumbnailUrl = (modelId: string) => {
    return `https://picsum.photos/400/500?random=${modelId}`
  }

  const getGLBUrl = async (
    modelId: string,
    editing = false,
    file: File | null | undefined,
  ) => {
    // Load model from local file
    if (editing && file) {
      return await getLocalObjectUrl(file)
    }

    // Fetch model from cache or Cloudflare
    const cachedModel: GLBUrlCache = presignedUrlCache.value[modelId] || {}
    const cachedObject = cachedModel.object

    if (cachedObject && cachedObject.expiresAt > Date.now()) {
      return cachedObject.url
    }

    try {
      const response = await axiosInstance.get(`/models/${modelId}/object`)
      const newUrl = response.data.objectUrl

      presignedUrlCache.value[modelId] = {
        ...cachedModel,
        object: {
          url: newUrl,
          expiresAt: Date.now() + 3600 * 1000,
        },
      }

      return newUrl
    } catch (error) {
      console.error(
        '[model store]: Failed to fetch new presigned URL. ERR: ',
        error,
      )
      return null
    }
  }

  const getOBJUrls = async (
    modelId: string,
    editing = false,
    files?: ModelFiles & { type: 'OBJ' },
    assets: ModelAssets = [],
  ): Promise<OBJUrls> => {
    // Local files
    if (editing && files) {
      return {
        obj: URL.createObjectURL(files.obj),
        mtl: URL.createObjectURL(files.mtl),
        textures: files.textures.map((t) => ({
          url: URL.createObjectURL(t),
          filename: t.name,
        })),
      }
    }

    // Check cache
    const cachedModel: OBJUrlCache = presignedUrlCache.value[modelId] || {}
    const cachedObjFiles = cachedModel.objFiles

    if (
      cachedObjFiles?.obj &&
      cachedObjFiles?.mtl &&
      cachedObjFiles?.textures &&
      cachedObjFiles.obj.expiresAt > Date.now() &&
      cachedObjFiles.mtl.expiresAt > Date.now() &&
      cachedObjFiles.textures.every((t) => t.url.expiresAt > Date.now())
    ) {
      return {
        obj: cachedObjFiles.obj.url,
        mtl: cachedObjFiles.mtl.url,
        textures: cachedObjFiles.textures.map((t) => ({
          filename: t.filename,
          url: t.url.url,
        })),
      }
    }

    // Build presigned URLs from asset filenames
    try {
      const textureAssets = assets.filter((a) => a.type === 'TEXTURE')
      const response = await axiosInstance.get(`models/${modelId}/object`, {
        params: {
          textures: textureAssets.map((a) => a.filename).join(','),
        },
      })

      const { objUrl, mtlUrl, textureUrls } = response.data
      const expiresAt = Date.now() + 3600 * 1000

      presignedUrlCache.value[modelId] = {
        ...cachedModel,
        objFiles: {
          obj: { url: objUrl, expiresAt },
          mtl: { url: mtlUrl, expiresAt },
          textures: textureUrls.map((t: { filename: string; url: string }) => ({
            filename: t.filename,
            url: { url: t.url, expiresAt },
          })),
        },
      }

      return {
        obj: objUrl,
        mtl: mtlUrl,
        textures: textureUrls,
      }
    } catch (error) {
      console.error(
        '[model store]: Failed to fetch OBJ presigned URLs. ERR: ',
        error,
      )
      throw error
    }
  }

  const getLocalObjectUrl = async (file: File) => {
    if (!file) {
      console.error('Local file not found')
      throw new Error('Local file not found')
    }

    const filename = file.name.toLowerCase()

    if (filename.endsWith('.glb')) {
      return URL.createObjectURL(file)
    }

    if (filename.endsWith('.zip')) {
      const arrayBuffer = await file.arrayBuffer()
      const files = unzipSync(new Uint8Array(arrayBuffer))

      const glbs = Object.entries(files).filter(([path]) =>
        path.toLowerCase().endsWith('.glb'),
      )

      if (glbs.length > 0) {
        const [_, data] = glbs[0]
        const blob = new Blob([data], { type: 'model/gltf-binary' })
        return URL.createObjectURL(blob)
      }
    }

    console.error('Unsupported file format detected')
    throw new Error('Unsupported file format detected')
  }

  const resetPagination = () => {
    pagination.value = {
      page: 1,
      limit: pagination.value.limit,
      hasMore: true,
      total: 0,
    }
    models.value = null
  }

  const removeCachedUrls = (modelId: string) => {
    delete presignedUrlCache.value[modelId]
  }

  const removeModelById = (modelId: string) => {
    if (models.value) {
      models.value = models.value.filter((m) => m.id !== modelId)
    }

    delete presignedUrlCache.value[modelId]
  }

  return {
    models,
    loading,
    error,
    pagination,
    resetPagination,
    fetchModels,
    presignedUrlCache,
    getThumbnailUrl,
    getFakeThumbnailUrl,
    getGLBUrl,
    getOBJUrls,
    removeModelById,
    removeCachedUrls,
  }
})
