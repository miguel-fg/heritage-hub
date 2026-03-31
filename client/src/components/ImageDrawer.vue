<template>
  <div
    class="absolute bottom-0 w-full flex flex-col justify-center items-center"
    :class="props.class"
  >
    <button
      @click="visualizerStore.toggleImageDrawer"
      class="w-[100px] md:w-[120px] lg:w-[150px] flex justify-center cursor-pointer bg-grayscale-900/60 rounded-t-sm hover:bg-grayscale-900/90 active:bg-grayscale-900/90 transition-all duration-100"
      aria-label="Open image drawer"
    >
      <Icon
        :icon="
          visualizerStore.isImageDrawerOpen
            ? 'bx:chevron-down'
            : 'bx:chevron-up'
        "
        :width="smallerThanMd ? '30' : '40'"
        :height="smallerThanMd ? '30' : '40'"
        class="text-grayscale-100"
      />
    </button>
    <div
      class="w-full rounded-sm bg-grayscale-900/60 flex items-center transition-all duration-300 gap-1 md:gap-3 lg:gap-5 overflow-hidden"
      :class="drawerHeight"
    >
      <button
        @click="() => visualizerStore.decrementIndex(props.images.length)"
        class="px-3 md:px-4 cursor-pointer hover:bg-grayscale-900/90 active:bg-grayscale-900/90 h-full transition-all duration-100 rounded-l-md"
      >
        <Icon
          icon="bx:caret-left"
          class="text-grayscale-100"
          :width="smallerThanMd ? '30' : '40'"
          :height="smallerThanMd ? '30' : '40'"
        />
      </button>
      <div
        ref="scrollContainer"
        class="grow-1 flex items-center gap-3 lg:gap-5 overflow-x-auto scrollbar-none snap-x"
      >
        <button
          ref="thumbnailRefs"
          @click="visualizerStore.setSelectedIndex(0)"
          class="shrink-0 rounded-xs overflow-hidden border-2 transition-all duration-200 snap-center scroll-ml-2"
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
          ref="thumbnailRefs"
          v-for="(image, i) in props.images"
          @click="visualizerStore.setSelectedIndex(i + 1)"
          class="shrink-0 rounded-xs overflow-hidden border-2 transition-all duration-200"
          :class="
            visualizerStore.selectedIndex === i + 1
              ? 'border-primary-500 size-18'
              : 'border-transparent hover:border-grayscale-200 size-20 hover:size-22 cursor-pointer snap-center scroll-ml-2'
          "
        >
          <div class="relative size-full group/delete">
            <img
              :src="`${r2BaseURL}/${props.modelId}/images/${image.id}/thumb.webp`"
              :alt="image.alt ?? ''"
              class="size-full object-cover rounded-xs"
              loading="lazy"
            />
            <button
              v-if="props.hasPermissions"
              @click.stop="emit('delete-image', image.id)"
              class="absolute right-1 top-1 p-1 bg-grayscale-900/60 hover:bg-grayscale-900/90 opacity-0 group-hover/delete:opacity-100 text-danger-300 hover:text-danger-400 transition-all duration-200 cursor-pointer rounded-xs"
            >
              <Icon icon="bx:trash" width="20" height="20" />
            </button>
          </div>
        </button>
      </div>
      <button
        @click="() => visualizerStore.incrementIndex(props.images.length)"
        class="px-3 md:px-4 cursor-pointer hover:bg-grayscale-900/90 active:bg-grayscale-900/90 h-full transition-all duration-100 rounded-r-md"
      >
        <Icon
          icon="bx:caret-right"
          class="text-grayscale-100"
          :width="smallerThanMd ? '30' : '40'"
          :height="smallerThanMd ? '30' : '40'"
        />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useVisualizerStore } from '../stores/visualizerStore'
import { type ModelImage } from '../types/model'
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'
import { ref, computed, watch, nextTick, onBeforeUpdate } from 'vue'

const props = defineProps<{
  modelId: string
  images: ModelImage[]
  hasPermissions: boolean
  class?: string
}>()

const breakpoints = useBreakpoints(breakpointsTailwind)
const smallerThanMd = breakpoints.smaller('md')

const emit = defineEmits(['delete-image'])

const visualizerStore = useVisualizerStore()

const environment = import.meta.env.VITE_ENVIRONMENT!
const r2BaseURL =
  environment === 'ngrok' || environment === 'dev'
    ? import.meta.env.VITE_R2_DEV_URL!
    : import.meta.env.VITE_R2_PROD_URL!

const drawerHeight = computed(() =>
  visualizerStore.isImageDrawerOpen ? (smallerThanMd ? 'h-25' : 'h-30') : 'h-0',
)

const thumbnailRefs = ref<HTMLElement[]>([])

watch(
  () => visualizerStore.selectedIndex,
  async (newIndex) => {
    await nextTick()

    const target = thumbnailRefs.value[newIndex]

    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      })
    }
  },
)

onBeforeUpdate(() => {
  thumbnailRefs.value = []
})
</script>
