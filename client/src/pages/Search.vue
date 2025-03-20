<template>
  <SearchBar />
  <div class="w-full mx-auto mt-32 mb-12 max-w-[1920px]">
    <div v-if="emptySearch" class="size-full">
      <div
        v-if="!modelStore.loading && !modelStore.error"
        class="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
      >
        <ModelCard
          v-for="(item, index) in modelStore.models"
          :item="item"
          :key="item.id"
          :index="index"
        />
      </div>
      <div
        v-else-if="modelStore.loading && !modelStore.error"
        class="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
      >
        <div v-for="i in 16" class="flex flex-col gap-1">
          <Skeleton for="thumbnail" :key="i" />
          <Skeleton for="card" :key="i" />
        </div>
      </div>
      <div
        v-else-if="!modelStore.loading && modelStore.error"
        class="flex flex-col text-grayscale-500"
      >
        <h1 class="title text-5xl text-wrap mb-8">Error fetching models.</h1>
        <h1 class="title text-7xl">:(</h1>
      </div>
    </div>
    <div v-else>
      <h1 class="title">Searching with values:</h1>
      <h2 class="subtitle">
        Query: <span class="font-poppins font-medium">{{ query }}</span>
      </h2>
      <h2 class="subtitle">
        Sort: <span class="font-poppins font-medium">{{ sort }}</span>
      </h2>
      <h2 class="subtitle">
        Tags: <span class="font-poppins font-medium">{{ tags }}</span>
      </h2>
      <h2 class="subtitle">
        Materials:
        <span class="font-poppins font-medium">{{ materials }}</span>
      </h2>
      <h2 class="subtitle">
        Others: <span class="font-poppins font-medium">{{ others }}</span>
      </h2>
    </div>
  </div>
</template>

<script setup lang="ts">
import SearchBar from "../components/search/SearchBar.vue";
import ModelCard from "../components/ModelCard.vue";
import Skeleton from "../components/Skeleton.vue";
import { ref, watch, onMounted } from "vue";
import { useSearchBar } from "../scripts/searchUtils";
import { useModelStore } from "../stores/modelStore";

const modelStore = useModelStore();
const { query, sort, tags, materials, others } = useSearchBar();

const emptySearch = ref(true);

watch([query, sort, tags, materials, others], () => {
  if (
    !query.value &&
    tags.value.length === 0 &&
    materials.value.length === 0 &&
    others.value.length === 0
  ) {
    emptySearch.value = true;
  } else {
    emptySearch.value = false;
  }
});

onMounted(() => {
  if (!modelStore.models) {
    modelStore.fetchModels();
  }
});
</script>
