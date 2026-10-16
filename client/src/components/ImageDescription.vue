<template>
  <div
    v-show="openDescription"
    class="absolute z-30 bottom-2 right-2 px-2 py-3 bg-grayscale-100/90 rounded-xs shadow-sm w-[200px] md:w-[300px] xl:w-[400px] font-poppins max-h-3/7 overflow-y-auto transition-opacity duration-150"
    :class="!visualizerStore.isImageDrawerOpen ? 'opacity-100' : 'opacity-0'"
  >
    <div v-show="openDescription" class="relative flex flex-col gap-4">
      <button
        @click="toggleDescription"
        class="absolute right-0 top-0 cursor-pointer text-grayscale-700 hover:text-grayscale-900"
      >
        <Icon icon="bx:x" width="24" />
      </button>
      <div class="flex flex-col gap-2">
        <strong
          class="font-bold text-primary-500 w-full pr-6"
          :class="
            props.description
              ? 'border-b border-grayscale-300 pb-1'
              : 'border-none pb-0'
          "
        >
          {{ props.label ?? 'Image' }}
        </strong>
        <p class="font-garamond text-grayscale-900 whitespace-pre-line">
          {{ props.description }}
        </p>
      </div>
    </div>
  </div>
  <div
    class="absolute z-50 bottom-2 right-2 p-1 flex flex-col gap-3"
    :class="!visualizerStore.isImageDrawerOpen ? 'opacity-100' : 'opacity-0'"
    v-show="!openDescription"
  >
    <button
      v-if="permissions"
      @click="emit('edit')"
      class="cursor-pointer text-grayscale-700 hover:bg-grayscale-100 hover:text-grayscale-900 active:bg-grayscale-200 active:text-grayscale-900 size-8 rounded-xs"
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
      class="cursor-pointer text-grayscale-700 hover:bg-grayscale-100 hover:text-grayscale-900 active:bg-grayscale-200 active:text-grayscale-900 size-8 rounded-xs"
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

const show = computed(
  () =>
    (props.description || props.label) && !visualizerStore.isImageDrawerOpen,
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
