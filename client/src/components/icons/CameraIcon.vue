<template>
  <svg
    :width="`${props.width}`"
    :height="`${props.height}`"
    :viewBox="viewBox"
    xmlns="http://www.w3.org/2000/svg"
    :class="props.class"
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M12.5415 0H6.45854L4.71688 2.7H0.791667L0 3.5V15.2L0.791667 16H18.2083L19 15.2V3.5L18.2083 2.7H14.2831L12.5415 0ZM5.57479 4.3L7.31646 1.6H11.6835L13.4252 4.3H17.4167V14.4H1.58333V4.3H5.57479ZM7.125 8.8C7.125 7.47456 8.18837 6.4 9.5 6.4C10.8116 6.4 11.875 7.47456 11.875 8.8C11.875 10.1254 10.8116 11.2 9.5 11.2C8.18837 11.2 7.125 10.1254 7.125 8.8ZM9.5 4.8C7.31387 4.8 5.54167 6.59083 5.54167 8.8C5.54167 11.0092 7.31387 12.8 9.5 12.8C11.6862 12.8 13.4583 11.0092 13.4583 8.8C13.4583 6.59083 11.6862 4.8 9.5 4.8Z"
    />
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
