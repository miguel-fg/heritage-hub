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

export const useModelStore = defineStore("models", () => {
  const models = ref<Array<Model> | null>(null);
  const loading = ref(false);
  const error = ref<any>(null);

  const presignedUrlCache = ref<Record<string, ModelUrls>>({});

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

  return {
    models,
    loading,
    error,
    fetchModels,
    presignedUrlCache,
    getThumbnailUrl,
    getObjectUrl,
  };
});
