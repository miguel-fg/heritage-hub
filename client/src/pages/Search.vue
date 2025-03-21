<template>
  <SearchBar />
  <div class="w-full mx-auto mt-32 mb-12 max-w-[1920px]">
    <div
      v-if="!loading && !error"
      class="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
    >
      <ModelCard
        v-for="(item, index) in filteredModels"
        :item="item"
        :key="item.id"
        :index="index"
      />
    </div>
    <div
      v-else-if="loading && !error"
      class="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
    >
      <div v-for="i in 16" class="flex flex-col gap-1">
        <Skeleton for="thumbnail" :key="i" />
        <Skeleton for="card" :key="i" />
      </div>
    </div>
    <div v-else-if="!loading && error" class="flex flex-col text-grayscale-500">
      <h1 class="title text-5xl text-wrap mb-8">Error fetching models.</h1>
      <h1 class="title text-7xl">:(</h1>
    </div>
  </div>
</template>

<script setup lang="ts">
import SearchBar from "../components/search/SearchBar.vue";
import ModelCard from "../components/ModelCard.vue";
import Skeleton from "../components/Skeleton.vue";
import { computed, onMounted } from "vue";
import { useSearchBar } from "../scripts/searchUtils";
import { useModelStore } from "../stores/modelStore";
import { storeToRefs } from "pinia";

type ModelAttribute = "downloadable";

const modelStore = useModelStore();

const { models, loading, error } = storeToRefs(modelStore);
const { query, sort, tags, materials, others } = useSearchBar();

const filteredModels = computed(() => {
  if (!models.value) return [];

  // Filters
  let filtered = models.value.filter((model) => {
    const cleanQuery = query.value.toLowerCase();

    const queryMatch =
      model.name.toLowerCase().includes(cleanQuery) ||
      model.caption.toLowerCase().includes(cleanQuery);

    const tagsMatch =
      tags.value.length === 0 ||
      tags.value.every((tag) =>
        model.tags.some((modelTag) => modelTag.name === tag),
      );

    const materialsMatch =
      materials.value.length === 0 ||
      materials.value.every((material) =>
        model.materials.some(
          (modelMaterial) => modelMaterial.name === material,
        ),
      );

    const othersMatch =
      others.value.length === 0 ||
      others.value.every((attribute) => {
        const attr = attribute as ModelAttribute;

        return model[attr] === true;
      });

    return queryMatch && tagsMatch && materialsMatch && othersMatch;
  });

  // Sorting
  if (sort.value === "newest") {
    filtered = [...filtered].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  } else if (sort.value === "oldest") {
    filtered = [...filtered].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  } else if (sort.value === "a-z") {
    filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
  } else if (sort.value === "z-a") {
    filtered = [...filtered].sort((a, b) => b.name.localeCompare(a.name));
  }

  return filtered;
});

onMounted(() => {
  if (!models.value) {
    modelStore.fetchModels();
  }
});
</script>
