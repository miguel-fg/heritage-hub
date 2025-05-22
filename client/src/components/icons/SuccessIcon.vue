<template>
  <svg
    :width="`${props.width}`"
    :height="computedHeight"
    viewBox="0 0 15 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M14.4509 1.64394L4.41291 11.6818L0 7.26895L1.32582 5.94308L4.41291 9.0302L13.125 0.318115L14.4509 1.64394Z"
      fill="#38BC7D"
    />
  </svg>
</template>

<script setup lang="ts">
import { computed } from "vue";
const props = defineProps<{
  width: number;
}>();

const computedHeight = computed(() => (props.width * 4) / 5);
</script>
