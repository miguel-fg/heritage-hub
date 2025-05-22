<template>
  <svg
    :width="`${props.width}`"
    :height="`${props.height}`"
    :viewBox="viewBox"
    :class="props.class"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M8.43757 12.4241L12.4622 8.39962L13.7879 9.72537L7.50007 16.0134L1.21216 9.72537L2.53798 8.39962L6.56257 12.4241V0.625H8.43757V12.4241Z"
    />
    <path d="M15 17.5V19.375H0V17.5H15Z" />
  </svg>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  width: number;
  height: number;
  class?: string;
}>();

const viewBox = computed(() => {
  return `0 0 ${props.width} ${props.height}`;
});
</script>
