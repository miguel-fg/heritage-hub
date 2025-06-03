<template>
  <div class="flex flex-col gap-2">
    <span>{{ props.label }}</span>

    <!-- Custom slider -->
    <div
      ref="track"
      class="relative w-full h-3 bg-grayscale-200 rounded cursor-pointer"
      @mousedown="startDrag"
      @touchstart.prevent="startDrag"
    >
      <!-- Filled portion -->
      <div
        class="absolute h-full bg-primary-400 rounded"
        :style="{ width: `${percent}%` }"
      ></div>

      <!-- Custom thumb -->
      <div
        class="absolute w-3 h-3 bg-white rounded-xs shadow -translate-x-1/2 -translate-y-1/2 top-1/2 pointer-events-none"
        :style="{ left: `${percent}%` }"
      ></div>
    </div>

    <!-- Hidden input for integration -->
    <input
      type="range"
      class="hidden"
      :min="props.min"
      :max="props.max"
      v-model="current"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, useTemplateRef } from "vue";
const props = defineProps({
  min: { type: Number, default: 0 },
  max: { type: Number, default: 100 },
  label: { type: String, required: true },
});

const current = defineModel<number>();

const percent = computed(
  () => ((current.value! - props.min) / (props.max - props.min)) * 100,
);

const track = useTemplateRef("track");

const updateValue = (clientX: number) => {
  if (!track.value) return;

  const rect = track.value.getBoundingClientRect();
  const x = clientX - rect.left;
  const ratio = Math.min(Math.max(x / rect.width, 0), 1);
  const newValue = Math.round(props.min + ratio * (props.max - props.min));

  current.value = newValue;
};

const startDrag = (e: MouseEvent | TouchEvent) => {
  const move = (ev: MouseEvent | TouchEvent) => {
    const clientX = "touches" in ev ? ev.touches[0].clientX : ev.clientX;
    updateValue(clientX);
  };

  const up = () => {
    window.removeEventListener("mousemove", move);
    window.removeEventListener("mouseup", up);
    window.removeEventListener("touchmove", move);
    window.removeEventListener("touchend", up);
  };

  window.addEventListener("mousemove", move);
  window.addEventListener("mouseup", up);
  window.addEventListener("touchmove", move);
  window.addEventListener("touchend", up);

  move(e);
};
</script>
