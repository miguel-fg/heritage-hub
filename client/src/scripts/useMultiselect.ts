import { ref } from "vue";
import axiosInstance from "./axiosConfig";
import { type Material, type Tag } from "../types/model";

export const useMultiselect = () => {
  const selected = ref<Material[] | Tag[]>([]);
  const options = ref<Material[] | Tag[]>([]);

  const fetchOptions = async (values: "Tags" | "Materials") => {
    const endpoint = values === "Tags" ? "/tags" : "/materials";

    try {
      const response = await axiosInstance.get(endpoint);
      if (values === "Tags") {
        return response.data.tags;
      } else {
        return response.data.materials;
      }
    } catch (error) {
      console.error("[useMultiselect]: Failed to fetch options");
      return [];
    }
  };

  return { selected, options, fetchOptions };
};
