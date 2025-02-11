<template>
  <div class="flex flex-wrap max-w-600 my-12 gap-10">
    <ModelCard
      v-for="(item, index) in models"
      :item="item"
      :key="item.id"
      :index="index"
    />
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
