import { defineStore } from "pinia";
import { ref } from "vue";
import axiosInstance from "../scripts/axiosConfig";

export const useModelStore = defineStore("models", () => {
  const models = ref([]);

  const fetchModels = async () => {
    try {
      console.log("[model store]: Fetching 3D models...");
      const response = await axiosInstance.get("/models");
      models.value = response.data.models;
      console.log("[model store]: Success.");
    } catch (error) {
      console.error("[model store]: Failed to fetch 3D models. ERR: ", error);
    }
  };

  return { models, fetchModels };
});
