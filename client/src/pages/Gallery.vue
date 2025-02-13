<template>
  <div class="w-full mx-auto my-12 max-w-[1920px]">
    <div
      class="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
    >
      <ModelCard
        v-for="(item, index) in models"
        :item="item"
        :key="item.id"
        :index="index"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import ModelCard from "../components/ModelCard.vue";
import { useModelStore } from "../stores/modelStore";
import { storeToRefs } from "pinia";
import { onMounted } from "vue";

const modelStore = useModelStore();
const { models } = storeToRefs(modelStore);

onMounted(() => {
  modelStore.fetchModels();
});
</script>
