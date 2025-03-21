<template>
  <div
    class="tag px-2 py-1 rounded-xs drop-shadow-xs bg-grayscale-200 text-grayscale-700 cursor-pointer hover:bg-grayscale-300 hover:text-grayscale-800 active:bg-grayscale-700 active:text-grayscale-100"
    @click="() => console.log(`Searching for ${props.content} models!`)"
  >
    {{ props.content }}
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  content: { type: String, required: true },
});
</script>
