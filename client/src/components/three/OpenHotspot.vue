<template>
  <div
    class="absolute z-40 bottom-2 right-12 px-2 py-3 bg-grayscale-100/90 rounded-xs shadow-sm w-[200px] md:w-[300px] font-poppins"
  >
    <div class="relative flex flex-col gap-4">
      <button
        @click="emit('close')"
        class="absolute right-0 top-0 cursor-pointer"
      >
        <svg
          width="16"
          viewBox="0 0 14 14"
          xmlns="http://www.w3.org/2000/svg"
          class="fill-grayscale-700"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M5.67416 7L0.712036 11.9621L2.03786 13.288L7.00004 8.32587L11.9622 13.288L13.288 11.9621L8.32591 7L13.2879 2.03798L11.962 0.712158L7.00004 5.67412L2.03801 0.712158L0.712186 2.03798L5.67416 7Z"
          />
        </svg>
      </button>

      <div class="flex flex-col gap-2">
        <h1
          class="font-bold text-primary-500 w-full pb-1 border-b border-grayscale-300"
        >
          {{ hotspot.label }}
        </h1>
        <p class="font-garamond text-primary-900">{{ hotspot.content }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useHotspotStore } from "../../stores/hotspotStore";

type Hotspot = {
  position: { x: number; y: number; z: number };
  quaternion: { x: number; y: number; z: number; w: number };
  label: string;
  content: string;
};
const props = defineProps<{
  hotspotId: number;
}>();

const emit = defineEmits(["close"]);

const hotspotStore = useHotspotStore();

const id = computed(() => props.hotspotId);

const hotspot: Hotspot = hotspotStore.getHotspot(id.value);
</script>
