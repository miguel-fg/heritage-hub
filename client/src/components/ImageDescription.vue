<template>
  <div
    v-show="openDescription && hasContent"
    class="absolute z-30 bottom-2 right-2 px-2 py-3 bg-grayscale-100/90 rounded-xs shadow-sm w-[200px] md:w-[300px] xl:w-[400px] font-poppins max-h-3/7 overflow-y-auto transition-opacity duration-150"
    :class="!visualizerStore.isImageDrawerOpen ? 'opacity-100' : 'opacity-0'"
  >
    <div class="relative flex flex-col gap-4">
      <button
        @click="toggleDescription"
        title="Close description"
        aria-label="Close description"
        class="absolute right-0 top-0 cursor-pointer text-grayscale-700 hover:text-grayscale-900"
      >
        <Icon icon="bx:x" width="24" />
      </button>
      <div class="flex flex-col gap-2">
        <strong
          class="font-bold text-primary-500 w-full pr-6"
          :class="
            props.description && props.label
              ? 'border-b border-grayscale-300 pb-1'
              : 'border-none pb-0'
          "
        >
          {{ props.label }}
        </strong>
        <p
          class="font-garamond text-grayscale-900 whitespace-pre-line"
          :class="!props.label || props.label === '' ? 'pt-3' : ''"
        >
          {{ props.description }}
        </p>
      </div>
    </div>
  </div>
  <div
    class="absolute z-50 bottom-2 right-2 p-1 flex flex-col gap-3"
    :class="!visualizerStore.isImageDrawerOpen ? 'opacity-100' : 'opacity-0'"
    v-show="!openDescription || !hasContent"
  >
    <button
      v-if="permissions"
      @click="emit('edit')"
      title="Edit image description"
      aria-label="Edit description"
      class="cursor-pointer text-grayscale-700 bg-grayscale-100/40 hover:bg-grayscale-100 hover:text-grayscale-900 active:bg-grayscale-200 active:text-grayscale-900 size-8 rounded-xs"
    >
      <Icon
        icon="bx:edit"
        :width="smallerThanMd ? '20' : '28'"
        class="m-auto"
      />
    </button>
    <button
      v-if="show"
      @click="toggleDescription"
      title="Open image description"
      aria-label="Open description"
      class="cursor-pointer text-grayscale-700 bg-grayscale-100/40 hover:bg-grayscale-100 hover:text-grayscale-900 active:bg-grayscale-200 active:text-grayscale-900 size-8 rounded-xs"
    >
      <Icon
        icon="bx:info-square"
        :width="smallerThanMd ? '20' : '28'"
        class="m-auto"
      />
    </button>
  </div>
</template>

<script setup lang="ts">
import { useVisualizerStore } from '../stores/visualizerStore'
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'
import { ref, computed, watch } from 'vue'
import { Icon } from '@iconify/vue'

const props = defineProps<{
  label: string | undefined
  description: string | undefined
  permissions: boolean
}>()

const emit = defineEmits(['edit'])

const visualizerStore = useVisualizerStore()

const hasContent = computed(
  () =>
    (props.description && props.description !== '') ||
    (props.label && props.label !== ''),
)

const show = computed(
  () => hasContent.value && !visualizerStore.isImageDrawerOpen,
)

const openDescription = ref(true)
const toggleDescription = () => (openDescription.value = !openDescription.value)

const breakpoints = useBreakpoints(breakpointsTailwind)

const smallerThanMd = breakpoints.smaller('md')

watch(
  () => visualizerStore.selectedIndex,
  () => {
    openDescription.value = true
  },
)
</script>
