<template>
  <div class="w-full @container">
    <div
      class="w-full min-h-screen mx-auto mt-20 max-w-[1920px] px-4 md:px-8 lg:px-16 @min-[1984px]:px-0"
    >
      <Button type="ghost" @click="() => router.back()" class="mb-2 underline"
        >Back</Button
      >
      <div v-if="loading" class="flex flex-col gap-4 lg:flex-row">
        <div class="flex w-full lg:w-3/5">
          <Skeleton for="model" />
        </div>
        <div class="flex w-full lg:w-2/5">
          <Skeleton for="model-description" />
        </div>
      </div>
      <div
        v-else-if="!loading && model"
        class="flex flex-col gap-4 lg:flex-row"
      >
        <div
          class="flex h-120 lg:h-200 lg:w-3/5 max-h-[650px] rounded-sm justify-center items-center"
        >
          <ThreeVisualizer :modelId="model.id" />
        </div>
        <div class="flex flex-col gap-4 lg:w-2/5">
          <div>
            <h1 class="title text-primary-500 mb-2">{{ model.name }}</h1>
          </div>
          <div class="pb-4 border-b-1 border-grayscale-300">
            <div class="flex flex-col gap-4">
              <p
                v-for="p in descriptionParagraphs()"
                class="body text-grayscale-900"
              >
                {{ p }}
              </p>
            </div>
            <Button
              type="ghost"
              v-if="showReadMore"
              @click="() => (isTruncated = !isTruncated)"
              class="tag underline-none mt-2"
              >{{ isTruncated ? "Read more" : "Read less" }}
              <img
                v-if="isTruncated"
                src="../../assets/icons/chevron-down.svg"
                alt="Read more icon"
                class="w-5"
              />
              <img
                v-else
                src="../../assets/icons/chevron-up.svg"
                alt="Read less icon"
                class="w-5"
              />
            </Button>
          </div>
          <div class="pb-4 border-b-1 border-grayscale-300">
            <h2 class="subtitle text-primary-500">Dimensions</h2>
            <div
              v-if="model.dimensions.length > 0"
              class="body text-grayscale-900"
            >
              <p v-for="dim in model.dimensions">
                {{ formatDimension(dim) }}
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
                {{ material.name }}
              </li>
            </ul>
            <div v-else>
              <p class="body text-grayscale-900">
                No known materials for this model.
              </p>
            </div>
          </div>
          <div class="flex gap-1 flex-wrap">
            <Tag v-for="tag in model.tags" :content="tag.name" />
          </div>
          <div>
            <p class="tag text-grayscale-500 mb-1">User Name</p>
            <p class="tag text-grayscale-500">
              {{ cleanDate(model.createdAt) }}
            </p>
          </div>
        </div>
      </div>
      <div
        v-else-if="!loading && error"
        class="flex flex-col text-grayscale-500"
      >
        <h1 class="title text-5xl text-wrap mb-8">
          Error fetching model information.
        </h1>
        <h1 class="title text-7xl mb-16">:(</h1>
        <h2 class="title text-3xl text-grayscale-300">
          Model ID: {{ route.params.id }}
        </h2>
      </div>
    </div>
    <div class="w-full mt-40">
      <Footer />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import axiosInstance from "../scripts/axiosConfig";
import Button from "../components/Button.vue";
import Tag from "../components/Tag.vue";
import Skeleton from "../components/Skeleton.vue";
import ThreeVisualizer from "../components/three/ThreeVisualizer.vue";
import { useDimensions } from "../scripts/useDimensions";
import Footer from "../components/Footer.vue";

interface Tag {
  name: string;
}

interface Material {
  name: string;
}

interface Dimension {
  type: "WIDTH" | "HEIGHT" | "DEPTH" | "WEIGHT" | "VOLUME";
  value: number;
  unit: string;
}

interface Model {
  id: string;
  name: string;
  caption: string;
  description: string;
  materials: Array<Material>;
  tags: Array<Tag>;
  dimensions: Array<Dimension>;
  modelPath: string;
  thumbnailPath: string;
  createdAt: string;
}

const route = useRoute();
const router = useRouter();

const loading = ref(false);
const model = ref<Model | null>(null);
const error = ref<any>(null);

const isTruncated = ref(true);
const { formatDimension } = useDimensions();

const cleanDate = (rawDate: string): string => {
  const date = new Date(rawDate);

  return date.toLocaleString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const descriptionParagraphs = (): Array<string> => {
  let description = model.value?.description || "";
  const maxLength = 350;

  if (isTruncated.value && description.length > maxLength) {
    description = description.slice(0, maxLength) + "...";
  }

  return description.split("  ");
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

const showReadMore = computed(() => {
  const description = model.value?.description;

  return description && description.length > 350;
});

onMounted(() => {
  fetchModelData();
});
</script>
