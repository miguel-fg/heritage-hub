<template>
  <div
    class="tag px-2 py-1 rounded-xs drop-shadow-xs bg-grayscale-200 text-grayscale-700 cursor-pointer active:bg-grayscale-700 active:text-grayscale-100"
    @click="() => console.log(`Searching for ${formatted} models!`)"
  >
    {{ formatted }}
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps({
  content: { type: String, required: true },
});

const formatted = computed(() => {
  return props.content
    .split(/([-/])/)
    .map((part, index, array) => {
      if (part === "-" || part === "/") {
        return part;
      }

      return part
        .split(" ")
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        )
        .join(" ");
    })
    .join("");
});
</script>
