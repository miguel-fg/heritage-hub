<template>
  <svg
    :width="`${props.size}`"
    :height="`${props.size}`"
    :viewBox="viewBox"
    :class="props.class"
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M7 9V16H9V9H16V7H9V0H7V7H0V9H7Z"
    />
  </svg>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  size: number;
  class?: string;
}>();

const viewBox = computed(() => {
  return `0 0 ${props.size} ${props.size}`;
});
</script>
