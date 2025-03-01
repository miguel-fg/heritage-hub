<template>
  <button
    class="flex grow-0 shrink-0 w-fit items-center gap-1 font-medium font-poppins cursor-pointer rounded-xs"
    :class="[buttonClass, props.class]"
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

const buttonClass = computed(() => {
  switch (props.type) {
    case "primary":
      return "px-2 py-1 bg-primary-500 text-grayscale-100 drop-shadow-sm hover:bg-primary-600 active:bg-primary-800";
    case "secondary":
      return "px-2 py-1 bg-grayscale-300 text-grayscale-800 drop-shadow-sm hover:bg-grayscale-400 active:bg-grayscale-600 active:text-grayscale-200";
    case "danger":
      return "px-2 py-1 bg-danger-200 text-danger-800 drop-shadow-sm hover:bg-danger-300 active:bg-danger-700 active:text-danger-100";
    case "ghost":
      return "px-0 py-0 bg-transparent text-grayscale-500 hover:text-grayscale-800 active:font-bold active:text-primary-500";
    case "search":
      return "px-2 py-1 bg-transparent outline -outline-offset-1 outline-grayscale-300 text-grayscale-500 grow-1";
  }
});
</script>
