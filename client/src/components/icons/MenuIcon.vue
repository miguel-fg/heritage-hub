<template>
  <svg
    :width="`${props.width}`"
    :height="`${props.height}`"
    viewBox="0 0 19 24"
    class="fill-current"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9.5 7.5C10.3284 7.5 11 6.82843 11 6C11 5.17157 10.3284 4.5 9.5 4.5C8.67157 4.5 8 5.17157 8 6C8 6.82843 8.67157 7.5 9.5 7.5Z"
    />
    <path
      d="M9.5 13.5C10.3284 13.5 11 12.8284 11 12C11 11.1716 10.3284 10.5 9.5 10.5C8.67157 10.5 8 11.1716 8 12C8 12.8284 8.67157 13.5 9.5 13.5Z"
    />
    <path
      d="M9.5 19.5C10.3284 19.5 11 18.8284 11 18C11 17.1716 10.3284 16.5 9.5 16.5C8.67157 16.5 8 17.1716 8 18C8 18.8284 8.67157 19.5 9.5 19.5Z"
    />
  </svg>
</template>

<script setup lang="ts">
const props = defineProps<{
  width: number;
  height: number;
}>();
</script>
