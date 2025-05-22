<template>
  <svg
    :width="`${props.width}`"
    :height="`${props.height}`"
    viewBox="0 0 19 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M6.4144 18L5.56767 15.6429L5.048 15.2219C3.41425 13.8984 2.375 11.8726 2.375 9.6C2.375 5.62355 5.56497 2.4 9.5 2.4C13.4351 2.4 16.625 5.62355 16.625 9.6C16.625 11.8726 15.5857 13.8984 13.952 15.2219L13.4324 15.6429L12.5856 18H6.4144ZM4.75 20.4H14.25L15.4375 17.0944C17.6094 15.335 19 12.6317 19 9.6C19 4.29806 14.7467 0 9.5 0C4.25329 0 0 4.29806 0 9.6C0 12.6317 1.39066 15.335 3.5625 17.0944L4.75 20.4ZM13.0625 24V21.6H5.9375V24H13.0625Z"
      fill="#0F6790"
    />
  </svg>
</template>

<script setup lang="ts">
const props = defineProps<{
  width: number;
  height: number;
}>();
</script>
