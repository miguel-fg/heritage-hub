<template>
  <svg
    :width="`${props.size}`"
    :viewBox="viewBox"
    xmlns="http://www.w3.org/2000/svg"
    :class="`${props.class}`"
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M5.67416 7L0.712036 11.9621L2.03786 13.288L7.00004 8.32587L11.9622 13.288L13.288 11.9621L8.32591 7L13.2879 2.03798L11.962 0.712158L7.00004 5.67412L2.03801 0.712158L0.712186 2.03798L5.67416 7Z"
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
