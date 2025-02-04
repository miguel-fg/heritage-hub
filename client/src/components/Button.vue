<template>
  <button
    class="flex grow-0 shrink-0 w-fit items-center gap-1 font-medium font-poppins cursor-pointer rounded-xs"
    :class="[buttonClass, props.class]"
    @click="() => emit('clicked')"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps({
  type: { type: String, required: true },
  class: String,
});

const emit = defineEmits(["clicked"]);

const buttonClass = computed(() => {
  switch (props.type) {
    case "primary":
      return "px-2 py-1 bg-primary-500 text-grayscale-100 drop-shadow-sm";
    case "secondary":
      return "px-2 py-1 bg-grayscale-300 text-grayscale-800 drop-shadow-sm";
    case "ghost":
      return "px-0 py-0 bg-transparent text-grayscale-700 underline";
    case "search":
      return "px-2 py-1 bg-transparent outline -outline-offset-1 outline-grayscale-300 text-grayscale-500 grow-1";
  }
});
</script>
