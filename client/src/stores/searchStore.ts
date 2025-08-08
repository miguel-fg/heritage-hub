import { defineStore } from "pinia";
import { ref } from "vue";
import axiosInstance from "../scripts/axiosConfig.ts";

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

interface PaginationState {
  page: number;
  limit: number;
  hasMore: boolean;
  total: number;
}

export const useSearchStore = defineStore("search", () => {
  const models = ref<Array<Model> | null>(null);
  const loading = ref(false);
  const error = ref();

  const pagination = ref<PaginationState>({
    page: 1,
    limit: 18,
    hasMore: true,
    total: 0,
  });

  const isMounted = ref(false);

  const searchModels = async (params: {
    query?: string;
    tags?: string[];
    materials?: string[];
    others?: string[];
    sort: string;
    limit?: number;
    skip?: number;
  }) => {
    if (!isMounted) return;

    error.value = null;
    loading.value = true;

    try {
      const response = await axiosInstance.get("/search", {
        params: {
          q: params.query,
          tags: params.tags?.join(","),
          materials: params.materials?.join(","),
          others: params.others?.join(","),
          sort: params.sort,
          limit: params.limit || pagination.value.limit,
          skip: params.skip || 0,
        },
      });

      const { models: searchedModels, total } = response.data;

      models.value = searchedModels;

      pagination.value = {
        page: params.skip
          ? Math.floor(params.skip / (params.limit || pagination.value.limit)) +
            1
          : 1,
        limit: params.limit || pagination.value.limit,
        total,
        hasMore:
          (params.skip || 0) + (params.limit || pagination.value.limit) < total,
      };
    } catch (err) {
      console.error("[search store]: Failed to search models. ERR: ", err);
      error.value = err;
      models.value = null;
    } finally {
      loading.value = false;
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
    isMounted,
    searchModels,
    resetPagination,
  };
});
