<template>
  <div
    class="absolute z-40 bottom-2 right-12 pt-1 pb-2 px-2 bg-grayscale-100/90 rounded-xs shadow-xs w-[200px] text-xs font-poppins"
  >
    <div v-if="props.state === 'visiting'" class="flex flex-col gap-4">
      <div
        class="flex items-center justify-between border-b border-grayscale-300"
      >
        <span class="font-bold text-grayscale-800">Camera</span>
        <Chevron v-model="cameraOpen" />
      </div>
      <div v-if="cameraOpen" class="flex flex-col gap-2">
        <ValueSlider
          v-model="props.values.fov.value"
          min="40"
          max="120"
          label="Field of View"
        />
      </div>
      <div
        class="flex items-center justify-between border-b border-grayscale-300"
      >
        <span class="font-bold text-grayscale-800">Background</span>
        <Chevron v-model="backgroundOpen" />
      </div>
      <div v-if="backgroundOpen" class="flex flex-col gap-2">
        <div class="flex flex-col gap-1">
          <span> Background Color </span>
          <BackgroundPicker v-model="props.values.bgColor.value" />
        </div>
        <ValueSlider
          min="-100"
          max="300"
          v-model="props.values.light.value"
          label="Light Intensity"
        />
      </div>
      <div
        class="flex items-center justify-between border-b border-grayscale-300"
      >
        <span class="font-bold text-grayscale-800">Animation</span>
        <Chevron v-model="animationOpen" />
      </div>
      <div v-if="animationOpen" class="flex flex-col gap-2">
        <ValueSlider
          max="200"
          v-model="props.values.speed.value"
          label="Rotation Speed"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Ref } from "vue";
import { ref } from "vue";
import Chevron from "./Chevron.vue";
import ValueSlider from "../ValueSlider.vue";
import BackgroundPicker from "./BackgroundPicker.vue";

interface ThreeValues {
  fov: Ref<string>;
  bgColor: Ref<string>;
  light: Ref<string>;
  rotation: Ref<boolean>;
  speed: Ref<string>;
}

const props = defineProps<{
  state: string;
  values: ThreeValues;
}>();

// Open menus
const cameraOpen = ref(true);
const backgroundOpen = ref(true);
const animationOpen = ref(true);
</script>
