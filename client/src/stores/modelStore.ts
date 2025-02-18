import { defineStore } from "pinia";
import { ref } from "vue";
import axiosInstance from "../scripts/axiosConfig";

export const useModelStore = defineStore("models", () => {
  const presignedUrlCache = ref<any>({});

  const getThumbnailUrl = async (modelId: string) => {
    const cachedUrl = presignedUrlCache.value[modelId];

    if (cachedUrl && cachedUrl.expiresAt > Date.now()) {
      return cachedUrl.url;
    }

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

  return { presignedUrlCache, getThumbnailUrl };
});
