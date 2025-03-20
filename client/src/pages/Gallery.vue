<template>
  <div class="w-full mx-auto mt-28 mb-12 max-w-[1920px]">
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
</template>

<script setup lang="ts">
import ModelCard from "../components/ModelCard.vue";
import Skeleton from "../components/Skeleton.vue";
import { onMounted } from "vue";
import { useModelStore } from "../stores/modelStore";

const modelStore = useModelStore();

onMounted(() => {
  if (!modelStore.models) {
    modelStore.fetchModels();
  }
});
</script>
