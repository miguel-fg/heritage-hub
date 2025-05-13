<template>
  <h1 class="title text-primary-500">Review and Confirm</h1>
  <div class="flex w-full gap-8">
    <div class="flex flex-col gap-6 shrink-0">
      <div class="w-full">
        <h2 class="subtitle text-grayscale-700 mb-1">Model</h2>
        <img
          v-if="thumbnail"
          :src="thumbnail"
          alt="Model preview"
          class="rounded-xs shadow-sm size-60"
        />
        <div v-if="downloadable" class="flex gap-2 items-center mt-2">
          <DownloadIcon :width="15" :height="20" class="fill-success-700" />
          <span class="font-poppins font-medium text-success-700"
            >Downloadable</span
          >
        </div>
        <div v-else class="flex gap-2 items-center mt-2">
          <DownloadIcon :width="15" :height="20" class="fill-danger-700" />
          <span class="font-poppins font-medium text-danger-700"
            >Not Downloadable</span
          >
        </div>
      </div>
      <div>
        <h2 class="subtitle text-grayscale-700 mb-1">Accession Number</h2>
        <p class="body text-grayscale-900">{{ mAccNum }}</p>
      </div>
      <div>
        <h2 class="subtitle text-grayscale-700 mb-1">Dimensions</h2>
        <div class="flex flex-col gap-3">
          <div v-for="dim in dimensions">
            <div v-if="dim.value && dim.unit" class="flex gap-2">
              <span class="font-poppins font-medium text-grayscale-600">{{
                dim.name
              }}</span>
              <span class="body text-grayscale-900">
                {{ dim.value.toFixed(2) }} {{ dim.unit }}</span
              >
            </div>
          </div>
        </div>
      </div>
      <div>
        <h2 class="subtitle text-grayscale-700 mb-1">Materials</h2>
        <span
          class="tag px-2 py-1 mx-1 rounded-xs shadow-xs bg-grayscale-200 text-grayscale-700"
          v-for="material in selectedMaterials"
          >{{ material.label }}</span
        >
      </div>
      <div>
        <h2 class="subtitle text-grayscale-700 mb-1">Tags</h2>
        <span
          class="tag px-2 py-1 mx-1 rounded-xs shadow-xs bg-grayscale-200 text-grayscale-700"
          v-for="tag in selectedTags"
          >{{ tag.label }}</span
        >
      </div>
    </div>
    <div class="flex flex-col w-full gap-6">
      <div>
        <h2 class="subtitle text-grayscale-700">Name</h2>
        <p class="body text-grayscale-900">{{ mName }}</p>
      </div>
      <div>
        <h2 class="subtitle text-grayscale-700">Caption</h2>
        <p class="body text-grayscale-900">{{ mCaption }}</p>
      </div>
      <div>
        <h2 class="subtitle text-grayscale-700">Description</h2>
        <p class="body text-grayscale-900 whitespace-pre-line">
          {{ mDescription }}
        </p>
      </div>
      <div>
        <h2 class="subtitle text-grayscale-700 mb-1">Hotspots</h2>
        <div class="flex flex-col gap-5">
          <div v-for="hs in hotspots" class="flex flex-col w-full gap-1">
            <h3 class="font-poppins font-medium text-grayscale-600">
              {{ hs.label }}
            </h3>
            <p class="body text-grayscale-900 whitespace-pre-line">
              {{ hs.content }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUpload } from "../../scripts/useUpload";
import { useDimensions } from "../../scripts/useDimensions";
import { useHotspotStore } from "../../stores/hotspotStore";
import DownloadIcon from "../icons/DownloadIcon.vue";

const {
  mName,
  mCaption,
  mDescription,
  thumbnail,
  downloadable,
  mAccNum,
  selectedMaterials,
  selectedTags,
} = useUpload();

const { dimensions } = useDimensions();

const hotspotStore = useHotspotStore();
const { hotspots } = hotspotStore;
</script>
