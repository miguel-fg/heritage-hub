<template>
  <div class="w-full mx-auto my-12 max-w-[1920px]">
    <Button type="ghost" @click="() => router.back()" class="mb-2">Back</Button>
    <div v-if="!loading && model" class="flex flex-col gap-4 lg:flex-row">
      <div
        class="flex h-120 lg:h-auto lg:w-3/5 max-h-[650px] bg-white rounded-sm justify-center items-center"
      >
        <h1 class="title text-grayscale-900">3D Model Goes Here</h1>
      </div>
      <div class="flex flex-col gap-4 lg:w-2/5">
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
          <div v-if="model.dimensions" class="body text-grayscale-900">
            <p v-if="model.dimensions.width">
              Width: {{ formatDimension(model.dimensions.width) }}
            </p>
            <p v-if="model.dimensions.height">
              Height: {{ formatDimension(model.dimensions.height) }}
            </p>
            <p v-if="model.dimensions.depth">
              Depth: {{ formatDimension(model.dimensions.depth) }}
            </p>
            <p v-if="model.dimensions.weight">
              Weight: {{ formatDimension(model.dimensions.weight) }}
            </p>
          </div>
          <div v-else>
            <p class="body text-grayscale-900">
              No known dimensions for this model.
            </p>
          </div>
        </div>
        <div class="pb-4 border-b-1 border-grayscale-300">
          <h2 class="subtitle text-primary-500">Materials</h2>
          <ul v-if="model.materials.length > 0">
            <li
              class="body text-grayscale-900"
              v-for="(material, index) in model.materials"
              :key="index"
            >
              {{ capitalize(material) }}
            </li>
          </ul>
          <div v-else>
            <p class="body text-grayscale-900">
              No known materials for this model.
            </p>
          </div>
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

interface Dimension {
  metric: {
    value: number;
    unit: string;
  };
  imperial: {
    value: number;
    unit: string;
  };
}

interface Model {
  id: string;
  name: string;
  caption: string;
  description: string;
  materials: Array<string>;
  tags: Array<string>;
  dimensions: {
    width: Dimension | null;
    height: Dimension | null;
    depth: Dimension | null;
    weight: Dimension | null;
  };
  modelPath: string;
  thumbnailPath: string;
  createdAt: string;
}

const route = useRoute();
const router = useRouter();

const loading = ref(false);
const model = ref<Model | null>(null);
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

const formatDimension = (dimension: Dimension): string => {
  const { metric, imperial } = dimension;

  return `${metric.value} ${metric.unit} / ${imperial.value} ${imperial.unit}`;
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
