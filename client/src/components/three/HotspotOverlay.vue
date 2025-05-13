<template>
  <div
    class="absolute z-40 bottom-2 right-12 px-2 py-2 bg-grayscale-100/90 rounded-xs shadow-xs w-[200px] md:w-[300px] font-poppins"
  >
    <div class="flex flex-col gap-4">
      <div class="flex flex-col w-full gap-1">
        <label for="hotspot-label" class="font-bold text-grayscale-700">
          Label
        </label>
        <input
          id="hotspot-label"
          type="text"
          class="px-1 bg-white font-garamond rounded-xs"
          :class="
            isAttempted && labelError !== ''
              ? 'border-2 border-danger-500'
              : 'border border-grayscale-300'
          "
          v-model="newLabel"
        />
        <span
          v-if="isAttempted && labelError !== ''"
          class="text-danger-600 font-medium text-xs"
          >{{ labelError }}</span
        >
      </div>
      <div class="flex flex-col w-full gap-1">
        <label for="hotspot-content" class="font-bold text-grayscale-700">
          Content
        </label>
        <textarea
          id="hotspot-content"
          type="text"
          class="px-1 bg-white font-garamond rounded-xs resize-none"
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
          class="text-danger-600 font-medium text-xs"
          >{{ contentError }}</span
        >
      </div>
      <div class="flex justify-between font-medium">
        <Button @click="emit('toggle-marker')" type="secondary"
          >Toggle Marker</Button
        >
        <Button @click="handleSaveClick" type="success">Save Hotspot</Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useToastStore } from "../../stores/toastStore.ts";
import { useHotspotStore } from "../../stores/hotspotStore.ts";
import { storeToRefs } from "pinia";
import Button from "../Button.vue";

const props = defineProps<{
  editingHotspotId: number | null;
}>();

const emit = defineEmits(["save", "update", "toggle-marker"]);

const hotspotStore = useHotspotStore();
const { newLabel, newContent } = storeToRefs(hotspotStore);

const labelError = ref("Label error.");
const contentError = ref("Content error.");

const isAttempted = ref(false);

const toastStore = useToastStore();

const handleSaveClick = async () => {
  isAttempted.value = true;
  if (labelError.value === "" && contentError.value === "") {
    props.editingHotspotId ? emit("update") : emit("save");
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

onMounted(() => {
  if (props.editingHotspotId) {
    const hotspot = hotspotStore.getHotspot(props.editingHotspotId);
    newLabel.value = hotspot?.label || "";
    newContent.value = hotspot?.content || "";
  }
});
</script>
