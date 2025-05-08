<template>
  <div
    class="relative flex flex-col w-full bg-white rounded-xs px-2 py-1 shadow-sm"
  >
    <Button
      @click="toggleMenu"
      type="ghost-icon"
      class="absolute top-0 right-1"
    >
      <svg
        width="19"
        height="24"
        viewBox="0 0 19 24"
        class="fill-current"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M9.5 7.5C10.3284 7.5 11 6.82843 11 6C11 5.17157 10.3284 4.5 9.5 4.5C8.67157 4.5 8 5.17157 8 6C8 6.82843 8.67157 7.5 9.5 7.5Z"
        />
        <path
          d="M9.5 13.5C10.3284 13.5 11 12.8284 11 12C11 11.1716 10.3284 10.5 9.5 10.5C8.67157 10.5 8 11.1716 8 12C8 12.8284 8.67157 13.5 9.5 13.5Z"
        />
        <path
          d="M9.5 19.5C10.3284 19.5 11 18.8284 11 18C11 17.1716 10.3284 16.5 9.5 16.5C8.67157 16.5 8 17.1716 8 18C8 18.8284 8.67157 19.5 9.5 19.5Z"
        />
      </svg>
    </Button>
    <h1 class="font-poppins font-medium text-primary-500">
      {{ props.hotspot.label }}
    </h1>
    <p class="body truncate text-grayscale-700">{{ props.hotspot.content }}</p>
    <!-- Options menu -->
    <div
      v-if="menuOpen"
      ref="optionsMenu"
      class="absolute -top-1 -translate-y-full right-0 flex flex-col gap-2 divide-y-1 px-2 py-1 divide-grayscale-300 bg-grayscale-200 rounded-xs shadow-xs"
    >
      <Button
        @click="() => (requestedEdit = props.hotspotId)"
        type="ghost"
        class="w-full text-grayscale-800"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          class="fill-current"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M3.434 12L12 3.43401L8.56597 0L0 8.56603V12H3.434ZM8.56597 1.51427L10.4857 3.43401L9.10134 4.81841L7.18163 2.89865L8.56597 1.51427ZM6.42447 3.65578L8.34425 5.5755L2.99048 10.9292H1.07075V9.00954L6.42447 3.65578Z"
          />
        </svg>
        <span class="tag">Edit</span>
      </Button>
      <Button
        @click="() => (requestedDelete = props.hotspotId)"
        type="ghost"
        class="w-full text-grayscale-800"
        ><svg
          width="10"
          height="12"
          viewBox="0 0 10 12"
          xmlns="http://www.w3.org/2000/svg"
          class="fill-current"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M2.5 0V1.2H0V2.4H10V1.2H7.5V0H2.5ZM0.625 3H1.875V10.5514L2.13388 10.8H7.86608L8.125 10.5514V3H9.375V11.0486L8.38392 12H1.61612L0.625 11.0486V3Z"
          />
        </svg>
        <span class="tag">Delete</span>
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, useTemplateRef } from "vue";
import { onClickOutside } from "@vueuse/core";
import { useHotspotStore } from "../../stores/hotspotStore";
import { storeToRefs } from "pinia";
import Button from "../Button.vue";
type Hotspot = {
  position: { x: number; y: number; z: number };
  quaternion: { x: number; y: number; z: number; w: number };
  label: string;
  content: string;
};

const props = defineProps<{
  hotspotId: number;
  hotspot: Hotspot;
}>();

const hotspotStore = useHotspotStore();
const { requestedEdit, requestedDelete } = storeToRefs(hotspotStore);

const menuOpen = ref(false);
const optionsMenu = useTemplateRef<HTMLElement>("optionsMenu");

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value;
};

onClickOutside(optionsMenu, () => (menuOpen.value = false));
</script>
