<template>
  <svg
    :width="`${props.size}`"
    :height="`${props.size}`"
    viewBox="0 0 12 12"
    class="fill-current"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M3.434 12L12 3.43401L8.56597 0L0 8.56603V12H3.434ZM8.56597 1.51427L10.4857 3.43401L9.10134 4.81841L7.18163 2.89865L8.56597 1.51427ZM6.42447 3.65578L8.34425 5.5755L2.99048 10.9292H1.07075V9.00954L6.42447 3.65578Z"
    />
  </svg>
</template>

<script setup lang="ts">
const props = defineProps<{
  size: number;
}>();
</script>
