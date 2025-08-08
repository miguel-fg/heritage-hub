<template>
  <div
    v-if="hotspot"
    class="absolute z-40 bottom-2 right-12 px-2 py-3 bg-grayscale-100/90 rounded-xs shadow-sm w-[200px] md:w-[300px] xl:w-[400px] font-poppins max-h-3/7 overflow-y-auto"
  >
    <div class="relative flex flex-col gap-4">
      <button
        @click="emit('close')"
        class="absolute right-0 top-0 cursor-pointer"
      >
        <CloseIcon :size="16" class="fill-grayscale-700" />
      </button>

      <div class="flex flex-col gap-2">
        <h1
          class="font-bold text-primary-500 w-full pb-1 pr-6 border-b border-grayscale-300"
        >
          {{ hotspot.label }}
        </h1>
        <p class="font-garamond text-primary-900 whitespace-pre-line">
          {{ hotspot.content }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useHotspotStore } from "../../stores/hotspotStore";
import CloseIcon from "../icons/CloseIcon.vue";

const props = defineProps<{
  hotspotId: number | null;
}>();

const emit = defineEmits(["close"]);

const hotspotStore = useHotspotStore();

const hotspot = computed(() => {
  if (!props.hotspotId) return undefined;

  return hotspotStore.getHotspot(props.hotspotId);
});
</script>
