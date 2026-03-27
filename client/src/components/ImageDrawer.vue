<template>
  <div
    class="absolute bottom-0 w-full flex flex-col justify-center items-center"
    :class="props.class"
  >
    <button
      @click="visualizerStore.toggleImageDrawer"
      class="w-[150px] flex justify-center cursor-pointer bg-grayscale-900/60 rounded-t-md hover:bg-grayscale-900/90 transition-all duration-300"
      aria-label="Open image drawer"
    >
      <Icon
        :icon="
          visualizerStore.isImageDrawerOpen
            ? 'bx:chevron-down'
            : 'bx:chevron-up'
        "
        width="40"
        height="40"
        class="text-grayscale-100"
      />
    </button>
    <div
      class="w-full rounded-t-md bg-grayscale-900/60 flex items-center transition-all duration-300 gap-5 overflow-hidden"
      :class="visualizerStore.isImageDrawerOpen ? 'h-30' : 'h-0'"
    >
      <button
        @click="() => visualizerStore.decrementIndex(props.images.length)"
        class="px-4 cursor-pointer hover:bg-grayscale-900/90 h-full transition-all duration-300 rounded-l-md"
      >
        <Icon
          icon="bx:caret-left"
          class="text-grayscale-100"
          width="40"
          height="40"
        />
      </button>
      <div
        class="grow-1 flex items-center justify-center gap-5 overflow-x-auto scrollbar-none"
      >
        <button
          @click="visualizerStore.setSelectedIndex(0)"
          class="shrink-0 rounded-xs overflow-hidden border-2 transition-all duration-200"
          :class="
            visualizerStore.selectedIndex === 0
              ? 'border-primary-400 size-18'
              : 'border-transparent hover:border-grayscale-100 hover:size-22 cursor-pointer size-20'
          "
        >
          <img
            :src="`${r2BaseURL}/${props.modelId}/thumbnail.png`"
            class="size-full object-cover rounded-xs"
            loading="lazy"
          />
        </button>
        <button
          v-for="(image, i) in props.images"
          @click="visualizerStore.setSelectedIndex(i + 1)"
          class="shrink-0 rounded-xs overflow-hidden border-2 transition-all duration-200"
          :class="
            visualizerStore.selectedIndex === i + 1
              ? 'border-primary-500 size-18'
              : 'border-transparent hover:border-grayscale-200 size-20 hover:size-22 cursor-pointer'
          "
        >
          <img
            :src="`${r2BaseURL}/${props.modelId}/images/${image.id}/thumb.webp`"
            :alt="image.alt ?? ''"
            class="size-full object-cover rounded-xs"
            loading="lazy"
          />
        </button>
      </div>
      <button
        @click="() => visualizerStore.incrementIndex(props.images.length)"
        class="px-4 cursor-pointer hover:bg-grayscale-900/90 h-full transition-all duration-300 rounded-r-md"
      >
        <Icon
          icon="bx:caret-right"
          class="text-grayscale-100"
          width="40"
          height="40"
        />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useVisualizerStore } from '../stores/visualizerStore'
import { type ModelImage } from '../types/model'

const props = defineProps<{
  modelId: string
  images: ModelImage[]
  class?: string
}>()

const visualizerStore = useVisualizerStore()

const environment = import.meta.env.VITE_ENVIRONMENT!
const r2BaseURL =
  environment === 'ngrok' || environment === 'dev'
    ? import.meta.env.VITE_R2_DEV_URL!
    : import.meta.env.VITE_R2_PROD_URL!
</script>
