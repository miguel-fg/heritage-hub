import { defineStore } from "pinia";
import { ref } from "vue";
import axiosInstance from "../scripts/axiosConfig";

export const useModelStore = defineStore("models", () => {
  const models = ref([]);
  const presignedUrlCache = ref({});

  const fetchModels = async () => {
    try {
      console.log("[model store]: Fetching 3D models...");
      const response = await axiosInstance.get("/models");
      models.value = response.data.models;
      console.log("[model store]: Success.");
    } catch (error) {
      console.error("[model store]: Failed to fetch 3D models. ERR: ", error);
    }
  };

  const getThumbnailUrl = async (modelId: string) => {
    const cachedUrl = presignedUrlCache.value[modelId];

    if (cachedUrl && cachedUrl.expiresAt > Date.now()) {
      return cachedUrl.url;
    }

    return fetchNewPresignedUrl(modelId);
  };

  const fetchNewPresignedUrl = async (modelId: string) => {
    try {
      const response = await axiosInstance.get(
        `/models/${modelId}/thumbnail-url`,
      );
      const newUrl = response.data.thumbnailUrl;

      presignedUrlCache.value[modelId] = {
        url: newUrl,
        expiresAt: Date.now() + 3600 * 1000,
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

  return { models, fetchModels, getThumbnailUrl };
});
