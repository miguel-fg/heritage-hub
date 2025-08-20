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
          <Visualizer :modelId="model.id" :downloadable="model.downloadable" />
        </div>
        <div class="flex flex-col gap-4 lg:w-2/5">
          <div>
            <h1 class="title text-primary-500 mb-2">{{ model.name }}</h1>
          </div>
          <div class="pb-4 border-b-1 border-grayscale-300">
            <div class="flex flex-col gap-4">
              <p
                v-for="p in descriptionParagraphs()"
                class="body text-grayscale-900 whitespace-pre-line"
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
            <h2 class="subtitle text-primary-500">Provenance</h2>
            <div v-if="model.provenance">
              <p class="body text-grayscale-900 whitespace-pre-line">
                {{ model.provenance }}
              </p>
            </div>
            <div v-else>
              <p class="body text-grayscale-900">Unknown</p>
            </div>
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
          <div class="flex justify-between items-end">
            <div>
              <p class="tag text-grayscale-500 mb-1">User Name</p>
              <p class="tag text-grayscale-500">
                {{ cleanDate(model.createdAt) }}
              </p>
            </div>
            <div v-if="hasPermissions" class="flex gap-4">
              <Button @click="handleEdit(model)" type="secondary"
                >Edit model</Button
              >
              <Button @click="() => (showConfirmModal = true)" type="danger"
                >Delete model</Button
              >
            </div>
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
        <span class="font-poppins text-xl">{{ error }}</span>
      </div>
    </div>
    <div class="w-full mt-40">
      <Footer />
    </div>
  </div>
  <ConfirmationModal
    :visible="showConfirmModal"
    @confirm="
      () => {
        showConfirmModal = false;
        deleteModel();
      }
    "
    @cancel="() => (showConfirmModal = false)"
  >
    <template #title>Confirm deletion</template>
    <template #subtitle>Are you sure you want to delete this model?</template>
    <template #warning
      >Deleting this model will
      <span class="font-medium">permanently delete</span> all information,
      hotspots and comments associated with it.</template
    >
    <template #confirm>Delete</template>
    <template #cancel>Cancel</template>
  </ConfirmationModal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import axiosInstance from "../scripts/axiosConfig";
import Button from "../components/Button.vue";
import Tag from "../components/Tag.vue";
import Skeleton from "../components/Skeleton.vue";
import Visualizer from "../components/three/Visualizer.vue";
import { useDimensions } from "../scripts/useDimensions";
import Footer from "../components/Footer.vue";
import { useUserStore } from "../stores/userStore";
import { useModelStore } from "../stores/modelStore";
import { useHotspotStore } from "../stores/hotspotStore";
import { useToastStore } from "../stores/toastStore";
import ConfirmationModal from "../components/ConfirmationModal.vue";
import { type Model } from "../types/model";
import { useEdit } from "../scripts/useEdit";

const route = useRoute();
const router = useRouter();

const loading = ref(false);
const model = ref<Model | null>(null);
const error = ref<any>(null);

const isTruncated = ref(true);
const { formatDimension } = useDimensions();

const { initEditState } = useEdit();

const userStore = useUserStore();
const modelStore = useModelStore();
const hotspotStore = useHotspotStore();
const toastStore = useToastStore();

const showConfirmModal = ref(false);

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

  const modelId = paramGuard(route.params.id);

  if (!modelId) {
    toastStore.showToast("error", "Invalid model ID");
    router.replace("/");
    return;
  }

  try {
    const response = await axiosInstance.get(`models/${modelId}`);
    model.value = response.data.model;

    if (model.value) {
      hotspotStore.setHotspotState(model.value.hotspots);
    }
  } catch (err: any) {
    console.error("Failed to fetch data from model. ERR: ", err);
    toastStore.showToast("error", "Failed to fetch model data.");
    model.value = null;
    error.value = err;
  } finally {
    loading.value = false;
  }
};

const deleteModel = async (): Promise<void> => {
  error.value = model.value = null;
  loading.value = true;

  const modelId = paramGuard(route.params.id);

  if (!modelId) {
    toastStore.showToast("error", "Invalid model ID");
    router.replace("/");
    return;
  }

  try {
    await axiosInstance.delete(`models/${modelId}`);
    modelStore.removeModelById(modelId);

    toastStore.showToast("success", "Model deleted successfully!");
    router.push("/");
  } catch (err: any) {
    console.error("Failed to delete model. ERR: ", err);
    toastStore.showToast("error", "Failed to delete model.");
  } finally {
    loading.value = false;
  }
};

const paramGuard = (param: string | string[] | undefined): string | null => {
  if (typeof param === "string") return param;
  return null;
};

const showReadMore = computed(() => {
  const description = model.value?.description;

  return description && description.length > 350;
});

const hasPermissions = computed(() => {
  const user = userStore.user;

  const isOwner =
    user &&
    user.id === model.value?.ownerId &&
    user.permissions !== "RESTRICTED";
  const isElevatedUser =
    user && (user.permissions === "FULL" || user.permissions === "ADMIN");

  return isOwner || isElevatedUser;
});

const handleEdit = async (model: Model) => {
  const initialized = await initEditState(model);

  if (initialized) {
    router.push({ name: "Edit", params: { id: model.id } });
  } else {
    console.error("Failed to initialize edit state");
  }
};

onMounted(() => {
  fetchModelData();
});

onUnmounted(() => {
  model.value = null;
  loading.value = false;
  error.value = null;
  hotspotStore.cleanHotspotState();
});
</script>
