import { defineStore } from "pinia";
import { ref } from "vue";
import axiosInstance from "../scripts/axiosConfig";

interface Tag {
  name: string;
}

interface Material {
  name: string;
}

interface Model {
  id: string;
  name: string;
  caption: string;
  tags: Array<Tag>;
  materials: Array<Material>;
  thumbnailPath: string;
  downloadable: boolean;
  createdAt: string;
}

interface PresignedUrl {
  url: string;
  expiresAt: number;
}

interface ModelUrls {
  thumbnail?: PresignedUrl;
  object?: PresignedUrl;
}

interface PaginationState {
  page: number;
  limit: number;
  hasMore: boolean;
  total: number;
}

export const useModelStore = defineStore("models", () => {
  const models = ref<Array<Model> | null>(null);
  const loading = ref(false);
  const error = ref<any>(null);

  const presignedUrlCache = ref<Record<string, ModelUrls>>({});

  const pagination = ref<PaginationState>({
    page: 1,
    limit: 18,
    hasMore: true,
    total: 0,
  });

  const fetchModels = async (limit = 18, skip = 0) => {
    error.value = null;
    loading.value = true;

    try {
      const response = await axiosInstance.get("/models", {
        params: {
          limit,
          skip,
        },
      });

      const { models: fetchedModels, total } = response.data;

      if (models.value) {
        models.value = [...models.value, ...fetchedModels];
      } else {
        models.value = fetchedModels;
      }

      pagination.value = {
        page: Math.floor(skip / limit) + 1,
        limit,
        total,
        hasMore: skip + limit < total,
      };
    } catch (err: any) {
      console.error("[model store]: Failed to fetch models. ERR: ", err);
      error.value = err;
      models.value = null;
    } finally {
      loading.value = false;
    }
  };

  const loadMoreModels = async () => {
    if (loading.value || !pagination.value.hasMore) return;

    const nextSkip = models.value?.length || 0;
    await fetchModels(pagination.value.limit, nextSkip);
  };

  const getThumbnailUrl = async (modelId: string) => {
    const cachedModel = presignedUrlCache.value[modelId] || {};
    const cachedThumbnail = cachedModel.thumbnail;

    if (cachedThumbnail && cachedThumbnail.expiresAt > Date.now()) {
      return cachedThumbnail.url;
    }

    try {
      const response = await axiosInstance.get(
        `/models/${modelId}/thumbnail-url`,
      );
      const newUrl = response.data.thumbnailUrl;

      presignedUrlCache.value[modelId] = {
        ...cachedModel,
        thumbnail: {
          url: newUrl,
          expiresAt: Date.now() + 3600 * 1000,
        },
      };

      return newUrl;
    } catch (error) {
      console.error(
        "[model store]: Failed to fetch new presigned URL. ERR: ",
        error,
      );
      return null;
    }
  };

  // Fake Thumbnail Url For Testing Only
  const getFakeThumbnailUrl = async (modelId: string) => {
    return `https://picsum.photos/400/500?random=${modelId}`;
  };

  const getObjectUrl = async (
    modelId: string,
    editing = false,
    file: File | null | undefined,
  ) => {
    // Load model from local file
    if (editing && file) {
      return await getLocalObjectUrl(file);
    }

    // Fetch model from cache or Cloudflare
    const cachedModel = presignedUrlCache.value[modelId] || {};
    const cachedObject = cachedModel.object;

    if (cachedObject && cachedObject.expiresAt > Date.now()) {
      return cachedObject.url;
    }

    try {
      const response = await axiosInstance.get(`/models/${modelId}/object`);
      const newUrl = response.data.objectUrl;

      presignedUrlCache.value[modelId] = {
        ...cachedModel,
        object: {
          url: newUrl,
          expiresAt: Date.now() + 3600 * 1000,
        },
      };

      return newUrl;
    } catch (error) {
      console.error(
        "[model store]: Failed to fetch new presigned URL. ERR: ",
        error,
      );
      return null;
    }
  };

  const getLocalObjectUrl = (file: File) => {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error("No file provided"));
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        resolve(event.target?.result);
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsDataURL(file);
    });
  };

  const resetPagination = () => {
    pagination.value = {
      page: 1,
      limit: pagination.value.limit,
      hasMore: true,
      total: 0,
    };
    models.value = null;
  };

  const removeCachedUrls = (modelId: string) => {
    delete presignedUrlCache.value[modelId];
  };

  const removeModelById = (modelId: string) => {
    if (models.value) {
      models.value = models.value.filter((m) => m.id !== modelId);
    }

    delete presignedUrlCache.value[modelId];
  };

  return {
    models,
    loading,
    error,
    pagination,
    resetPagination,
    fetchModels,
    loadMoreModels,
    presignedUrlCache,
    getThumbnailUrl,
    getFakeThumbnailUrl,
    getObjectUrl,
    removeModelById,
    removeCachedUrls,
  };
});
