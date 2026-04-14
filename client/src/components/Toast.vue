<template>
  <div
    class="relative flex align-center items-center p-4 gap-3 rounded-sm shadow-md bg-white w-80 sm:w-100 md:w-150 overflow-hidden"
    @mouseenter="pauseCountdown"
    @mouseleave="resumeCountdown"
  >
    <Icon
      :icon="props.type === 'success' ? 'bx:check-circle' : 'bx:x-circle'"
      :class="props.type === 'success' ? 'text-success-500' : 'text-danger-500'"
      width="40"
    />
    <div class="w-full">
      <span class="subtitle text-grayscale-900">{{ toastHeader }}</span>
      <p class="font-poppins font-medium text-grayscale-700">
        {{ props.message }}
      </p>
    </div>
    <button
      @click="dismiss"
      class="text-grayscale-500 hover:text-grayscale-800 cursor-pointer transition-colors duration-150"
    >
      <Icon icon="bx:x" width="32" />
    </button>
    <div
      class="absolute bottom-0 left-0 h-1 transition-none"
      :class="props.type === 'success' ? 'bg-success-500' : 'bg-danger-500'"
      :style="{ width: `${progress}%` }"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { Icon } from '@iconify/vue'
import { useToastStore } from '../stores/toastStore'

const props = defineProps<{
  id: number
  type: 'success' | 'error'
  message: string
  duration: number
}>()

const toastStore = useToastStore()

const toastHeader = computed(
  () => props.type.charAt(0).toUpperCase() + props.type.substring(1) + '!',
)

const progress = ref(100)
const remaining = ref(props.duration)
const startTime = ref<number | null>(null)
const rafId = ref<number | null>(null)

const tick = (timestamp: number) => {
  if (!startTime.value) {
    startTime.value = timestamp
  }

  const elapsed = timestamp - startTime.value
  remaining.value = Math.max(0, remaining.value - elapsed)
  progress.value = (remaining.value / props.duration) * 100
  startTime.value = timestamp

  if (remaining.value <= 0) {
    dismiss()
    return
  }

  rafId.value = requestAnimationFrame(tick)
}

const startCountdown = () => {
  startTime.value = null
  rafId.value = requestAnimationFrame(tick)
}

const pauseCountdown = () => {
  if (rafId.value !== null) {
    cancelAnimationFrame(rafId.value)
    rafId.value = null
    startTime.value = null
  }
}

const resumeCountdown = () => {
  if (rafId.value === null) {
    startCountdown()
  }
}

const dismiss = () => {
  pauseCountdown()
  toastStore.dismissToast(props.id)
}

onMounted(() => startCountdown())
onUnmounted(() => pauseCountdown())
</script>
