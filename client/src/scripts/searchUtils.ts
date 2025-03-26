import { ref } from "vue";
import axiosInstance from "./axiosConfig";

const query = ref("");
const sort = ref<"newest" | "oldest" | "a-z" | "z-a">("newest");
const tags = ref<string[]>([]);
const materials = ref<string[]>([]);
const others = ref<string[]>([]);

const tagOptions = ref<{ value: string; label: string }[]>([]);
const materialOptions = ref<{ value: string; label: string }[]>([]);
const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "a-z", label: "A to Z" },
  { value: "z-a", label: "Z to A" },
];
const otherOptions = [{ value: "downloadable", label: "Downloadable" }];

export const useSearchBar = () => {
  const fetchTags = async () => {
    try {
      const response = await axiosInstance.get("/tags");
      const tags = response.data.tags;
      return tags.map((tag: { name: string }) => ({
        value: tag.name,
        label: tag.name,
      }));
    } catch (error) {
      console.error("[useSearchBar]: Failed to fetch tags: ", error);
      return [];
    }
  };

  const fetchMaterials = async () => {
    try {
      const response = await axiosInstance.get("/materials");
      const materials = response.data.materials;
      return materials.map((material: { name: string }) => ({
        value: material.name,
        label: material.name,
      }));
    } catch (error) {
      console.error("[useSearchBar]: Failed to fetch materials: ", error);
      return [];
    }
  };

  const clearFilters = () => {
    tags.value = [];
    materials.value = [];
    others.value = [];
  };

  const resetSearch = () => {
    query.value = "";
    sort.value = "newest";
    tags.value = [];
    materials.value = [];
    others.value = [];
  };

  return {
    query,
    sort,
    tags,
    materials,
    others,
    tagOptions,
    materialOptions,
    sortOptions,
    otherOptions,
    fetchTags,
    fetchMaterials,
    clearFilters,
    resetSearch,
  };
};
