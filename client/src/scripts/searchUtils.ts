import { ref } from "vue";

const query = ref("");
const sort = ref<"relevant" | "newest" | "oldest" | "a-z" | "z-a">("relevant");
const tags = ref<string[]>([]);
const materials = ref<string[]>([]);
const others = ref<string[]>([]);

export const useSearchBar = () => {
  const clearFilters = () => {
    tags.value = [];
    materials.value = [];
    others.value = [];
  };

  const resetSearch = () => {
    query.value = "";
    sort.value = "relevant";
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
    clearFilters,
    resetSearch,
  };
};
