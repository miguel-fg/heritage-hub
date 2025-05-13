<template>
  <button
    class="flex grow-0 shrink-0 w-fit items-center gap-1 font-medium font-poppins cursor-pointer rounded-xs"
    :class="[buttonClass, props.class]"
    :disabled="props.disabled"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { type ButtonType } from "../types/ui";

const props = defineProps<{
  type: ButtonType;
  class?: string;
  disabled?: boolean;
}>();

const buttonClass = computed(() => {
  switch (props.type) {
    case "primary":
      return "px-2 py-1 bg-primary-500 text-grayscale-100 drop-shadow-sm hover:bg-primary-600 active:bg-primary-800";
    case "secondary":
      return "px-2 py-1 bg-grayscale-300 text-grayscale-800 drop-shadow-sm hover:bg-grayscale-400 active:bg-grayscale-600 active:text-grayscale-200";
    case "success":
      return "px-2 py-1 bg-success-300 text-grayscale-900 drop-shadow-sm hover:bg-success-400 active:bg-success-700 active:text-success-100";
    case "danger":
      return "px-2 py-1 bg-danger-200 text-danger-800 drop-shadow-sm hover:bg-danger-300 active:bg-danger-700 active:text-danger-100";
    case "ghost":
      return "px-0 py-0 bg-transparent text-grayscale-500 hover:text-grayscale-800 hover:underline active:font-bold active:text-primary-500 active:underline";
    case "ghost-icon":
      return "px-0 py-1 bg-transparent text-grayscale-700 hover:text-grayscale-900 hover:underline active:font-bold active:text-primary-500 active:underline";
    case "search":
      return "px-2 py-1 bg-transparent border border-grayscale-300 text-grayscale-500 grow-1";
    case "outline":
      return "px-2 py-1 bg-transparent border border-primary-300 text-primary-500";
  }
});
</script>
