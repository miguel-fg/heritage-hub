<template>
  <div class="flex items-center gap-2 w-full">
    <div class="flex items-center gap-1 grow-1 min-w-0">
      <Icon
        v-if="isPdf"
        icon="bx:file"
        width="40"
        height="40"
        class="text-grayscale-500"
      />
      <Icon
        v-else
        icon="bx:image"
        width="40"
        height="40"
        class="text-grayscale-500"
      />
      <div class="flex flex-col gap-1 grow-1 min-w-0">
        <div
          class="flex justify-between items-end font-poppins text-grayscale-900"
        >
          <span class="truncate min-w-0">{{ truncatedName }}</span>
          <span class="text-xs font-poppins text-grayscale-600"
            >{{ props.progress }}%</span
          >
        </div>
        <div class="relative w-full h-[3px] bg-grayscale-300 rounded-full">
          <div
            class="absolute top-0 left-0 h-full bg-primary-500 rounded-full transition-all duration-300"
            :style="{ width: `${props.progress}%` }"
          />
        </div>
      </div>
    </div>
    <Icon
      v-if="props.error || props.progress !== 100"
      icon="bx:x-circle"
      width="28"
      height="28"
      class="text-danger-500"
    />
    <Icon
      v-else
      icon="bx:check-circle"
      width="28"
      height="28"
      class="text-success-600"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'

const props = defineProps<{
  file: File
  progress: number
  error?: boolean
}>()

const isPdf = computed(() => props.file.type === 'application/pdf')

const truncatedName = computed(() => {
  const name = props.file.name
  const lastDot = name.lastIndexOf('.')

  if (lastDot === -1) {
    if (name.length <= 20) return name

    return name.slice(0, 20) + '...'
  }

  const ext = name.slice(lastDot)
  const base = name.slice(0, lastDot)

  if (base.length <= 20) return name
  return base.slice(0, 20) + '...' + ext
})
</script>
