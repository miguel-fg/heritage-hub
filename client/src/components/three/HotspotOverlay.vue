<template>
  <div
    class="absolute z-40 bottom-2 right-12 px-2 py-2 bg-grayscale-100/90 rounded-xs shadow-xs w-[200px] text-xs font-poppins"
  >
    <div class="flex flex-col gap-2">
      <div class="flex flex-col w-full gap-1">
        <label for="hotspot-label" class="font-bold text-primary-500">
          Label
        </label>
        <input
          id="hotspot-label"
          type="text"
          class="bg-white font-garamond rounded-xs"
          :class="
            isAttempted && labelError !== ''
              ? 'border-2 border-danger-500'
              : 'border border-grayscale-300'
          "
          v-model="newLabel"
        />
        <span
          v-if="isAttempted && labelError !== ''"
          class="text-danger-600 font-medium"
          >{{ labelError }}</span
        >
      </div>
      <div class="flex flex-col w-full gap-1">
        <label for="hotspot-content" class="font-bold text-primary-500">
          Content
        </label>
        <textarea
          id="hotspot-content"
          type="text"
          class="bg-white font-garamond rounded-xs resize-none"
          rows="3"
          v-model="newContent"
          :class="
            isAttempted && contentError !== ''
              ? 'border-2 border-danger-500'
              : 'border border-grayscale-300'
          "
        />
        <span
          v-if="isAttempted && contentError !== ''"
          class="text-danger-600 font-medium"
          >{{ contentError }}</span
        >
      </div>
      <div class="flex justify-between font-medium">
        <button
          @click="handleSaveClick"
          class="px-2 py-1 bg-success-300 text-success-800 rounded-xs hover:bg-success-600 rounded-xs"
        >
          Save Hotspot
        </button>
        <button
          @click="() => (isAttempted = false)"
          class="px-2 py-1 bg-danger-300 text-danger-800 rounded-xs hover:bg-danger-600 rounded-xs"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useToastStore } from "../../stores/toastStore.ts";
import { useHotspotStore } from "../../stores/hotspotStore.ts";
import { storeToRefs } from "pinia";

const emit = defineEmits(["save", "cancel"]);

const hotspotStore = useHotspotStore();
const { newLabel, newContent } = storeToRefs(hotspotStore);

const labelError = ref("Label error.");
const contentError = ref("Content error.");

const isAttempted = ref(false);

const toastStore = useToastStore();

const handleSaveClick = async () => {
  isAttempted.value = true;
  if (labelError.value === "" && contentError.value === "") {
    emit("save");
    newLabel.value = "";
    newContent.value = "";
    isAttempted.value = false;
  } else {
    toastStore.showToast("error", "Failed to save hotspot!");
  }
};

watch(newLabel, (val) => {
  labelError.value = val === "" ? "Label cannot be empty." : "";
});

watch(newContent, (val) => {
  contentError.value = val === "" ? "Content cannot be empty." : "";
});
</script>
