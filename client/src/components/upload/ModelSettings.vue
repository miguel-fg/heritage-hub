<template>
  <CollapsableFormSection name="Model Settings" default-open>
    <div class="flex flex-col gap-8 w-full">
      <div class="flex justify-between">
        <div class="flex flex-col gap-1 shrink-0">
          <h2 class="subtitle text-grayscale-700">Thumbnail</h2>
          <img
            v-if="thumbnail"
            :src="thumbnail"
            alt="Model thumbnail picture"
            class="w-[130px] sm:w-[150px] lg:w-[160px] rounded-xs border border-grayscale-300"
          />
          <div
            v-else
            class="w-[160px] h-[160px] bg-white flex justify-center items-center"
          >
            <Spinner :size="50" class="fill-primary-500" />
          </div>
        </div>
        <div class="flex flex-col w-full ml-4 md:ml-12 shrink">
          <h2 class="subtitle text-grayscale-700">Discoverability</h2>
          <div
            class="flex flex-col gap-4 grow-1 border border-grayscale-300 rounded-xs py-2 px-3"
          >
            <label
              for="downloadable-switch"
              class="font-poppins font-medium text-primary-700 flex flex-wrap justify-between items-center gap-1 cursor-pointer"
            >
              Allow Download
              <input
                id="downloadable-switch"
                type="checkbox"
                v-model="downloadable"
                class="hidden"
              />
              <div
                class="w-10 h-6 p-1 bg-grayscale-300 hover:bg-grayscale-400 rounded-sm transition-colors duration-100"
                :class="{ 'bg-primary-400 hover:bg-primary-500': downloadable }"
              >
                <div
                  class="w-4 h-4 bg-white rounded-xs transform transition-transform duration-200"
                  :class="{ 'translate-x-4': downloadable }"
                ></div>
              </div>
            </label>
            <label
              for="comments-switch"
              class="font-poppins font-medium text-primary-700 flex flex-wrap justify-between items-center gap-1 cursor-pointer"
            >
              Allow Comments
              <input
                id="comments-switch"
                type="checkbox"
                v-model="commentsAllowed"
                class="hidden"
              />
              <div
                class="w-10 h-6 p-1 bg-grayscale-300 hover:bg-grayscale-400 rounded-sm transition-colors duration-100"
                :class="{
                  'bg-primary-400 hover:bg-primary-500': commentsAllowed,
                }"
              >
                <div
                  class="w-4 h-4 bg-white rounded-xs transform transition-transform duration-200"
                  :class="{ 'translate-x-4': commentsAllowed }"
                ></div>
              </div>
            </label>
          </div>
        </div>
      </div>
      <div v-if="!isEmptyRecord(hotspotStore.hotspots)" class="w-full">
        <h2 class="subtitle text-grayscale-700">Hotspots</h2>
        <ul class="flex flex-col gap-4">
          <li v-for="(h, k) in hotspotStore.hotspots">
            <HotspotCard :hotspot-id="Number(k)" :hotspot="h" />
          </li>
        </ul>
      </div>
    </div>
  </CollapsableFormSection>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useHotspotStore } from "../../stores/hotspotStore";
import { useUpload } from "../../scripts/useUpload";
import { isEmptyRecord } from "../../scripts/hhUtils";
import HotspotCard from "./HotspotCard.vue";
import Spinner from "../Spinner.vue";
import CollapsableFormSection from "./CollapsableFormSection.vue";
import { useEdit } from "../../scripts/useEdit";
import { useModelStore } from "../../stores/modelStore";

const hotspotStore = useHotspotStore();
const modelStore = useModelStore();

const props = defineProps<{
  editing?: boolean;
}>();

const { thumbnail, downloadable } = useUpload();
const { toEdit } = useEdit();

const commentsAllowed = ref(false);

onMounted(async () => {
  if (props.editing && toEdit.value) {
    thumbnail.value = await modelStore.getThumbnailUrl(toEdit.value.id);
    downloadable.value = toEdit.value.downloadable;
  }
});
</script>
