<template>
  <div class="w-full mx-auto my-12 max-w-[1920px]">
    <Button type="ghost" @click="() => router.back()" class="mb-2">Back</Button>
    <div v-if="!loading && model" class="flex flex-col gap-4 lg:flex-row">
      <div
        class="flex grow lg:w-1/2 max-h-[650px] bg-white rounded-sm justify-center items-center"
      >
        <h1 class="title text-grayscale-900">3D Model Goes Here</h1>
      </div>
      <div class="flex flex-col gap-4 lg:w-1/2">
        <div>
          <h1 class="title text-primary-500 mb-2">{{ model.name }}</h1>
          <p class="tag text-grayscale-500 mb-1">User Name</p>
          <p class="tag text-grayscale-500">{{ cleanDate(model.createdAt) }}</p>
        </div>
        <div class="pb-4 border-b-1 border-grayscale-300">
          <p class="body text-grayscale-900">{{ model.description }}</p>
        </div>
        <div class="pb-4 border-b-1 border-grayscale-300">
          <h2 class="subtitle text-primary-500">Dimensions</h2>
        </div>
        <div class="pb-4 border-b-1 border-grayscale-300">
          <h2 class="subtitle text-primary-500">Materials</h2>
          <ul>
            <li
              class="body text-grayscale-900"
              v-for="(material, index) in model.materials"
              :key="index"
            >
              {{ capitalize(material) }}
            </li>
          </ul>
        </div>
        <div class="flex gap-1 flex-wrap">
          <Tag v-for="tag in model.tags" :content="tag" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import axiosInstance from "../scripts/axiosConfig";
import Button from "../components/Button.vue";
import Tag from "../components/Tag.vue";

const route = useRoute();
const router = useRouter();

const loading = ref(false);
const model = ref(null);
const error = ref<any>(null);

const capitalize = (content: string): string => {
  return content
    .split(/([-/])/)
    .map((part, index, array) => {
      if (part === "-" || part === "/") {
        return part;
      }

      return part
        .split(" ")
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        )
        .join(" ");
    })
    .join("");
};

const cleanDate = (rawDate: string): string => {
  const date = new Date(rawDate);

  return date.toLocaleString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const fetchModelData = async (): Promise<void> => {
  error.value = model.value = null;
  loading.value = true;

  const modelId = route.params.id;

  try {
    const response = await axiosInstance.get(`models/${modelId}`);
    model.value = response.data.model;
  } catch (err: any) {
    console.error("Failed to fetch data from model. ERR: ", err);
    model.value = null;
    error.value = err;
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchModelData();
});
</script>
