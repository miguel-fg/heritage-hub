<template>
  <svg
    :width="`${props.width}`"
    :height="`${props.height}`"
    viewBox="0 0 13 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M4.96212 6.99987L0 11.962L1.32582 13.2879L6.288 8.32575L11.2501 13.2879L12.576 11.962L7.61388 6.99987L12.5759 2.03786L11.25 0.712036L6.288 5.674L1.32598 0.712036L0.000149608 2.03786L4.96212 6.99987Z"
      fill="#EF331A"
    />
  </svg>
</template>

<script setup lang="ts">
const props = defineProps<{
  width: number;
  height: number;
}>();
</script>
