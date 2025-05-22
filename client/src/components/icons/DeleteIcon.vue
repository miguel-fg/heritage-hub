<template>
  <svg
    :width="`${props.width}`"
    :height="`${props.height}`"
    viewBox="0 0 10 12"
    xmlns="http://www.w3.org/2000/svg"
    class="fill-current"
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M2.5 0V1.2H0V2.4H10V1.2H7.5V0H2.5ZM0.625 3H1.875V10.5514L2.13388 10.8H7.86608L8.125 10.5514V3H9.375V11.0486L8.38392 12H1.61612L0.625 11.0486V3Z"
    />
  </svg>
</template>

<script setup lang="ts">
const props = defineProps<{
  width: number;
  height: number;
}>();
</script>
