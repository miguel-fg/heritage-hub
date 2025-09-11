<template>
  <div
    class="absolute top-0 left-0 z-50 w-full h-full flex justify-center text-grayscale-100 bg-grayscale-900/80"
  >
    <Icon
      icon="bx:x"
      class="absolute top-3 right-3 cursor-pointer"
      width="35"
    />
    <div class="flex flex-col items-center max-w-7/10">
      <div class="text-grayscale-100 w-full">
        <h1 class="title w-full text-center my-4">Help Menu</h1>
        <div class="mb-8">
          <h2 class="subtitle mb-4">Navigating the Model</h2>
          <ul class="font-poppins text-xs md:text-base">
            <li class="mb-1">
              <span class="font-bold">Rotate</span>: Click or drag to turn the
              model.
            </li>
            <li class="mb-1">
              <span class="font-bold">Pan</span>: Right-click or two-finger drag
              to pan the view.
            </li>
            <li>
              <span class="font-bold">Zoom</span>: Scroll or pinch to zoom in
              and out.
            </li>
          </ul>
        </div>
      </div>
      <div class="mb-2 w-full">
        <h2 class="subtitle mb-4">Toolbar Buttons</h2>
        <div v-if="props.showDownload" class="flex gap-2 items-center mb-1">
          <Icon icon="bx:download" width="20" />
          <span class="font-poppins text-xs md:text-base"
            >Download the model to your device.</span
          >
        </div>
        <div class="flex gap-2 items-center mb-1">
          <div class="flex gap-1">
            <Icon icon="bx:play" width="20" />
            <Icon icon="bx:pause" width="20" />
          </div>
          <span class="font-poppins text-xs md:text-base"
            >Turn automatic spinning on/off</span
          >
        </div>
        <div class="flex gap-2 items-center mb-1">
          <div class="flex gap-1">
            <Icon icon="bx:show" width="20" />
            <Icon icon="bx:hide" width="20" />
          </div>
          <span class="font-poppins text-xs md:text-base"
            >Show or hide points of interest</span
          >
        </div>
        <div class="flex gap-2 items-center mb-1">
          <Icon icon="bx:cog" width="20" />
          <span class="font-poppins text-xs md:text-base"
            >Adjust visualizer settings.</span
          >
        </div>
        <div class="flex gap-2 items-center">
          <Icon icon="bx:fullscreen" width="20" />
          <span class="font-poppins text-xs md:text-base"
            >Toggle fullscreen mode.</span
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue";

const props = defineProps<{
  showDownload: boolean;
}>();
</script>
