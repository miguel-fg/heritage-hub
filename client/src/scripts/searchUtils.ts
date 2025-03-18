import { ref } from "vue";

const query = ref("");
const sort = ref<"relevant" | "newest" | "oldest" | "a-z" | "z-a">("relevant");
const tags = ref<string[]>([]);
const materials = ref<string[]>([]);
const downloadable = ref(false);

export const useSearchBar = () => {
  const clearFilters = () => {
    tags.value = [];
    materials.value = [];
    downloadable.value = false;
  };

  const resetSearch = () => {
    query.value = "";
    sort.value = "relevant";
    tags.value = [];
    materials.value = [];
    downloadable.value = false;
  };

  return {
    query,
    sort,
    tags,
    materials,
    downloadable,
    clearFilters,
    resetSearch,
  };
};
