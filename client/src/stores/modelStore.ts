import { defineStore } from "pinia";
import { ref } from "vue";
import axiosInstance from "../scripts/axiosConfig";
import fakeModelsData from "../../assets/fakeModels.json";

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
    limit: 24,
    hasMore: true,
    total: 0,
  });

  const fetchModels = async () => {
    error.value = null;
    loading.value = true;

    try {
      const response = await axiosInstance.get("/models");
      models.value = response.data.models;
    } catch (err: any) {
      console.error("[model store]: Failed to fetch models. ERR: ", err);
      error.value = err;
      models.value = null;
    } finally {
      loading.value = false;
    }
  };

  // ------------> DELETE THIS BEFORE COMMITING
  // Fake Models
  const fetchFakeModels = async (limit = 24, skip = 0) => {
    error.value = null;
    loading.value = true;

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const total = fakeModelsData.length;
      const pagedData = fakeModelsData.slice(skip, skip + limit);

      if (models.value) {
        models.value = [...models.value, ...pagedData];
      } else {
        models.value = pagedData;
      }

      pagination.value = {
        page: Math.floor(skip / limit) + 1,
        limit,
        total,
        hasMore: skip + limit < total,
      };
    } catch (err: any) {
      console.error("[model store]: Failed to fetch fake models. ERR: ", err);
      error.value = err;
    } finally {
      loading.value = false;
    }
  };

  const loadMoreFakeModels = async () => {
    if (loading.value || !pagination.value.hasMore) return;

    const nextSkip = models.value?.length || 0;
    console.log(
      `Loading more with values: limit: ${pagination.value.limit}, skip: ${nextSkip}`,
    );
    await fetchFakeModels(pagination.value.limit, nextSkip);
  };
  // <-----------
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

  // ------------> DELETE THIS BEFORE COMMITING
  // Fake Thumbnail Url
  const getFakeThumbnailUrl = async (modelId: string) => {
    return `https://picsum.photos/400/500?random=${modelId}`;
  };

  // <-----------

  const getObjectUrl = async (modelId: string) => {
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

  const resetPagination = () => {
    pagination.value = {
      page: 1,
      limit: pagination.value.limit,
      hasMore: true,
      total: 0,
    };
    models.value = null;
  };

  return {
    models,
    loading,
    error,
    pagination,
    resetPagination,
    fetchModels,
    fetchFakeModels,
    loadMoreFakeModels,
    presignedUrlCache,
    getThumbnailUrl,
    getFakeThumbnailUrl,
    getObjectUrl,
  };
});
