<template>
  <ModelCard
    v-for="(item, index) in models"
    :item="item"
    :key="item.id"
    :index="index"
  />
</template>

<script setup lang="ts">
import ModelCard from "../components/ModelCard.vue";
import { ref, onMounted } from "vue";
import axiosInstance from "../scripts/axiosConfig";

const models = ref([]);

const fetchModels = async () => {
  try {
    console.log("Fetching 3D models...");
    const response = await axiosInstance.get("/models");
    models.value = response.data.models;
  } catch (error) {
    console.error("Failed to fetch 3D models. ERR: ", error);
  }
};

onMounted(() => {
  fetchModels();
});
</script>
